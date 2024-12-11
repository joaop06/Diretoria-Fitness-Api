import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingService } from './ranking.service';
import { UsersService } from '../users/users.service';
import { RankingController } from './ranking.controller';
import { RankingEntity } from './entities/ranking.entity';
import { ParticipantsEntity } from '../participants/entities/participants.entity';
import { TrainingReleasesEntity } from '../training-releases/entities/training-releases.entity';

@Module({
  exports: [RankingService],
  providers: [RankingService],
  controllers: [RankingController],
  imports: [
    TypeOrmModule.forFeature([
      RankingEntity,
      ParticipantsEntity,
      TrainingReleasesEntity,
    ]),
    UsersService,
  ],
})
export class RankingModule {}
