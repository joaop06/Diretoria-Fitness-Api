import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { ParticipantsEntity } from './participants.entity';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { TrainingBetService } from 'src/training-bet/training-bet.service';

@Injectable()
export class ParticipantsService {
    constructor(
        @InjectRepository(ParticipantsEntity)
        private participantsRepository: Repository<ParticipantsEntity>,
        private trainingBetService: TrainingBetService,
        private usersService: UsersService,
    ) { }

    async create(object: CreateParticipantDto): Promise<ParticipantsEntity> {
        try {
            const trainingBet = await this.trainingBetService.findOne(
                object.trainingBetId,
            );
            if (!trainingBet) {
                throw new Error(`Aposta não encontrada`);
            }

            const user = await this.usersService.findOne(object.trainingBetId);
            if (!user) {
                throw new Error(`Usuário não encontrado`);
            }

            const today = moment();
            const initialDate = moment(trainingBet.initialDate);
            if (today.isAfter(initialDate)) {
                throw new Error(`Não é possível participar de uma aposta em andamento`);
            }

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

    async findAll(
        options: FindOptionsDto<ParticipantsEntity>,
    ): Promise<FindReturnModelDto<ParticipantsEntity>> {
        const [rows, count] =
            await this.participantsRepository.findAndCount(options);
        return { rows, count };
    }
}
