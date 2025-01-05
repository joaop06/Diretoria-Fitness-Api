import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { RankingEntity } from './entities/ranking.entity';
import { UsersEntity } from '../users/entities/users.entity';
import { TrainingReleasesEntity } from '../training-releases/entities/training-releases.entity';

@Module({
  exports: [RankingService],
  providers: [RankingService],
  controllers: [RankingController],
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      RankingEntity,
      TrainingReleasesEntity,
    ]),
  ],
})
export class RankingModule {}
