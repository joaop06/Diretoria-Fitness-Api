import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BetDaysEntity } from './entities/bet-days.entity';
import { CreateBetDayDto } from './dto/create-bet-day.dto';

@Injectable()
export class BetDaysService {
  constructor(
    @InjectRepository(BetDaysEntity)
    private betDaysRepository: Repository<BetDaysEntity>,
  ) {}

  async bulkCreate(allBetDays: CreateBetDayDto[]) {
    try {
      const betDaysInstances = allBetDays.map((day) =>
        this.betDaysRepository.create(day),
      );

      for (const betDay of betDaysInstances) {
        const foundBetDay = await this.betDaysRepository.findOne({
          where: {
            day: betDay.day,
            trainingBet: { id: betDay.trainingBet.id },
          },
          withDeleted: true,
          relations: ['trainingBet'],
        });

        if (foundBetDay === null) await this.betDaysRepository.save(betDay);
        else if (foundBetDay.deletedAt)
          await this.betDaysRepository.update(foundBetDay.id, {
            ...betDay,
            deletedAt: null,
          });
      }
    } catch (e) {
      throw e;
    }
  }

  async update(id: number, object: Partial<BetDaysEntity>) {
    try {
      return await this.betDaysRepository.update(id, object);
    } catch (e) {
      throw e;
    }
  }

  async bulkDelete(ids: number[]): Promise<any> {
    try {
      for (const id of ids) await this.betDaysRepository.delete(id);
      return;
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number) {
    try {
      return await this.betDaysRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async findAllByTrainingBetId(trainingBetId: number) {
    try {
      return await this.betDaysRepository.find({
        order: { day: 'ASC' },
        relations: ['trainingBet'],
        where: { trainingBet: { id: trainingBetId } },
      });
    } catch (e) {
      throw e;
    }
  }
}
