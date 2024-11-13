import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysEntity } from './bet-days.entity';
import { BetDaysService } from './bet-days.service';

@Module({
  exports: [BetDaysService],
  providers: [BetDaysService],
  imports: [TypeOrmModule.forFeature([BetDaysEntity])],
})
export class BetDaysModule {}
