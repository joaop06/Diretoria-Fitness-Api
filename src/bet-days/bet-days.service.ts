import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BetDaysEntity } from './bet-days.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBetDayDto } from './dto/create-bet-day.dto';

@Injectable()
export class BetDaysService {
  constructor(
    @InjectRepository(BetDaysEntity)
    private betDaysRepository: Repository<BetDaysEntity>,
  ) {}

  async bulkCreate(days: CreateBetDayDto[]) {
    try {
      const betDays = days.map((day) => this.betDaysRepository.create(day));
      return await this.betDaysRepository.save(betDays);
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
      for (const id of ids) await this.betDaysRepository.softDelete(id);
      return;
    } catch (e) {
      throw e;
    }
  }

  async findAllByTrainingBetId(trainingBetId: number) {
    try {
      return await this.betDaysRepository.find({
        relations: ['trainingBet'],
        where: { trainingBet: { id: trainingBetId } },
      });
    } catch (e) {
      throw e;
    }
  }
}
