import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysEntity } from './bet-days.entity';
import { BetDaysService } from './bet-days.service';
import { BetDaysController } from './bet-days.controller';

@Module({
  exports: [BetDaysService],
  providers: [BetDaysService],
  controllers: [BetDaysController],
  imports: [TypeOrmModule.forFeature([BetDaysEntity])],
})
export class BetDaysModule { }
