import * as fs from 'fs';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BetDaysService } from 'src/bet-days/bet-days.service';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { TrainingReleasesEntity } from './training-releases.entity';
import { CreateTrainingReleasesDto } from './dto/create-training-release.dto';
import { ParticipantsService } from 'src/participants/participants.service';

@Injectable()
export class TrainingReleasesService {
  constructor(
    @InjectRepository(TrainingReleasesEntity)
    private trainingBetRepository: Repository<TrainingReleasesEntity>,
    private participantsService: ParticipantsService,
    private betDaysService: BetDaysService
  ) { }

  async create(
    object: CreateTrainingReleasesDto,
  ): Promise<TrainingReleasesEntity> {
    try {
      const betDay = await this.betDaysService.findOne(object.betDayId);
      const participant = await this.participantsService.findOne(object.participantId);

      const newTrainingBet = this.trainingBetRepository.create({ ...object, betDay, participant });
      return await this.trainingBetRepository.save(newTrainingBet);
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number): Promise<TrainingReleasesEntity> {
    try {
      return await this.trainingBetRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<TrainingReleasesEntity>,
  ): Promise<FindReturnModelDto<TrainingReleasesEntity>> {
    try {
      const [rows, count] =
        await this.trainingBetRepository.findAndCount(options);
      return { rows, count };
    } catch (e) {
      throw e;
    }
  }
}
