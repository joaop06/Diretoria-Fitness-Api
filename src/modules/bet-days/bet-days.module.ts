import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysService } from './bet-days.service';
import { BetDaysEntity } from './entities/bet-days.entity';
import { SystemLogsModule } from '../system-logs/system-logs.module';

@Module({
  exports: [BetDaysService],
  providers: [BetDaysService],
  imports: [TypeOrmModule.forFeature([BetDaysEntity]), SystemLogsModule],
})
export class BetDaysModule {}
