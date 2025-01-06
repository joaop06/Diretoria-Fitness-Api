import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BetDaysModule } from '../bet-days/bet-days.module';
import { TrainingBetsService } from './training-bets.service';
import { TrainingBetEntity } from './entities/training-bet.entity';
import { TrainingBetsController } from './training-bets.controller';

@Module({
  exports: [TrainingBetsService],
  providers: [TrainingBetsService],
  controllers: [TrainingBetsController],
  imports: [
    TypeOrmModule.forFeature([TrainingBetEntity]),
    forwardRef(() => UsersModule),
    BetDaysModule,
  ],
})
export class TrainingBetsModule {}
