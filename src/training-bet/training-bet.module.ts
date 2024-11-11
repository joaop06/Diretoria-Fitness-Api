import { Module } from '@nestjs/common';
import { TrainingBetController } from './training-bet.controller';
import { TrainingBetService } from './training-bet.service';

@Module({
  controllers: [TrainingBetController],
  providers: [TrainingBetService]
})
export class TrainingBetModule {}
