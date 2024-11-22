import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { UsersEntity } from '../users/entities/users.entity';
import { SystemLogsModule } from '../system-logs/system-logs.module';

@Module({
  providers: [RankingService],
  controllers: [RankingController],
  imports: [TypeOrmModule.forFeature([UsersEntity]), SystemLogsModule],
})
export class RankingModule { }
