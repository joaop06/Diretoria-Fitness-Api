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
    private trainingBetRepository: Repository<BetDaysEntity>,
  ) {}

  async create(object: CreateBetDayDto): Promise<BetDaysEntity> {
    try {
      return await this.trainingBetRepository.save(object);
    } catch (e) {
      throw e;
    }
  }

  async update(id: number, object: Partial<BetDaysEntity>) {
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

  async findOne(id: number): Promise<BetDaysEntity> {
    try {
      return await this.trainingBetRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<BetDaysEntity>,
  ): Promise<FindReturnModelDto<BetDaysEntity>> {
    const [rows, count] =
      await this.trainingBetRepository.findAndCount(options);
    return { rows, count };
  }
}
