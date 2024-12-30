import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CronJobsService } from './cron-jobs.service';
import { RankingModule } from '../ranking/ranking.module';
import { BetDaysModule } from '../bet-days/bet-days.module';
import { SystemLogsModule } from '../system-logs/system-logs.module';
import { ParticipantsModule } from '../participants/participants.module';
import { TrainingBetsModule } from '../training-bets/training-bets.module';

@Module({
  exports: [CronJobsService],
  providers: [CronJobsService],
  imports: [
    forwardRef(() => UsersModule),
    BetDaysModule,
    RankingModule,
    SystemLogsModule,
    forwardRef(() => ParticipantsModule),
    TrainingBetsModule,
  ],
})
export class CronJobsModule {}
