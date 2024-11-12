import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingBetEntity } from './training-bet.entity';
import { CreateTrainingBetDto } from './dto/create-training-bet.dto';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';

@Injectable()
export class TrainingBetService {
    constructor(
        @InjectRepository(TrainingBetEntity)
        private trainingBetRepository: Repository<TrainingBetEntity>,
    ) { }

    async create(object: CreateTrainingBetDto): Promise<TrainingBetEntity> {
        try {
            const conflictingBet = await this.trainingBetRepository
                .createQueryBuilder('training_bet')
                .where('training_bet.initialDate < :finalDate', { finalDate: object.finalDate })
                .andWhere('training_bet.finalDate > :initialDate', { initialDate: object.initialDate })
                .getOne();

            if (!!conflictingBet) {
                throw new Error('Já existe uma aposta em andamento entre o período informado.');
            }

            const duration = moment(object.finalDate).diff(object.initialDate, 'days');

            const result = await this.trainingBetRepository.save({ ...object, duration });
            return result;

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

    async findAll(options: FindOptionsDto<TrainingBetEntity>): Promise<FindReturnModelDto<TrainingBetEntity>> {
        const [rows, count] = await this.trainingBetRepository.findAndCount(options);
        return { rows, count };
    }
}
