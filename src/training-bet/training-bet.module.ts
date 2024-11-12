import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingBetEntity } from './training-bet.entity';
import { TrainingBetService } from './training-bet.service';
import { TrainingBetController } from './training-bet.controller';

@Module({
  exports: [TrainingBetService],
  providers: [TrainingBetService],
  controllers: [TrainingBetController],
  imports: [TypeOrmModule.forFeature([TrainingBetEntity])],
})
export class TrainingBetModule { }
