import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
    private systemLogsService: SystemLogsService
  ) { }

  @Cron('5 0 * * *') // Executa todo dia às 00:05
  async updateStatisticsRanking() {
    let logMessage: string;
    try {

      // const users = await this.usersRepository.find({
      //   relations: ['participants', 'participants.trainingReleases']
      // })
    } catch (e) {
      console.error();
    }
  }

  async findAll() {
    try {
      return await this.usersRepository.find({
        where: {},
      });
    } catch (e) {
      throw e;
    }
  }
}
