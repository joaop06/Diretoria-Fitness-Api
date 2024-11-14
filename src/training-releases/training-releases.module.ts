import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingReleasesEntity } from './training-releases.entity';
import { TrainingReleasesService } from './training-releases.service';
import { TrainingReleasesController } from './training-releases.controller';
import { ParticipantsModule } from 'src/participants/participants.module';
import { BetDaysModule } from 'src/bet-days/bet-days.module';

@Module({
  exports: [TrainingReleasesService],
  providers: [TrainingReleasesService],
  controllers: [TrainingReleasesController],
  imports: [TypeOrmModule.forFeature([TrainingReleasesEntity]), ParticipantsModule, BetDaysModule],
})
export class TrainingReleasesModule { }
