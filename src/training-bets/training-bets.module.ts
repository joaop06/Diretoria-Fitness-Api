import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysModule } from '../bet-days/bet-days.module';
import { TrainingBetsService } from './training-bets.service';
import { TrainingBetEntity } from './entities/training-bet.entity';
import { TrainingBetsController } from './training-bets.controller';
import { ParticipantsModule } from '../participants/participants.module';

@Module({
  exports: [TrainingBetsService],
  providers: [TrainingBetsService],
  controllers: [TrainingBetsController],
  imports: [
    TypeOrmModule.forFeature([TrainingBetEntity]),
    BetDaysModule,
    ParticipantsModule,
  ],
})
export class TrainingBetsModule {}
