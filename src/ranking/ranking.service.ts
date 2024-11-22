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
  ) {}

  @Cron('5 0 * * *') // Executa todo dia às 00:05
  async updateStatisticsRanking() {
    let logMessage: string;
    try {
      // const users = await this.usersRepository.find({
      //   relations: ['participants', 'participants.trainingReleases']
      // })
    } catch (e) {
      logMessage = e.message;
      console.error(logMessage);
    }
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

  async update(id: number, object: { score: number }) {
    try {
      return await this.rankingRepository.update(id, object);
    } catch (e) {
      throw e;
    }
  }
}
