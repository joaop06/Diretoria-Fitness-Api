import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysModule } from '../bet-days/bet-days.module';
import { TrainingReleasesEntity } from './training-releases.entity';
import { TrainingReleasesService } from './training-releases.service';
import { TrainingBetModule } from '../training-bet/training-bet.module';
import { ParticipantsModule } from '../participants/participants.module';
import { TrainingReleasesController } from './training-releases.controller';

@Module({
  exports: [TrainingReleasesService],
  providers: [TrainingReleasesService],
  controllers: [TrainingReleasesController],
  imports: [
    TypeOrmModule.forFeature([TrainingReleasesEntity]),
    BetDaysModule,
    TrainingBetModule,
    ParticipantsModule,
  ],
})
export class TrainingReleasesModule {}
