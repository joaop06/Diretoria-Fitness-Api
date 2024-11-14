import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysModule } from 'src/bet-days/bet-days.module';
import { TrainingReleasesEntity } from './training-releases.entity';
import { TrainingReleasesService } from './training-releases.service';
import { ParticipantsModule } from 'src/participants/participants.module';
import { TrainingReleasesController } from './training-releases.controller';
import { TrainingBetModule } from 'src/training-bet/training-bet.module';

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
