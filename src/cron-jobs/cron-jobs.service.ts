import { Not } from 'typeorm';
import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RankingService } from '../ranking/ranking.service';
import { BetDaysService } from '../bet-days/bet-days.service';
import { BetDaysEntity } from '../bet-days/entities/bet-days.entity';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { ParticipantsService } from '../participants/participants.service';
import { TrainingBetsService } from '../training-bets/training-bets.service';
import { LevelEnum as LogLevelEnum } from '../system-logs/enum/log-level.enum';
import { ParticipantsEntity } from '../participants/entities/participants.entity';
import { StatusEnum as TrainingBetsStatusEnum } from '../training-bets/enum/status.enum';

@Injectable()
export class CronJobsService {
  private logger: Logger;

  constructor(
    private usersService: UsersService,
    private betDaysService: BetDaysService,
    private rankingService: RankingService,
    private systemLogsService: SystemLogsService,
    private participantsService: ParticipantsService,
    private trainingBetsService: TrainingBetsService,
  ) {
    this.logger = new Logger();
  }

  // @Timeout(2000) // homolog
  @Cron('1 0 * * *') // Executa todo dia às 00:00
  async updateStatisticsBets(betId?: number) {
    let logLevel = LogLevelEnum.INFO;
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
      let where;
      if (betId) where = { id: betId };
      else where = { status: Not(TrainingBetsStatusEnum.ENCERRADA) };

      const { rows: trainingBets } = await this.trainingBetsService.findAll({
        where,
        relations: [
          'betDays',
          'betDays.trainingReleases',
          'participants',
          'participants.user',
          'participants.trainingReleases',
          'participants.trainingReleases.betDay',
        ],
      });


      const today = moment();

      for (const trainingBet of trainingBets) {
        const { faultsAllowed, betDays, participants } = trainingBet;
        const betDaysComplete = betDays.filter(
          (betDay) =>
            today.startOf('day').isAfter(moment(betDay.day)) &&
            (today.format('DD') !== moment(betDay.day).format('DD') ||
              (today.format('MM') !== moment(betDay.day).format('MM') &&
                today.format('DD') === moment(betDay.day).format('DD'))),
        );

        const betDaysFaults: Partial<BetDaysEntity>[] = [];
        const participantsFaults: Partial<ParticipantsEntity>[] = [];

        betDaysComplete.forEach((betDay) => {
          betDaysFaults.push({ id: betDay.id, totalFaults: 0 });

          /** Verifica as falhas dos participantes */
          participants.forEach((participant) => {
            let participantFault = participantsFaults.find(
              (item) => item.id === participant.id,
            );

            if (!participantFault) {
              participantsFaults.push({
                faults: 0,
                id: participant.id,
                user: participant.user,
              });

              participantFault = participantsFaults.find(
                (item) => item.id === participant.id,
              );
            }

            // Busca nos treinos pelo participante e o dia atual
            const participantTraining = participant?.trainingReleases?.find(
              (item) => item.betDay.id === betDay.id,
            );

            /**
             * Se o participante não treinou
             * irá contabilizar adiciona uma falha para ele e para o Dia de Treino
             */
            if (!participantTraining) {
              participantFault.faults += 1;

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

          // Atualiza as derrotas e faltas totais do Usuário
          await this.trainingBetsService.validateUserLosses(
            participant.user.id,
          );
          await this.trainingBetsService.validateUserTotalFaults(
            participant.user.id,
          );
          await this.trainingBetsService.validateUserTotalTrainingDays(
            participant.user.id,
          );
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
          moment(trainingBet.finalDate).isAfter(todayFormat) &&
          (trainingBet.initialDate === todayFormat ||
            moment(trainingBet.initialDate).isBefore(todayFormat));

        if (completed) status = TrainingBetsStatusEnum.ENCERRADA;
        else if (inProgress) status = TrainingBetsStatusEnum.EM_ANDAMENTO;

        if (status !== trainingBet.status)
          await this.trainingBetsService.update(trainingBet.id, { status });
      }

      // Atualiza as vitórias do Usuário
      await this.trainingBetsService.validateUserWins();

      // Atualiza a pontuação geral dos Usuários
      await this.updateStatisticsRanking();

      if (betId) logMessage = `Apostas ${betId} foi atualizada`;
    } catch (e) {
      this.logger.error(e);
      logMessage = e.message;
      logLevel = LogLevelEnum.ERROR;
    } finally {
      // Registro de sincronização
      await this.systemLogsService.upsert({
        level: logLevel,
        message: logMessage,
        source: 'TrainingBetsService.updateStatisticsBets',
      });
    }
  }

  @Cron('2 * * * *')
  async updateStatisticsRanking(userId?: number) {
    let logLevel = LogLevelEnum.INFO;
    let logMessage = 'Ranking de usuários atualizado';

    try {
      let where;
      if (userId) where = { id: userId };
      const { rows: users } = await this.usersService.findAll({ where });

      /**
       * Calcula as pontuações de todos os usuários
       */
      const scores = await Promise.all(
        users.map(async (user) => ({
          userId: user.id,
          score: await this.rankingService.calculateUserScore(user),
        })),
      );

      /**
       * Atualiza as pontuações
       */
      scores.map(async (score) => {
        await this.rankingService.update({ user: { id: score.userId } }, score);
      });
    } catch (e) {
      logMessage = e.message;
      logLevel = LogLevelEnum.ERROR;
    } finally {
      // Registro de sincronização
      await this.systemLogsService.upsert({
        level: logLevel,
        message: logMessage,
        source: 'RankingService.updateStatisticsRanking',
      });
    }
  }
}
