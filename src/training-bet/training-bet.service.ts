import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingBetEntity } from './training-bet.entity';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { CreateTrainingBetDto } from './dto/create-training-bet.dto';
import { BetDaysService } from 'src/bet-days/bet-days.service';

@Injectable()
export class TrainingBetService {
  constructor(
    @InjectRepository(TrainingBetEntity)
    private trainingBetRepository: Repository<TrainingBetEntity>,
    private betDaysService: BetDaysService,
  ) {}

  @Cron('* */1 * * *')
  testCron() {
    console.log(
      `Rodando job em TrainingBetService a cada minuto: ${moment().format('DD/MM/YY HH:mm:ss')}`,
    );
  }

  async #periodConflict(object: Partial<CreateTrainingBetDto>) {
    const conflict = await this.trainingBetRepository
      .createQueryBuilder('training_bet')
      .where('training_bet.initialDate < :finalDate', {
        finalDate: object.finalDate,
      })
      .andWhere('training_bet.finalDate > :initialDate', {
        initialDate: object.initialDate,
      })
      .getOne();

    if (!!conflict) {
      throw new Error(
        'Já existe uma aposta em andamento entre o período informado',
      );
    }
  }

  #betStarted(initialDate: Date | string) {
    const today = moment().startOf('day');
    const initialDateMoment = moment(initialDate).startOf('day');
    if (
      today.isBefore(initialDateMoment) &&
      today.diff(initialDateMoment, 'days') > 0
    ) {
      throw new Error(
        'A aposta deve ser programada com no mínimo 1 dia de antecedência',
      );
    }
  }

  #defineDuration(object: Partial<TrainingBetEntity>) {
    const duration = moment(object.finalDate).diff(object.initialDate, 'days');

    return { ...object, duration };
  }

  async #createBetDays(
    trainingBetId: number,
    duration: number,
    initialDate: Date | string,
  ) {
    const betDays = [];
    for (let i = 0; i < duration; i++) {
      const currentDay = moment(initialDate).locale('pt-br').add(i, 'days');

      const name = currentDay.format('ddd');
      const formatedName = name[0].toUpperCase() + name.slice(1);

      betDays.push({
        trainingBetId: trainingBetId,
        nameDay: `${formatedName} ${currentDay.format('DD/MM')}`,
      });
    }

    await this.betDaysService.bulkCreate(betDays);
  }

  async create(object: CreateTrainingBetDto): Promise<TrainingBetEntity> {
    try {
      if (moment(object.initialDate).isAfter(moment(object.finalDate))) {
        throw new Error(`Período da aposta inválido`);
      }

      // Valida se há conflito das datas
      await this.#periodConflict(object);

      // Valida se a aposta já foi iniciada
      this.#betStarted(object.initialDate);

      const newObject = this.#defineDuration(object);
      const newTrainingBet = this.trainingBetRepository.create(newObject);
      const result = await this.trainingBetRepository.save(newTrainingBet);

      await this.#createBetDays(result.id, object.duration, object.initialDate);

      return result;
    } catch (e) {
      throw e;
    }
  }

  async update(id: number, object: Partial<TrainingBetEntity>) {
    try {
      // Valida se há conflito das datas
      const trainingBet = await this.findOne(id);

      let newTrainingBet: Partial<TrainingBetEntity> = {
        ...object,
        finalDate: object.finalDate ?? trainingBet.finalDate,
        initialDate: object.initialDate ?? trainingBet.initialDate,
      };

      await this.#periodConflict(newTrainingBet);

      // Valida se a aposta já foi iniciada
      if (object.initialDate) this.#betStarted(object.initialDate);

      newTrainingBet = this.#defineDuration(newTrainingBet);

      /**
       * TODO: Atualizar, Deletar ou Inserir dias da aposta baseado no período atualizado
       */

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
