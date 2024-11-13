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

  async #validatePeriodConflict(object: Partial<TrainingBetEntity>) {
    let conflict: TrainingBetEntity | null;
    if (object.id) {
      conflict = await this.trainingBetRepository
        .createQueryBuilder('training_bet')
        .where('training_bet.initialDate < :finalDate', {
          finalDate: object.finalDate,
        })
        .andWhere('training_bet.finalDate > :initialDate', {
          initialDate: object.initialDate,
        })
        .andWhere('training_bet.id != :id', { id: object.id })
        .getOne();
    } else {
      conflict = await this.trainingBetRepository
        .createQueryBuilder('training_bet')
        .where('training_bet.initialDate < :finalDate', {
          finalDate: object.finalDate,
        })
        .andWhere('training_bet.finalDate > :initialDate', {
          initialDate: object.initialDate,
        })
        .getOne();
    }

    if (!!conflict) {
      throw new Error(
        'Já existe uma aposta em andamento entre o período informado',
      );
    }
  }

  #validateBetStarted(initialDate: Date | string) {
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
    // +1 para considerar também o dia atual
    const duration =
      moment(object.finalDate).diff(object.initialDate, 'days') + 1;

    return { ...object, duration };
  }

  async #syncBetDays(
    trainingBetId: number,
    duration: number,
    initialDate: Date | string,
  ) {
    const trainingBet = await this.findOne(trainingBetId);

    const existingBetDays =
      await this.betDaysService.findAllByTrainingBetId(trainingBetId);
    const currentCount = existingBetDays.length;

    const betDays = [];
    for (let i = 0; i < duration; i++) {
      const currentDay = moment(initialDate).locale('pt-br').add(i, 'days');

      const name = currentDay.format('ddd');
      const formatedName = name[0].toUpperCase() + name.slice(1);

      betDays.push({
        trainingBet,
        name: formatedName,
        day: currentDay.format('YYYY-MM-DD'),
      });
    }

    if (duration > currentCount) {
      /**
       * Se a nova duração é maior que a quantidade atual de dias
       */
      await this.betDaysService.bulkCreate(betDays);
    } else if (duration < currentCount) {
      /**
       * Deleta os dias sobressalentes a nova duração da aposta
       */
      const idsToRemove = existingBetDays
        .filter(
          (day) =>
            !betDays.find(
              (item) =>
                item.day === day.day &&
                item.name === day.name &&
                item.trainingBet.id === day.trainingBet.id,
            ),
        )
        .map((item) => item.id);

      await this.betDaysService.bulkDelete(idsToRemove);
    }
  }

  async create(object: CreateTrainingBetDto): Promise<TrainingBetEntity> {
    try {
      if (moment(object.initialDate).isAfter(moment(object.finalDate))) {
        throw new Error(`Período da aposta inválido`);
      }

      // Valida se há conflito das datas
      await this.#validatePeriodConflict(object);

      // Valida se a aposta já foi iniciada
      this.#validateBetStarted(object.initialDate);

      const newObject = this.#defineDuration(object);
      const newTrainingBet = this.trainingBetRepository.create(newObject);
      const result = await this.trainingBetRepository.save(newTrainingBet);

      await this.#syncBetDays(result.id, result.duration, object.initialDate);

      return result;
    } catch (e) {
      throw e;
    }
  }

  async update(id: number, object: Partial<TrainingBetEntity>) {
    try {
      // Valida se há conflito das datas
      const trainingBet = await this.findOne(id);
      if (!trainingBet) throw new Error('Aposta não encontrada');

      let newTrainingBet: Partial<TrainingBetEntity> = {
        ...object,
        finalDate: object.finalDate ?? trainingBet.finalDate,
        initialDate: object.initialDate ?? trainingBet.initialDate,
      };

      // Valida se há conflito das datas
      await this.#validatePeriodConflict({ id, ...newTrainingBet });

      // Valida se a aposta já foi iniciada
      if (object.initialDate) this.#validateBetStarted(object.initialDate);

      newTrainingBet = this.#defineDuration(newTrainingBet);
      const result = await this.trainingBetRepository.update(
        id,
        newTrainingBet,
      );

      await this.#syncBetDays(
        id,
        newTrainingBet.duration,
        newTrainingBet.initialDate,
      );

      return result;
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
