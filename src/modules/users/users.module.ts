import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { UsersController } from './users.controller';
import { UsersEntity } from './entities/users.entity';
import { RankingModule } from '../ranking/ranking.module';
import { BetDaysModule } from '../bet-days/bet-days.module';
import { UsersLogsModule } from '../users-logs/users-logs.module';
import { SystemLogsModule } from '../system-logs/system-logs.module';
import { ParticipantsModule } from '../participants/participants.module';
import { TrainingBetsModule } from '../training-bets/training-bets.module';

@Module({
  exports: [UsersService],
  providers: [UsersService],
  controllers: [UsersController],
  imports: [
    TypeOrmModule.forFeature([UsersEntity]),
    EmailModule,
    BetDaysModule,
    RankingModule,
    UsersLogsModule,
    SystemLogsModule,
    TrainingBetsModule,
    forwardRef(() => ParticipantsModule),
  ],
})
export class UsersModule {}
