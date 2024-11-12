import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsEntity } from './participants.entity';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';

@Module({
  exports: [ParticipantsService],
  providers: [ParticipantsService],
  controllers: [ParticipantsController],
  imports: [TypeOrmModule.forFeature([ParticipantsEntity])],
})
export class ParticipantsModule { }
