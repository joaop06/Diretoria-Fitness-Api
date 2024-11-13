import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingBetEntity } from './training-bet.entity';
import { TrainingBetService } from './training-bet.service';
import { BetDaysModule } from 'src/bet-days/bet-days.module';
import { TrainingBetController } from './training-bet.controller';

@Module({
  exports: [TrainingBetService],
  providers: [TrainingBetService],
  controllers: [TrainingBetController],
  imports: [TypeOrmModule.forFeature([TrainingBetEntity]), BetDaysModule],
})
export class TrainingBetModule {}
