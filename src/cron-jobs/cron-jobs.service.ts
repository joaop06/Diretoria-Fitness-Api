import * as moment from 'moment';
import { Cron, Timeout } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { validateDaysComplete } from '../../helper/dates';
import { RankingService } from '../ranking/ranking.service';
import { BetDaysService } from '../bet-days/bet-days.service';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { ParticipantsService } from '../participants/participants.service';
import { TrainingBetsStatusEnum } from '../training-bets/enum/status.enum';
import { TrainingBetsService } from '../training-bets/training-bets.service';
import { LevelEnum as LogLevelEnum } from '../system-logs/enum/log-level.enum';
import { Not } from 'typeorm';

@Injectable()
export class CronJobsService {
  private logger = new Logger();

  constructor(
    private usersService: UsersService,
    private betDaysService: BetDaysService,
    private rankingService: RankingService,
    private systemLogsService: SystemLogsService,
    private participantsService: ParticipantsService,
    private trainingBetsService: TrainingBetsService,
  ) {}

  private percentageUtilization(dividend: number, divider: number) {
    return parseFloat((100 - (dividend / divider) * 100).toFixed(2));
  }

  @Timeout(500) // homolog
  // @Cron('0 0 * * *') // Executa todo dia às 00:00
  async updateStatisticsBets(betId?: number) {
    let logLevel = LogLevelEnum.INFO;
    let logMessage = 'Estatísticas das Apostas atualizadas';
    try {
      const { rows: trainingBets } = await this.trainingBetsService.findAll({
        relations: [
          'betDays',
          'betDays.trainingReleases',
          'participants',
          'participants.user',
          'participants.trainingReleases',
          'participants.trainingReleases.betDay',
        ],
        where: betId
          ? { id: betId }
          : {
              status: Not(TrainingBetsStatusEnum.AGENDADA),
            },
      });

      const today = moment();
      for (const trainingBet of trainingBets) {
        const {
          status,
          betDays,
          participants,
          faultsAllowed,
          id: trainingBetId,
        } = trainingBet;

        // Dias completos da aposta
        const completeBettingDays = validateDaysComplete(betDays, today);

        /**
         * Para cada dia da aposta
         * Verificar se o participante possui treino:
         *  - Atualizar participante com a quantidade de faltas
         *  - Se faltas > permitidas, está desclassificado
         *  - Atualizar Dia da aposta com a quantidade de faltas total dos participantes
         */

        // Inicializa a contagem de faltas em '0' para todos os participantes
        participants.forEach((participant) => (participant.faults = 0));

        completeBettingDays.forEach((betDay) => {
          betDay.totalFaults = 0;

          /** Verifica as falhas dos participantes */
          participants.forEach((participant) => {
            // Busca nos treinos pelo participante e o dia atual
            const participantTraining = participant?.trainingReleases?.find(
              (item) => item.betDay.id === betDay.id,
            );

            /**
             * Se o participante não treinou
             * irá contabilizar adiciona uma falha para ele e para o Dia de Treino
             */
            if (!participantTraining) {
              betDay.totalFaults += 1;
              participant.faults += 1;
              if (participant.faults > faultsAllowed)
                participant.declassified = true;
            }
          });
        });

        /**
         * Atualiza os dados dos participantes
         *  - Faltas
         *  - Treinos
         *  - Derrotas
         *  - Aproveitamento %
         *  - Se está ou não desclassificado
         */
        participants.forEach(async (participant) => {
          const { faults, declassified } = participant;

          // Calcula o aproveitamento em percentual
          participant.utilization = this.percentageUtilization(
            faults,
            completeBettingDays.length,
          );

          await this.participantsService.update(participant.id, {
            faults,
            declassified,
            utilization: participant.utilization,
          });
        });

        /**
         * Atualiza os dados dos dias completos da aposta
         *  - Faltas Totais
         *  - Aproveitamento %
         */
        completeBettingDays.forEach(async (betDay) => {
          const { totalFaults } = betDay;

          // Calcula o aproveitamento em percentual
          const utilization = this.percentageUtilization(
            totalFaults,
            participants.length,
          );

          await this.betDaysService.update(betDay.id, {
            totalFaults,
            utilization: isNaN(utilization) ? 0 : utilization,
          });
        });

        /**
         * Atualiza o Status da Aposta
         */
        const newTrainingBetStatus =
          await this.trainingBetsService.validateTrainingBetStatus(
            trainingBetId,
            today,
          );
        if (status !== newTrainingBetStatus)
          await this.trainingBetsService.update(trainingBetId, {
            status: newTrainingBetStatus,
          });
      }

      const userIds: number[] = [];
      trainingBets.forEach((bet) =>
        bet.participants.forEach((participant) =>
          userIds.push(participant.userId),
        ),
      );

      await Promise.all(
        [...new Set(userIds)].map(
          async (userId) =>
            await this.usersService.updateUserStatistics(userId),
        ),
      );

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
