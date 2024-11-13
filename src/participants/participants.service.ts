import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/users.entity';
import { ParticipantsEntity } from './participants.entity';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { TrainingBetEntity } from 'src/training-bet/training-bet.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(ParticipantsEntity)
    private participantsRepository: Repository<ParticipantsEntity>,

    @InjectRepository(TrainingBetEntity)
    private trainingBetRepository: Repository<TrainingBetEntity>,

    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async create(object: CreateParticipantDto): Promise<ParticipantsEntity> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: object.userId },
      });
      const trainingBet = await this.trainingBetRepository.findOne({
        where: { id: object.trainingBetId },
      });
      if (!user || !trainingBet)
        throw new Error(`Usuário ou Aposta não encontrada`);

      const today = moment();
      const initialDate = moment(trainingBet.initialDate);
      if (today.isAfter(initialDate)) {
        throw new Error(`Não é possível participar de uma aposta em andamento`);
      }

      const foundParticipant = await this.participantsRepository.findOne({
        where: {
          user: { id: user.id },
          trainingBet: { id: trainingBet.id },
        },
        relations: ['user', 'trainingBet'],
      });
      if (foundParticipant) {
        const error = new Error(
          `${user.name} já está participando desta aposta`,
        );
        throw Object.assign(error, { statusCode: 409 });
      }

      const newParticipant = this.participantsRepository.create({
        user,
        trainingBet,
      });
      return await this.participantsRepository.save(newParticipant);
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

  async findOne(id: number): Promise<ParticipantsEntity> {
    try {
      return await this.participantsRepository.findOne({
        where: { id },
        relations: ['user', 'trainingBet'],
        select: {
          user: {
            id: true,
            name: true,
          },
          trainingBet: {
            id: true,
            duration: true,
            completed: true,
            faultsAllowed: true,
          },
        },
      });
    } catch (e) {
      throw e;
    }
  }

  async findAll(
    options: FindOptionsDto<ParticipantsEntity>,
  ): Promise<FindReturnModelDto<ParticipantsEntity>> {
    try {
      const [rows, count] =
        await this.participantsRepository.findAndCount(options);
      return { rows, count };
    } catch (e) {
      throw e;
    }
  }
}
