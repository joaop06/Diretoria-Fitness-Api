import { Repository } from 'typeorm';
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
          score: await this.calculateUserScore(user),
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

  private async calculateUserScore(user: UsersEntity): Promise<number> {
    // Dados do usuário
    const { wins, losses, totalFaults } = user;

    // Total de apostas participadas
    const betsParticipated = await this.participantsRepository.count({
      where: { user: { id: user.id } },
    });

    // Total de dias treinados
    const trainingDays = await this.trainingReleasesRepository.count({
      where: { participant: { user: { id: user.id } } },
    });

    // Cálculo da pontuação
    const weightWin = 10, // Peso da vitória
      weightLoss = 5, // Peso da derrota
      weightFault = 2, // Peso da falha
      weightParticipant = 3, // Peso da participação
      weightTrainingDay = 1; // Peso do dia de treino

    const score =
      wins * weightWin -
      losses * weightLoss -
      totalFaults * weightFault +
      betsParticipated * weightParticipant +
      trainingDays * weightTrainingDay;

    return score;
  }

  async findAll() {
    try {
      const result = await this.rankingRepository.find({
        order: { score: 'DESC' },
        relations: { user: true },
        select: {
          id: true,
          score: true,
          user: {
            name: true,
            wins: true,
            losses: true,
            totalFaults: true,
            profileImagePath: true,
          },
        },
      });

      return { result };
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
