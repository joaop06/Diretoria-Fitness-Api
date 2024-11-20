import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysModule } from '../bet-days/bet-days.module';
import { TrainingReleasesService } from './training-releases.service';
import { ParticipantsModule } from '../participants/participants.module';
import { TrainingBetsModule } from '../training-bets/training-bets.module';
import { TrainingReleasesController } from './training-releases.controller';
import { TrainingReleasesEntity } from './entities/training-releases.entity';

@Module({
  exports: [TrainingReleasesService],
  providers: [TrainingReleasesService],
  controllers: [TrainingReleasesController],
  imports: [
    TypeOrmModule.forFeature([TrainingReleasesEntity]),
    BetDaysModule,
    TrainingBetsModule,
    ParticipantsModule,
  ],
})
export class TrainingReleasesModule {}
