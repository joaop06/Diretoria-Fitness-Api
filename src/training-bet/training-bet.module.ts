import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingBetEntity } from './training-bet.entity';
import { TrainingBetService } from './training-bet.service';
import { BetDaysModule } from '../bet-days/bet-days.module';
import { TrainingBetController } from './training-bet.controller';
import { ParticipantsModule } from '../participants/participants.module';

@Module({
  exports: [TrainingBetService],
  providers: [TrainingBetService],
  controllers: [TrainingBetController],
  imports: [
    TypeOrmModule.forFeature([TrainingBetEntity]),
    BetDaysModule,
    ParticipantsModule,
  ],
})
export class TrainingBetModule {}
