import * as dotenv from 'dotenv';
dotenv.config();

import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';
import { Repository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BetDaysService } from '../bet-days/bet-days.service';
import { TrainingBetEntity } from './entities/training-bet.entity';
import { BetDaysEntity } from '../bet-days/entities/bet-days.entity';
import { CreateTrainingBetDto } from './dto/create-training-bet.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { ParticipantsService } from '../participants/participants.service';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';
import { ParticipantsEntity } from '../participants/entities/participants.entity';

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
    this.logger.error = (message) =>
      process.env.NODE_ENV === 'development'
        ? this.logger.error(message)
        : null;
  }

  @Cron('1 0 * * *') // Executa todo dia às 00:01
  async updateStatisticsBets(betId?: number) {
    let logMessage = 'Estatísticas das Apostas atualizadas';
    try {
      /**
       * Buscar dias da aposta
       *
       * Para cada dia concluído (dias anteriores) da aposta,
       * Verificar se o participante possui treino:
       *  - Atualizar participante com a quantidade de faltas
       *      - Se faltas > permitidas, está desclassificado
       *
       *  - Atualizar Dia da aposta com a quantidade de faltas total dos participantes e o aproveitamento (% de participantes que treinou)
       *
       *
       * Se a quantidade de dias concluídos for igual a duração, a aposta está completa
       */
      const trainingBets: TrainingBetEntity[] = [];
      if (betId) {
        const trainingBet = await this.findOne(betId);
        trainingBets.push(trainingBet);
      } else {
        const bets = await this.trainingBetRepository.find({
          where: { status: Not('Encerrada') },
          relations: [
            'betDays',
            'betDays.trainingReleases',
            'participants',
            'participants.trainingReleases',
            'participants.trainingReleases.betDay',
          ],
        });
        trainingBets.push(...bets);
      }

      const today = moment();
      for (const trainingBet of trainingBets) {
        const { faultsAllowed, betDays, participants } = trainingBet;
        const betDaysComplete = betDays.filter(
          (betDay) =>
            today.isAfter(betDay.day) &&
            today.format('DD') !== moment(betDay.day).format('DD'),
        );

        const betDaysFaults: Partial<BetDaysEntity>[] = [];
        const participantsFaults: Partial<ParticipantsEntity>[] = [];

        betDaysComplete.forEach((betDay) => {
          betDaysFaults.push({ id: betDay.id, totalFaults: 0 });

          /** Verifica os participantes que não treinaram */
          participants.forEach((participant) => {
            // Busca nos treinos pelo participante e o dia atual
            const participantTraining = participant?.trainingReleases?.find(
              (item) => item.betDay.id === betDay.id,
            );

            /** Se o participante não treinou */
            if (!participantTraining) {
              // adiciona uma falha para o participante
              const participantFault = participantsFaults.find(
                (item) => item.id === participant.id,
              );

              if (participantFault) participantFault.faults += 1;
              else participantsFaults.push({ id: participant.id, faults: 1 });

              // adiciona uma falha ao total do dia
              const betDayFault = betDaysFaults.find(
                (item) => item.id === betDay.id,
              );

              if (betDayFault) betDayFault.totalFaults += 1;
            }
          });
        });

        /** Atualiza as faltas dos participantes */
        for (const participant of participantsFaults) {
          // Desclassificado caso exceder a quantidade de faltas permitidas
          participant.declassified = participant.faults > faultsAllowed;

          // Calcula o aproveitamento em percentual
          participant.utilization = parseFloat(
            (100 - (participant.faults / betDaysComplete.length) * 100).toFixed(
              2,
            ),
          );

          await this.participantsService.update(participant.id, participant);

          // Atualiza as derrotas totais do Usuário
          await this.validateUserLosses(participant.user.id);
          await this.validateUserTotalFaults(participant.user.id);
        }

        /** Atualiza as faltas totais dos dias */
        for (const betDay of betDaysFaults) {
          // Calcula o aproveitamento em percentual
          const utilization = parseFloat(
            (100 - (betDay.totalFaults / participants.length) * 100).toFixed(2),
          );
          betDay.utilization = isNaN(utilization) ? 0 : utilization;

          await this.betDaysService.update(betDay.id, betDay);
        }

        let status = trainingBet.status;

        const todayFormat = today.format('YYYY-MM-DD');
        const completed = trainingBet.betDays.length === betDaysComplete.length;
        const inProgress =
          moment(trainingBet.initialDate).isBefore(todayFormat) &&
          moment(trainingBet.finalDate).isAfter(todayFormat);

        if (inProgress && completed) status = 'Encerrada';
        else if (inProgress) status = 'Em Andamento';

        if (status !== trainingBet.status)
          await this.trainingBetRepository.update(trainingBet.id, { status });

        await this.validateUserWins();
      }

      if (betId) logMessage = `Apostas ${betId} foi atualizada`;
    } catch (e) {
      this.logger.error(e);
      logMessage = e.message;
    } finally {
      // Registro de sincronização
      await this.systemLogsService.create({
        message: logMessage,
        source: 'TrainingBetsService.updateStatistics',
      });
    }
  }

  async validateUserWins() {
    try {
      const trainingBetsClosed = await this.trainingBetRepository.find({
        where: {
          status: 'Encerrada',
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
          if (participant.declassified === false) {
            const userId = participant.user.id;

            const userWins = usersWins.find((i) => i.id === userId);
            if (userWins) userWins.wins++;
            else usersWins.push({ id: userId, wins: 1 });
          }
        });
      }

      await Promise.all(
        usersWins.map((user) => this.usersService.update(user.id, user)),
      );
    } catch (e) {
      this.logger.error(e);
      await this.systemLogsService.create({
        level: 'ERROR',
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
        .andWhere('user.id = :userId', { userId })
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
      await this.systemLogsService.create({
        level: 'ERROR',
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
      await this.systemLogsService.create({
        level: 'ERROR',
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
    const today = moment();
    const initialDateMoment = moment(initialDate);
    if (today.diff(initialDateMoment, 'hours') < 12) {
      throw new Error(
        'Deve ser programada com no mínimo 12 horas de antecedência',
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
      return await this.trainingBetRepository.findOne({
        where: { id },
        relations: ['betDays', 'betDays.trainingReleases', 'participants'],
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<TrainingBetEntity>,
  ): Promise<FindReturnModelDto<TrainingBetEntity>> {
    const [rows, count] =
      await this.trainingBetRepository.findAndCount(options);
    return { rows, count };
  }
}
