import * as dotenv from 'dotenv';
dotenv.config();

import * as moment from 'moment';
import { StatusEnum } from './enum/status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { readFiles } from '../../helper/read.files';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Repository, FindManyOptions } from 'typeorm';
import { BetDaysService } from '../bet-days/bet-days.service';
import { TrainingBetEntity } from './entities/training-bet.entity';
import { CreateTrainingBetDto } from './dto/create-training-bet.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { ParticipantsService } from '../participants/participants.service';
import { LevelEnum as LogLevelEnum } from '../system-logs/enum/log-level.enum';
import {
  buildOptions,
  FindOptionsDto,
  FindReturnModelDto,
} from '../../public/dto/find.dto';

@Injectable()
export class TrainingBetsService {
  private logger: Logger;

  constructor(
    @InjectRepository(TrainingBetEntity)
    private trainingBetRepository: Repository<TrainingBetEntity>,

    private usersService: UsersService,
    private betDaysService: BetDaysService,
    private systemLogsService: SystemLogsService,
    private participantsService: ParticipantsService,
  ) {
    this.logger = new Logger();
  }

  async validateUserWins() {
    try {
      const trainingBetsClosed = await this.trainingBetRepository.find({
        where: {
          status: StatusEnum.ENCERRADA,
        },
        relations: {
          participants: { user: true },
        },
      });

      /**
       * Valida dentre cada aposta Encerrada, todos os participantes.
       * Adicionando 1 vitória se NÃO foi desclassificado naquela aposta.
       */
      const usersWins: { id: number; wins: number }[] = [];
      for (const trainingBet of trainingBetsClosed) {
        trainingBet.participants.forEach((participant) => {
          const userId = participant.user.id;
          usersWins.push({ id: userId, wins: 0 });

          if (participant.declassified === false) {
            const userWins = usersWins.find((i) => i.id === userId);
            if (userWins) userWins.wins++;
          }
        });
      }

      await Promise.all(
        usersWins.map((user) => this.usersService.update(user.id, user)),
      );
    } catch (e) {
      this.logger.error(e);
      await this.systemLogsService.upsert({
        level: LogLevelEnum.ERROR,
        source: 'TrainingBetsService.updateUserWins',
        message: 'Falha ao atualizar os ganhos dos usuários',
      });
    }
  }

  async validateUserLosses(userId: number) {
    try {
      /**
       * Montagem da query diretamente com o filtro do usuário
       */
      const trainingBetsClosed = await this.trainingBetRepository
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
       * Adicionando 1 derrota se foi desclassificado naquela aposta.
       */
      const usersLosses: { id: number; losses: number }[] = [];
      for (const trainingBet of trainingBetsClosed) {
        trainingBet.participants.forEach((participant) => {
          if (participant.declassified === true) {
            const userId = participant.user.id;

            const userWins = usersLosses.find((i) => i.id === userId);
            if (userWins) userWins.losses++;
            else usersLosses.push({ id: userId, losses: 1 });
          }
        });
      }

      await Promise.all(
        usersLosses.map((user) => this.usersService.update(user.id, user)),
      );
    } catch (e) {
      this.logger.error(e);
      await this.systemLogsService.upsert({
        level: LogLevelEnum.ERROR,
        source: 'TrainingBetsService.updateUserLosses',
        message: 'Falha ao atualizar as derrotas dos usuários',
      });
    }
  }

  async validateUserTotalFaults(userId: number) {
    try {
      const totalFaults =
        await this.participantsService.getTotalFaultsFromUser(userId);

      await this.usersService.update(userId, { totalFaults });
    } catch (e) {
      this.logger.error(e);
      await this.systemLogsService.upsert({
        level: LogLevelEnum.ERROR,
        source: 'TrainingBetsService.validateUserTotalFaults',
        message: 'Falha ao atualizar as falhas totais dos usuários',
      });
    }
  }

  async validateUserTotalTrainingDays(userId: number) {
    try {
      const options = buildOptions({ userId });
      const allUserParticipations =
        await this.participantsService.findAll(options);

      await this.usersService.update(userId, {
        totalTrainingDays: allUserParticipations.rows.length,
      });
    } catch (e) {
      this.logger.error(e);
      await this.systemLogsService.upsert({
        level: LogLevelEnum.ERROR,
        source: 'TrainingBetsService.validateUserTotalFaults',
        message: 'Falha ao atualizar as falhas totais dos usuários',
      });
    }
  }

  async #validatePeriodConflict(object: Partial<TrainingBetEntity>) {
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

  #validateBetStarted(initialDate: Date | string) {
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

  #defineDuration(object: Partial<TrainingBetEntity>) {
    // +1 para considerar também o dia atual
    const duration =
      moment(object.finalDate).diff(object.initialDate, 'days') + 1;

    return { ...object, duration };
  }

  async #syncBetDays(
    trainingBetId: number,
    duration: number,
    initialDate: Date | string,
  ) {
    const trainingBet = await this.findOne(trainingBetId);
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
      await this.#validatePeriodConflict(object);

      // Valida se a aposta já foi iniciada
      this.#validateBetStarted(object.initialDate);

      const newObject = this.#defineDuration(object);
      const newTrainingBet = this.trainingBetRepository.create(newObject);
      const result = await this.trainingBetRepository.save(newTrainingBet);

      await this.#syncBetDays(result.id, result.duration, object.initialDate);

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

      const trainingBet = await this.findOne(id);
      if (!trainingBet) throw new Error('Aposta não encontrada');

      let newTrainingBet: Partial<TrainingBetEntity> = {
        ...object,
        finalDate: object.finalDate ?? trainingBet.finalDate,
        initialDate: object.initialDate ?? trainingBet.initialDate,
      };

      // Valida se há conflito das datas
      await this.#validatePeriodConflict({ id, ...newTrainingBet });

      // Valida se a aposta já foi iniciada
      if (object.initialDate) this.#validateBetStarted(object.initialDate);

      if (['Em Andamente', 'Encerrada'].includes(trainingBet.status)) {
        throw new Error(
          `Não é possível editar uma aposta ${trainingBet.status.toLowerCase()}`,
        );
      }

      newTrainingBet = this.#defineDuration(newTrainingBet);
      const result = await this.trainingBetRepository.update(
        id,
        newTrainingBet,
      );

      await this.#syncBetDays(
        id,
        newTrainingBet.duration,
        newTrainingBet.initialDate,
      );

      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async delete(id: number): Promise<any> {
    try {
      const result = await this.trainingBetRepository.delete(id);

      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async findOne(id: number): Promise<TrainingBetEntity> {
    try {
      const result = await this.trainingBetRepository.findOne({
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

      /**
       * Faz a Leitura das imagens dos usuários participantes
       */
      result.participants = result.participants.map((participant) => {
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
      result.betDays = result.betDays.map((day) => {
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

      return result;
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
}
