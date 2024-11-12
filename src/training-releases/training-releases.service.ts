import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingReleasesEntity } from './training-releases.entity';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { CreateTrainingReleasesDto } from './dto/create-training-release.dto';

@Injectable()
export class TrainingReleasesService {
    constructor(
        @InjectRepository(TrainingReleasesEntity)
        private trainingBetRepository: Repository<TrainingReleasesEntity>,
    ) { }

    async create(object: CreateTrainingReleasesDto): Promise<TrainingReleasesEntity> {
        try {
            return await this.trainingBetRepository.save(object);
        } catch (e) {
            throw e;
        }
    }

    async update(id: number, object: Partial<TrainingReleasesEntity>) {
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

    async findOne(id: number): Promise<TrainingReleasesEntity> {
        try {
            return await this.trainingBetRepository.findOne({ where: { id } });
        } catch (e) {
            throw e;
        }
    }

    async findAll(options: FindOptionsDto<TrainingReleasesEntity>): Promise<FindReturnModelDto<TrainingReleasesEntity>> {
        const [rows, count] = await this.trainingBetRepository.findAndCount(options);
        return { rows, count };
    }
}
