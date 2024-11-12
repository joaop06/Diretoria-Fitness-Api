import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantsEntity } from './participants.entity';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';

@Injectable()
export class ParticipantsService {
    constructor(
        @InjectRepository(ParticipantsEntity)
        private participantsRepository: Repository<ParticipantsEntity>,
    ) { }

    async create(object: CreateParticipantDto): Promise<ParticipantsEntity> {
        try {
            return await this.participantsRepository.save(object);
        } catch (e) {
            throw e;
        }
    }

    async update(id: number, object: Partial<ParticipantsEntity>) {
        try {
            return await this.participantsRepository.update(id, object);
        } catch (e) {
            throw e;
        }
    }

    async delete(id: number): Promise<any> {
        try {
            return await this.participantsRepository.softDelete(id);
        } catch (e) {
            throw e;
        }
    }

    async findOne(id: number): Promise<ParticipantsEntity> {
        try {
            return await this.participantsRepository.findOne({ where: { id } });
        } catch (e) {
            throw e;
        }
    }

    async findAll(options: FindOptionsDto<ParticipantsEntity>): Promise<FindReturnModelDto<ParticipantsEntity>> {
        const [rows, count] = await this.participantsRepository.findAndCount(options);
        return { rows, count };
    }
}
