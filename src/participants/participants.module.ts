import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { ParticipantsEntity } from './entities/participants.entity';
import { SystemLogsModule } from '../system-logs/system-logs.module';
import { TrainingBetEntity } from '../training-bets/entities/training-bet.entity';

@Module({
  exports: [ParticipantsService],
  providers: [ParticipantsService],
  controllers: [ParticipantsController],
  imports: [
    TypeOrmModule.forFeature([
      ParticipantsEntity,
      UsersEntity,
      TrainingBetEntity,
    ]),
    SystemLogsModule,
  ],
})
export class ParticipantsModule {}
