import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingEntity } from './entities/ranking.entity';
import { CreateRankingDto } from './dto/create-ranking.dto';
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
  ) { }

  @Cron('5 0 * * *') // Executa todo dia às 00:05
  async updateStatisticsRanking() {
    let logMessage: string;
    try {
      const users = await this.usersRepository.find();

      const scores = await Promise.all(
        users.map(async (user) => ({
          userId: user.id,
          score: await this.calculateUserScore(user.id),
        })),
      );

      scores.map(async score => {
        await this.rankingRepository.update({ user: { id: score.userId } }, score);
      });

    } catch (e) {
      logMessage = e.message;
      console.error(logMessage);
    }
  }

  async calculateUserScore(userId: number): Promise<number> {

    // Dados do usuário
    const user = await this.usersRepository.findOneOrFail({ where: { id: userId } });
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
    const PesoV = 10, PesoD = 5, PesoF = 2, PesoAP = 3, PesoDT = 1;

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

  async create(object: CreateRankingDto) {
    try {
      const newRanking = await this.rankingRepository.create(object);
      return await this.rankingRepository.save(newRanking);
    } catch (e) {
      throw e;
    }
  }
}
