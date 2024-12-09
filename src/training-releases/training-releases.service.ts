import * as fs from 'fs';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingService } from '../ranking/ranking.service';
import { BetDaysService } from '../bet-days/bet-days.service';
import { UploadTrainingFileDto } from './dto/upload-training-file.dto';
import { ParticipantsService } from '../participants/participants.service';
import { TrainingBetsService } from '../training-bets/training-bets.service';
import { TrainingReleasesEntity } from './entities/training-releases.entity';
import { CreateTrainingReleasesDto } from './dto/create-training-release.dto';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';

@Injectable()
export class TrainingReleasesService {
  constructor(
    @InjectRepository(TrainingReleasesEntity)
    private trainingReleasesRepository: Repository<TrainingReleasesEntity>,
    private betDaysService: BetDaysService,
    private rankingService: RankingService,
    private trainingBetService: TrainingBetsService,
    private participantsService: ParticipantsService,
  ) {}

  async create(
    object: CreateTrainingReleasesDto,
  ): Promise<TrainingReleasesEntity> {
    try {
      const betDay = await this.betDaysService.findOne(object.betDayId);
      if (!betDay) throw new Error('Aposta não ocorre neste dia');

      const today = moment().format('YYYY-MM-DD');
      if (today !== betDay.day)
        throw new Error('Lançamento do dia de treino inválido');

      const participant = await this.participantsService.findOne(
        object.participantId,
      );
      if (!participant)
        throw new Error('Usuário não está participando desta aposta');

      const foundTrainingRelease =
        await this.trainingReleasesRepository.findOne({
          where: {
            betDay: { id: betDay.id },
            participant: { id: participant.id },
          },
        });
      if (foundTrainingRelease)
        throw new Error('Participante já realizou um treinou neste dia');

      const newTrainingBet = this.trainingReleasesRepository.create({
        ...object,
        betDay,
        participant,
      });
      const result = await this.trainingReleasesRepository.save(newTrainingBet);

      /** Atualiza estatísticas da Aposta */
      const { id: betId } = participant.trainingBet;
      this.trainingBetService.updateStatisticsBets(betId);

      const {
        user: { id: userId },
      } = participant;
      this.rankingService.updateStatisticsRanking(userId);

      return result;
    } catch (e) {
      throw e;
    }
  }

  async uploadTrainingPhoto(id: number, object: UploadTrainingFileDto) {
    try {
      const { imagePath } = object;

      const training = await this.trainingReleasesRepository.findOne({
        where: { id },
      });
      if (!training) throw new Error('Treino não encontrado');

      return await this.trainingReleasesRepository.update(id, { imagePath });
    } catch (e) {
      fs.unlink(object.imagePath, () => {});
      throw e;
    }
  }

  async findOne(id: number): Promise<TrainingReleasesEntity> {
    try {
      return await this.trainingReleasesRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<TrainingReleasesEntity>,
  ): Promise<FindReturnModelDto<TrainingReleasesEntity>> {
    try {
      const [rows, count] =
        await this.trainingReleasesRepository.findAndCount(options);
      return { rows, count };
    } catch (e) {
      throw e;
    }
  }

  async delete(id: number): Promise<any> {
    try {
      return await this.trainingReleasesRepository.delete(id);
    } catch (e) {
      throw e;
    }
  }
}
