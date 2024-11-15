import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysModule } from '../bet-days/bet-days.module';
import { TrainingReleasesService } from './training-releases.service';
import { TrainingBetModule } from '../training-bet/training-bet.module';
import { ParticipantsModule } from '../participants/participants.module';
import { TrainingReleasesController } from './training-releases.controller';
import { TrainingReleasesEntity } from './entities/training-releases.entity';

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
