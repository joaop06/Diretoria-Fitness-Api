import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFiles } from '../../helper/read.files';
import { FindOptionsWhere, Repository } from 'typeorm';
import { RankingEntity } from './entities/ranking.entity';
import { UsersEntity } from '../users/entities/users.entity';
import { TrainingReleasesEntity } from '../training-releases/entities/training-releases.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,

    @InjectRepository(RankingEntity)
    private rankingRepository: Repository<RankingEntity>,

    @InjectRepository(TrainingReleasesEntity)
    private trainingReleasesRepository: Repository<TrainingReleasesEntity>,
  ) {}

  async calculateUserScore(userId: number): Promise<number> {
    // Dados do usuário
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    const { wins, losses, totalFaults, totalParticipations } = user;

    // Total de dias treinados
    const trainingDays = await this.trainingReleasesRepository.count({
      where: { participant: { user: { id: user.id } } },
    });

    // Cálculo da pontuação
    const weightWin = 10, // Peso da vitória
      weightLoss = 5, // Peso da derrota
      weightFault = 2, // Peso da falha
      weightParticipations = 3, // Peso da participação
      weightTrainingDay = 1; // Peso do dia de treino

    const score =
      wins * weightWin -
      losses * weightLoss -
      totalFaults * weightFault +
      totalParticipations * weightParticipations +
      trainingDays * weightTrainingDay;

    return score;
  }

  async findAll() {
    try {
      const ranking = await this.rankingRepository.find({
        order: { score: 'DESC' },
        relations: { user: true },
        select: {
          score: true,
          user: {
            name: true,
            profileImagePath: true,

            // Estatísticas do Usuário
            wins: true,
            losses: true,
            totalFaults: true,
            totalTrainingDays: true,
            totalParticipations: true,
          },
        },
      });

      const result = ranking.map((item) => {
        if (item?.user?.profileImagePath !== undefined) {
          item.user.profileImagePath = readFiles(item.user.profileImagePath);
        }

        return item;
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

      const newRanking = this.rankingRepository.create({ user });
      return await this.rankingRepository.save(newRanking);
    } catch (e) {
      throw e;
    }
  }

  async update(
    condition: number | FindOptionsWhere<RankingEntity>,
    object: Partial<RankingEntity>,
  ) {
    try {
      return await this.rankingRepository.update(condition, object);
    } catch (e) {
      throw e;
    }
  }
}
