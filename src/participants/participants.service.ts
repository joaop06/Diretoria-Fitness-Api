import * as moment from 'moment';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { UsersEntity } from '../users/entities/users.entity';
import { LevelEnum } from '../system-logs/enum/log-level.enum';
import { ParticipantsEntity } from './entities/participants.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';
import { TrainingBetEntity } from '../training-bets/entities/training-bet.entity';

@Injectable()
export class ParticipantsService {
  private logger: Logger;

  constructor(
    @InjectRepository(ParticipantsEntity)
    private participantsRepository: Repository<ParticipantsEntity>,

    @InjectRepository(TrainingBetEntity)
    private trainingBetRepository: Repository<TrainingBetEntity>,

    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,

    private systemLogsService: SystemLogsService,
  ) {
    this.logger = new Logger();
  }

  async create(object: CreateParticipantDto): Promise<ParticipantsEntity> {
    try {
      const { userId, trainingBetId } = object;

      // Busca do usuário para participação
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) throw new Error(`Usuário não encontrado`);

      // Busca da aposta
      const trainingBet = await this.trainingBetRepository.findOne({
        where: { id: trainingBetId },
      });
      if (!trainingBet) throw new Error(`Aposta não encontrada`);

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
    }
  }

  async update(id: number, object: Partial<ParticipantsEntity>) {
    try {
      return await this.participantsRepository.update(id, object);
    } catch (e) {
      throw e;
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
      const betDaysComplete = betDays.filter(
        (betDay) =>
          today.startOf('day').isAfter(moment(betDay.day)) &&
          (today.format('DD') !== moment(betDay.day).format('DD') ||
            (today.format('MM') !== moment(betDay.day).format('MM') &&
              today.format('DD') === moment(betDay.day).format('DD'))),
      );

      const quantityBetDays = betDaysComplete.length;
      const quantityTraining = trainingReleases.length;

      const totalFaults = quantityBetDays - quantityTraining;

      // Cálculo do aproveitamento em percentual
      const utilization = parseFloat(
        (100 - (totalFaults / betDaysComplete.length) * 100).toFixed(2),
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
}
