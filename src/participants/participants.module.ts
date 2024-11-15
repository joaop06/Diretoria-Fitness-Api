import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/users.entity';
import { ParticipantsEntity } from './participants.entity';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { TrainingBetEntity } from '../training-bet/training-bet.entity';

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
  ],
})
export class ParticipantsModule {}
