import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BetDaysEntity } from './bet-days.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBetDayDto } from './dto/create-bet-day.dto';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';

@Injectable()
export class BetDaysService {
  constructor(
    @InjectRepository(BetDaysEntity)
    private betDaysRepository: Repository<BetDaysEntity>,
  ) {}

  async create(object: CreateBetDayDto): Promise<BetDaysEntity> {
    try {
      const newBetDay = this.betDaysRepository.create(object);
      return await this.betDaysRepository.save(newBetDay);
    } catch (e) {
      throw e;
    }
  }

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

  async delete(id: number): Promise<any> {
    try {
      return await this.betDaysRepository.softDelete(id);
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: number): Promise<BetDaysEntity> {
    try {
      return await this.betDaysRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<BetDaysEntity>,
  ): Promise<FindReturnModelDto<BetDaysEntity>> {
    const [rows, count] = await this.betDaysRepository.findAndCount(options);
    return { rows, count };
  }
}
