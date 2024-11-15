import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetDaysService } from './bet-days.service';
import { BetDaysEntity } from './entities/bet-days.entity';

@Module({
  exports: [BetDaysService],
  providers: [BetDaysService],
  imports: [TypeOrmModule.forFeature([BetDaysEntity])],
})
export class BetDaysModule {}
