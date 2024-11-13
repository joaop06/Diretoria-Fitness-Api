import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingBetEntity } from './training-bet.entity';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { CreateTrainingBetDto } from './dto/create-training-bet.dto';

@Injectable()
export class TrainingBetService {
  constructor(
    @InjectRepository(TrainingBetEntity)
    private trainingBetRepository: Repository<TrainingBetEntity>,
  ) { }

  @Cron('* */1 * * *')
  testCron() {
    console.log(`Rodando job em TrainingBetService a cada minuto: ${moment().format('DD/MM/YY HH:mm:ss')}`);
  }

  async create(object: CreateTrainingBetDto): Promise<TrainingBetEntity> {
    try {
      if (moment(object.initialDate).isAfter(moment(object.finalDate))) {
        throw new Error(`Período da aposta inválido`);
      }

      const conflictingBet = await this.trainingBetRepository
        .createQueryBuilder('training_bet')
        .where('training_bet.initialDate < :finalDate', {
          finalDate: object.finalDate,
        })
        .andWhere('training_bet.finalDate > :initialDate', {
          initialDate: object.initialDate,
        })
        .getOne();

      if (!!conflictingBet) {
        throw new Error(
          'Já existe uma aposta em andamento entre o período informado',
        );
      }

      const today = moment().startOf('day');
      const initialDate = moment(object.initialDate).startOf('day');
      if (today.isBefore(initialDate) && today.diff(initialDate, 'days') > 0) {
        throw new Error(
          'A aposta deve ser programada com no mínimo 1 dia de antecedência',
        );
      }

      const duration = moment(object.finalDate).diff(
        object.initialDate,
        'days',
      );
      object = { ...object, duration };

      const newTrainingBet = await this.trainingBetRepository.create(object);
      return await this.trainingBetRepository.save(newTrainingBet);
    } catch (e) {
      throw e;
    }
  }

  async update(id: number, object: Partial<TrainingBetEntity>) {
    try {
      return await this.trainingBetRepository.update(id, object);
    } catch (e) {
      throw e;
    }
  }

  async delete(id: number): Promise<any> {
    try {
      return await this.trainingBetRepository.softDelete(id);
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number): Promise<TrainingBetEntity> {
    try {
      return await this.trainingBetRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<TrainingBetEntity>,
  ): Promise<FindReturnModelDto<TrainingBetEntity>> {
    const [rows, count] =
      await this.trainingBetRepository.findAndCount(options);
    return { rows, count };
  }
}
