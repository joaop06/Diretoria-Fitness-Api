import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingEntity } from './entities/ranking.entity';
import { UsersEntity } from '../users/entities/users.entity';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { ParticipantsEntity } from '../participants/entities/participants.entity';
import { TrainingReleasesEntity } from '../training-releases/entities/training-releases.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,

    @InjectRepository(RankingEntity)
    private rankingRepository: Repository<RankingEntity>,

    @InjectRepository(ParticipantsEntity)
    private participantsRepository: Repository<ParticipantsEntity>,

    @InjectRepository(TrainingReleasesEntity)
    private trainingReleasesRepository: Repository<TrainingReleasesEntity>,

    private systemLogsService: SystemLogsService,
  ) {}

  @Cron('5 0 * * *') // Executa todo dia às 00:05
  async updateStatisticsRanking(userId?: number) {
    let logMessage = 'Estatísticas dos Usuários atualizadas';
    try {
      const users: UsersEntity[] = [];
      if (userId) {
        const user = await this.usersRepository.findOne({
          where: { id: userId },
        });
        users.push(user);
      } else {
        users.push(...(await this.usersRepository.find()));
      }

      /**
       * Calcula as pontuações de todos os usuários
       */
      const scores = await Promise.all(
        users.map(async (user) => ({
          userId: user.id,
          score: await this.calculateUserScore(user.id),
        })),
      );

      /**
       * Atualiza as pontuações
       */
      scores.map(async (score) => {
        await this.rankingRepository.update(
          { user: { id: score.userId } },
          score,
        );
      });

      if (userId) logMessage = `Apostas ${userId} foi atualizada`;
    } catch (e) {
      logMessage = e.message;
    } finally {
      // Registro de sincronização
      await this.systemLogsService.create({
        message: logMessage,
        source: 'RankingService.updateStatisticsRanking',
      });
    }
  }

  private async calculateUserScore(userId: number): Promise<number> {
    // Dados do usuário
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
    });
    const { wins, losses, totalFaults } = user;

    // Total de apostas participadas
    const betsParticipated = await this.participantsRepository.count({
      where: { user: { id: userId } },
    });

    // Total de dias treinados
    const trainingDays = await this.trainingReleasesRepository.count({
      where: { participant: { user: { id: userId } } },
    });

    // Cálculo da pontuação
    const PesoV = 10,
      PesoD = 5,
      PesoF = 2,
      PesoAP = 3,
      PesoDT = 1;

    const score =
      wins * PesoV -
      losses * PesoD -
      totalFaults * PesoF +
      betsParticipated * PesoAP +
      trainingDays * PesoDT;

    return score;
  }

  async findAll() {
    try {
      return await this.rankingRepository.find({
        order: {},
      });
    } catch (e) {
      throw e;
    }
  }

  async create(userId: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      const newRanking = await this.rankingRepository.create({ user });
      return await this.rankingRepository.save(newRanking);
    } catch (e) {
      throw e;
    }
  }
}
