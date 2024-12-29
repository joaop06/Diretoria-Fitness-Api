import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
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
    TypeOrmModule.forFeature([ParticipantsEntity, TrainingBetEntity]),
    forwardRef(() => UsersModule),
    SystemLogsModule,
  ],
})
export class ParticipantsModule {}
