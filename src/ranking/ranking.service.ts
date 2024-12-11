import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { RankingEntity } from './entities/ranking.entity';
import { UsersEntity } from '../users/entities/users.entity';
import { ParticipantsEntity } from '../participants/entities/participants.entity';
import { TrainingReleasesEntity } from '../training-releases/entities/training-releases.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(RankingEntity)
    private rankingRepository: Repository<RankingEntity>,

    @InjectRepository(ParticipantsEntity)
    private participantsRepository: Repository<ParticipantsEntity>,

    @InjectRepository(TrainingReleasesEntity)
    private trainingReleasesRepository: Repository<TrainingReleasesEntity>,

    private usersService: UsersService,
  ) {}

  async calculateUserScore(user: UsersEntity): Promise<number> {
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
      const user = await this.usersService.findOne(userId);

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
