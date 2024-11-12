import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsEntity } from './participants.entity';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { TrainingBetModule } from 'src/training-bet/training-bet.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  exports: [ParticipantsService],
  providers: [ParticipantsService],
  controllers: [ParticipantsController],
  imports: [
    UsersModule,
    TrainingBetModule,
    TypeOrmModule.forFeature([ParticipantsEntity]),
  ],
})
export class ParticipantsModule {}
