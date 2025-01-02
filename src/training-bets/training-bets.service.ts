import { config } from 'dotenv';
config();

import * as moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { readFiles } from '../../helper/read.files';
import { Repository, FindManyOptions } from 'typeorm';
import { UsersService } from '../users/users.service';
import { TrainingBetsStatusEnum } from './enum/status.enum';
import { UsersEntity } from '../users/entities/users.entity';
import { BetDaysService } from '../bet-days/bet-days.service';
import { CronJobsService } from '../cron-jobs/cron-jobs.service';
import { TrainingBetEntity } from './entities/training-bet.entity';
import { CreateTrainingBetDto } from './dto/create-training-bet.dto';
import { Exception } from '../../public/interceptors/exception.filter';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { isAfter, isBefore, validateDaysComplete } from '../../helper/dates';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';

@Injectable()
export class TrainingBetsService {
  private logger = new Logger();

  constructor(
    @InjectRepository(TrainingBetEntity)
    private readonly trainingBetRepository: Repository<TrainingBetEntity>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly betDaysService: BetDaysService,
  ) {}

  async validateTrainingBetStatus(
    trainingBetId: number,
    todayDate: moment.Moment,
  ): Promise<TrainingBetsStatusEnum> {
    const trainingBet = await this.findById(trainingBetId, {
      relations: ['betDays'],
    });
    const { status, initialDate, finalDate, betDays } = trainingBet;

    const todayFormat = todayDate.format('YYYY-MM-DD');
    const completed =
      betDays.length === validateDaysComplete(betDays, todayDate).length;

    const inProgress =
      isAfter(finalDate, todayFormat, 'days') &&
      (initialDate === todayFormat ||
        isBefore(initialDate, todayFormat, 'days'));

    if (completed) return TrainingBetsStatusEnum.ENCERRADA;
    else if (inProgress) return TrainingBetsStatusEnum.EM_ANDAMENTO;
    else return status;
  }

  async validateUserLossesAndWins(
    userId: number,
  ): Promise<Partial<UsersEntity>> {
    try {
      /**
       * Montagem da query diretamente com o filtro do usuário
       */
      const trainingBets = await this.trainingBetRepository
        .createQueryBuilder('traningBet')
        .leftJoinAndSelect('traningBet.participants', 'participants')
        .leftJoinAndSelect('participants.user', 'users')
        .where('traningBet.status IN (:...statuses)', {
          statuses: ['Encerrada', 'Em Andamento'],
        })
        .andWhere('participants.user.id = :userId', { userId })
        .getMany();

      /**
       * Valida dentre cada aposta, todos os participantes.
       *  - Derrota: se foi desclassificado.
       *  - Vitória: se NÃO foi desclassificado e a aposta está ENCERRADA.
       */
      const result: Partial<UsersEntity> = { wins: 0, losses: 0 };

      for (const trainingBet of trainingBets) {
        const { status, participants } = trainingBet;

        participants.forEach((participant) => {
          const { declassified } = participant;

          if (declassified === true) {
            result.losses += 1;
          } else if (declassified === false && status === 'Encerrada') {
            result.wins += 1;
          }
        });
      }

      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private async validatePeriodConflict(object: Partial<TrainingBetEntity>) {
    let conflict: TrainingBetEntity | null;
    if (object.id) {
      conflict = await this.trainingBetRepository
        .createQueryBuilder('training_bets')
        .where('training_bets.initialDate < :finalDate', {
          finalDate: object.finalDate,
        })
        .andWhere('training_bets.finalDate > :initialDate', {
          initialDate: object.initialDate,
        })
        .andWhere('training_bets.id != :id', { id: object.id })
        .getOne();
    } else {
      conflict = await this.trainingBetRepository
        .createQueryBuilder('training_bets')
        .where('training_bets.initialDate < :finalDate', {
          finalDate: object.finalDate,
        })
        .andWhere('training_bets.finalDate > :initialDate', {
          initialDate: object.initialDate,
        })
        .getOne();
    }

    if (!!conflict) {
      throw new Error('Já existe uma aposta entre o período informado');
    }
  }

  private validateBetStarted(initialDate: Date | string) {
    const now = moment();
    const currDay = parseInt(now.format('DD'));
    const currMonth = parseInt(now.format('MM'));
    const currYear = parseInt(now.format('YYYY'));

    const initialDateMoment = moment(initialDate);
    const day = parseInt(initialDateMoment.format('DD'));
    const month = parseInt(initialDateMoment.format('MM'));
    const year = parseInt(initialDateMoment.format('YYYY'));

    if (
      year < currYear ||
      (year === currYear && month < currMonth) ||
      (year === currYear && month === currMonth && day <= currDay)
    ) {
      throw new Error(
        'A aposta não pode ser agendada para a data atual ou anterior',
      );
    }
  }

  private defineDuration(object: Partial<TrainingBetEntity>) {
    // +1 para considerar também o dia atual
    const duration =
      moment(object.finalDate).diff(object.initialDate, 'days') + 1;

    return { ...object, duration };
  }

  private async syncBetDays(
    trainingBetId: number,
    duration: number,
    initialDate: Date | string,
  ) {
    const trainingBet = await this.findById(trainingBetId);
    const existingBetDays =
      await this.betDaysService.findAllByTrainingBetId(trainingBetId);

    const betDays = [];
    const currentCount = existingBetDays.length;
    for (let i = 0; i < duration; i++) {
      const currentDay = moment(initialDate).locale('pt-br').add(i, 'days');

      const day = currentDay.format('YYYY-MM-DD');
      const unformattedName = currentDay.format('ddd');
      const name = unformattedName[0].toUpperCase() + unformattedName.slice(1);

      betDays.push({ day, name, trainingBet });
    }

    const toCreate = [];
    const toDelete = [];

    /**
     * Por mais que identifique a mesma quantidade de dias,
     * se houver algum dia diferente, irá recalcular
     */
    const differentDays = betDays.some(
      (betDay) =>
        !existingBetDays.find((existDay) => existDay.day === betDay.day),
    );

    if (duration > currentCount || differentDays) {
      /**
       * Se a nova duração é maior que a quantidade atual de dias
       */
      toCreate.push(
        ...betDays.filter(
          (betDay) =>
            !existingBetDays.some((existDay) => existDay.day === betDay.day),
        ),
      );
    }

    if (duration < currentCount || differentDays) {
      /**
       * Deleta os dias sobressalentes a nova duração da aposta
       */
      toDelete.push(
        ...existingBetDays
          .filter(
            (existDay) =>
              !betDays.some((betDay) => betDay.day === existDay.day),
          )
          .map((day) => day.id),
      );
    }

    if (toDelete.length) await this.betDaysService.bulkDelete(toDelete);
    if (toCreate.length) await this.betDaysService.bulkCreate(toCreate);
  }

  async create(object: CreateTrainingBetDto): Promise<TrainingBetEntity> {
    try {
      if (moment(object.initialDate).isAfter(moment(object.finalDate))) {
        throw new Error(`Período da aposta inválido`);
      }

      // Valida se há conflito das datas
      await this.validatePeriodConflict(object);

      // Valida se a aposta já foi iniciada
      this.validateBetStarted(object.initialDate);

      const newObject = this.defineDuration(object);
      const newTrainingBet = this.trainingBetRepository.create(newObject);
      const result = await this.trainingBetRepository.save(newTrainingBet);

      await this.syncBetDays(result.id, result.duration, object.initialDate);

      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async update(id: number, object: Partial<TrainingBetEntity>) {
    try {
      if (object.initialDate && object.finalDate) {
        const { initialDate, finalDate } = object;
        const initialIsAfterFinal = moment(initialDate).isAfter(
          moment(finalDate),
        );
        if (initialIsAfterFinal)
          throw new Error(
            `Período inválido. Data inicial deve ser menor que a data final.`,
          );
      }

      const trainingBet = await this.findById(id);
      if (!trainingBet) throw new Error('Aposta não encontrada');

      let newTrainingBet: Partial<TrainingBetEntity> = {
        ...object,
        finalDate: object.finalDate ?? trainingBet.finalDate,
        initialDate: object.initialDate ?? trainingBet.initialDate,
      };

      // Valida se há conflito das datas
      await this.validatePeriodConflict({ id, ...newTrainingBet });

      // Valida se a aposta já foi iniciada
      if (object.initialDate) this.validateBetStarted(object.initialDate);

      if (['Em Andamente', 'Encerrada'].includes(trainingBet.status)) {
        throw new Error(
          `Não é possível editar uma aposta ${trainingBet.status.toLowerCase()}`,
        );
      }

      newTrainingBet = this.defineDuration(newTrainingBet);
      const result = await this.trainingBetRepository.update(
        id,
        newTrainingBet,
      );

      await this.syncBetDays(
        id,
        newTrainingBet.duration,
        newTrainingBet.initialDate,
      );

      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    } finally {
      /** Atualiza estatísticas da Aposta */
      await CronJobsService.updateStatisticsBets(id);
    }
  }

  async delete(id: number): Promise<any> {
    const userIds: number[] = [];
    try {
      userIds.push(...(await this.getUsersParticipantsFromBet(id)));

      const result = await this.trainingBetRepository.delete(id);

      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    } finally {
      // Atualiza a pontuação do usuário com o novo treino realizado
      await CronJobsService.updateStatisticsRanking();
    }
  }

  async findById(
    id: number,
    options?:
      | FindOptionsDto<TrainingBetEntity>
      | FindManyOptions<TrainingBetEntity>,
  ): Promise<TrainingBetEntity> {
    try {
      const trainingBet = await this.trainingBetRepository.findOne({
        ...options,
        where: { id },
      });

      return trainingBet;
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number): Promise<TrainingBetEntity> {
    try {
      const trainingBet = await this.trainingBetRepository.findOne({
        where: { id },
        relations: [
          'participants',
          'participants.user',
          'betDays',
          'betDays.trainingReleases',
          'betDays.trainingReleases.participant',
          'betDays.trainingReleases.participant.user',
        ],
        select: {
          participants: {
            id: true,
            faults: true,
            utilization: true,
            declassified: true,
            user: {
              id: true,
              name: true,
              wins: true,
              losses: true,
              profileImagePath: true,
            },
          },
          betDays: {
            id: true,
            day: true,
            name: true,
            totalFaults: true,
            utilization: true,
            trainingReleases: {
              id: true,
              comment: true,
              imagePath: true,
              trainingType: true,
              participant: {
                id: true,
                faults: true,
                utilization: true,
                declassified: true,
                user: {
                  id: true,
                  name: true,
                  profileImagePath: true,
                },
              },
            },
          },
        },
      });

      if (!trainingBet)
        new Exception({ status: 404, message: 'Aposta não encontrada' });

      /**
       * Faz a Leitura das imagens dos usuários participantes
       */
      trainingBet.participants = trainingBet.participants.map((participant) => {
        if (participant?.user?.profileImagePath !== undefined) {
          participant.user.profileImagePath = readFiles(
            participant.user.profileImagePath,
          );
        }

        return participant;
      });

      /**
       * Faz a Leitura das imagens de treinos e dos usuários
       */
      trainingBet.betDays = trainingBet.betDays.map((day) => {
        day.trainingReleases = day.trainingReleases.map((training) => {
          training.imagePath = readFiles(training.imagePath);

          if (training?.participant?.user?.profileImagePath !== undefined) {
            training.participant.user.profileImagePath = readFiles(
              training.participant.user.profileImagePath,
            );
          }

          return training;
        });

        return day;
      });

      return trainingBet;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async findAll(
    options:
      | FindOptionsDto<TrainingBetEntity>
      | FindManyOptions<TrainingBetEntity>,
  ): Promise<FindReturnModelDto<TrainingBetEntity>> {
    const [rows, count] =
      await this.trainingBetRepository.findAndCount(options);
    return { rows, count };
  }

  async getUsersParticipantsFromBet(betId: number): Promise<number[]> {
    try {
      const bet = await this.findById(betId, {
        relations: { participants: true },
      });
      const userIds = bet.participants.map((participant) => participant.userId);

      return userIds;
    } catch (e) {
      throw e;
    }
  }
}
