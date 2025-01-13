import * as moment from 'moment';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { readFiles } from '../../helper/read.files';
import { UsersService } from '../users/users.service';
import { validateDaysComplete } from '../../helper/dates';
import { UsersEntity } from '../users/entities/users.entity';
import { LevelEnum } from '../system-logs/enum/log-level.enum';
import { Exception } from '../../interceptors/exception.filter';
import { CronJobsService } from '../cron-jobs/cron-jobs.service';
import { ParticipantsEntity } from './entities/participants.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdatePenaltyPaidDto } from './dto/update-penalty-paid.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { FindOptionsDto, FindReturnModelDto } from '../../dtos/find.dto';
import { TrainingBetEntity } from '../training-bets/entities/training-bet.entity';
import { TrainingBetsStatusEnum } from '../../modules/training-bets/enum/status.enum';

@Injectable()
export class ParticipantsService {
  private logger = new Logger();

  constructor(
    @InjectRepository(ParticipantsEntity)
    private participantsRepository: Repository<ParticipantsEntity>,

    @InjectRepository(TrainingBetEntity)
    private trainingBetRepository: Repository<TrainingBetEntity>,

    private systemLogsService: SystemLogsService,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async create(object: CreateParticipantDto): Promise<ParticipantsEntity> {
    try {
      const { userId, trainingBetId } = object;

      // Busca do usuário para participação
      const user = (await this.usersService.findOne(userId)) as UsersEntity;
      if (!user) throw new Error(`Usuário não encontrado`);

      // Busca da aposta
      const trainingBet = await this.trainingBetRepository.findOne({
        where: { id: trainingBetId },
      });
      if (!trainingBet) throw new Error(`Aposta não encontrada`);

      /**
       * Verifica se o usuário possui
       * penalidades não pagas de outras apostas
       */
      await this.verifyIfHasUnpaidPenalty(object.userId);

      /**
       * Validação de início da aposta
       * para não incluir participante em aposta em andamento
       */
      const today = moment();
      const initialDate = moment(trainingBet.initialDate);
      if (today.isAfter(initialDate)) {
        throw new Error(`Não é possível participar de uma aposta em andamento`);
      }

      const foundParticipant = await this.participantsRepository.findOne({
        relations: ['user', 'trainingBet'],
        where: { user: { id: user.id }, trainingBet: { id: trainingBet.id } },
      });
      if (foundParticipant) {
        const errorMessage = `${user.name} já é participante da aposta`;
        throw Object.assign(new Error(errorMessage), { statusCode: 409 });
      }

      const newParticipant = this.participantsRepository.create({
        user,
        trainingBet,
      });

      return await this.participantsRepository.save(newParticipant);
    } catch (e) {
      throw e;
    } finally {
      // Atualiza a pontuação do usuário com o novo treino realizado
      await CronJobsService.updateStatisticsRanking(object.userId);
    }
  }

  async verifyIfHasUnpaidPenalty(userId: number) {
    const trainingBetsCloseds = await this.trainingBetRepository.find({
      relations: { participants: true },
      where: {
        status: TrainingBetsStatusEnum.ENCERRADA,
        participants: { userId: userId, declassified: true },
      },
    });
    const hasUnpaidPenalty = trainingBetsCloseds.find((trainingBet) =>
      trainingBet.participants.find(
        (participant) => participant.penaltyPaid === false,
      ),
    );

    if (hasUnpaidPenalty)
      throw new Error(`Penalidade não paga na Aposta ${hasUnpaidPenalty.id}`);
  }

  async update(id: number, object: Partial<ParticipantsEntity>) {
    try {
      return await this.participantsRepository.update(id, object);
    } catch (e) {
      throw e;
    } finally {
      // Atualiza a pontuação do usuário com o novo treino realizado
      await CronJobsService.updateStatisticsRanking(object.userId);
    }
  }

  async findOne(id: number): Promise<ParticipantsEntity> {
    try {
      return await this.participantsRepository.findOne({
        where: { id },
        relations: ['user', 'trainingBet'],
        select: {
          user: {
            id: true,
            name: true,
          },
          trainingBet: {
            id: true,
            status: true,
            duration: true,
            faultsAllowed: true,
          },
        },
      });
    } catch (e) {
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<ParticipantsEntity>,
  ): Promise<FindReturnModelDto<ParticipantsEntity>> {
    try {
      const [rows, count] =
        await this.participantsRepository.findAndCount(options);
      return { rows, count };
    } catch (e) {
      throw e;
    }
  }

  async getTotalParticipations(userId: number) {
    return await this.participantsRepository.count({
      where: { user: { id: userId } },
    });
  }

  async getTotalFaultsFromUser(userId: number): Promise<number> {
    try {
      const participants = await this.participantsRepository.find({
        where: {
          user: {
            id: userId,
          },
        },
      });

      return participants.reduce((acc, curr) => (acc += curr.faults), 0);
    } catch (e) {
      throw { ...e, message: 'Falha ao buscar dados do participante' };
    }
  }

  async updateUtilization(participantId: number) {
    try {
      const participant = await this.participantsRepository.findOne({
        where: { id: participantId },
        relations: ['trainingBet', 'trainingReleases', 'trainingBet.betDays'],
      });

      const {
        trainingBet: { betDays },
        trainingReleases,
      } = participant;

      const today = moment().add(1, 'days'); // +1 dia para considerar o dia atual
      const completeBettingDays = validateDaysComplete(betDays, today);

      const quantityBetDays = completeBettingDays.length;
      const quantityTraining = trainingReleases.length;

      const totalFaults = quantityBetDays - quantityTraining;

      // Cálculo do aproveitamento em percentual
      const utilization = parseFloat(
        (100 - (totalFaults / completeBettingDays.length) * 100).toFixed(2),
      );

      // Atualiza o registro do dia
      await this.update(participant.id, {
        utilization: isNaN(utilization) ? 0 : utilization,
      });
    } catch (e) {
      this.logger.error(e);
      await this.systemLogsService.upsert({
        level: LevelEnum.ERROR,
        message: `Falha ao atualizar aproveitamento do participante ${participantId}`,
      });
    }
  }

  async findParticipantsByTrainingBet(betId: number) {
    try {
      const trainingBet = await this.trainingBetRepository.findOne({
        relations: { participants: { user: true } },
        where: {
          id: betId,
        },
        select: {
          participants: {
            id: true,
            faults: true,
            utilization: true,
            penaltyPaid: true,
            declassified: true,
            user: {
              id: true,
              name: true,
              wins: true,
              losses: true,
              profileImagePath: true,
            },
          },
        },
      });
      if (!trainingBet) new Exception('Aposta não encontrada');
      const { minimumPenaltyAmount } = trainingBet;

      /**
       * Monta a listagem de participantes
       */
      type Participant = ParticipantsEntity & { penaltyAmount?: number };
      const participants: Participant[] = trainingBet.participants.map(
        (participant) =>
          plainToClass(ParticipantsEntity, {
            ...participant,
            user: {
              ...participant.user,
              // Faz a Leitura das imagens dos usuários participantes
              profileImagePath: readFiles(participant?.user?.profileImagePath),
            },
          }),
      );

      /**
       * Encontra a quantidade de participantes desclassificados
       * para calcular o valor da penalidade individual.
       */
      const quantityDeclassifiedParticipants = participants.reduce(
        (acc, curr) => {
          if (curr.declassified === true) acc++;
          return acc;
        },
        0,
      );

      /**
       * Se houver participantes desclassificados,
       * calcula o valor da penalidade individual.
       */
      if (quantityDeclassifiedParticipants) {
        const penaltyAmount = parseFloat(
          (+minimumPenaltyAmount / quantityDeclassifiedParticipants).toFixed(2),
        );
        participants.forEach((participant) => {
          const { declassified } = participant;
          participant.penaltyAmount = declassified ? penaltyAmount : null;
        });
      }

      return participants;
    } catch (e) {
      throw e;
    }
  }

  async findWinningParticipants(betId: number) {
    try {
      let participants = [];
      const trainingBet = await this.trainingBetRepository.findOne({
        relations: { participants: { user: true } },
        where: {
          id: betId,
          participants: { declassified: false },
        },
        select: {
          participants: {
            id: true,
            user: {
              id: true,
              name: true,
              wins: true,
              losses: true,
              profileImagePath: true,
            },
          },
        },
      });

      if (
        !trainingBet ||
        trainingBet.status !== TrainingBetsStatusEnum.ENCERRADA
      ) {
        return participants;
      }

      /**
       * Faz a Leitura das imagens dos usuários participantes
       */
      participants = trainingBet.participants.map((participant) => {
        if (participant?.user?.profileImagePath !== undefined) {
          participant.user.profileImagePath = readFiles(
            participant.user.profileImagePath,
          );
        }

        return participant;
      });

      return participants;
    } catch (e) {
      throw e;
    }
  }

  async updatePenaltyPaid(userId: number, object: UpdatePenaltyPaidDto) {
    try {
      const { participantId, trainingBetId } = object;

      const trainingBet = await this.trainingBetRepository.findOne({
        where: { id: trainingBetId },
        relations: { participants: true },
      });
      if (trainingBet.status !== TrainingBetsStatusEnum.ENCERRADA) {
        new Exception('Aposta não está encerrada');
      }

      /**
       * Verifica se o usuário requisitante é um ganhador
       * para poder confimar o pagamento de um usuário desclassificado
       */
      const userIsWinner = trainingBet.participants.some(
        (participant) =>
          participant.userId === userId && participant.declassified === false,
      );
      if (!userIsWinner) {
        new Exception(
          'Usuário não participa desta aposta ou foi desclassificado',
        );
      }

      /**
       * Verifica se o participante informado
       * realmente está desclassificado
       */
      const participant = trainingBet.participants.find(
        (p) => p.id === participantId,
      );
      if (!participant) new Exception('Participante não encontrado');
      if (participant.declassified === false)
        new Exception('Participante não está desclassificado');

      // Atualiza o participante como tendo pago a penalidade
      return await this.participantsRepository.update(participantId, {
        penaltyPaid: true,
      });
    } catch (e) {
      throw e;
    }
  }
}
