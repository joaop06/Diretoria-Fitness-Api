import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { BetDaysEntity } from './entities/bet-days.entity';
import { CreateBetDayDto } from './dto/create-bet-day.dto';
import { LevelEnum } from '../system-logs/enum/log-level.enum';
import { SystemLogsService } from '../system-logs/system-logs.service';

@Injectable()
export class BetDaysService {
  private logger = new Logger();

  constructor(
    @InjectRepository(BetDaysEntity)
    private betDaysRepository: Repository<BetDaysEntity>,

    private systemLogsService: SystemLogsService,
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

  async updateUtilization(betDayId: number) {
    try {
      const betDay = await this.betDaysRepository.findOne({
        where: { id: betDayId },
        relations: [
          'trainingBet',
          'trainingReleases',
          'trainingBet.participants',
        ],
      });

      const {
        trainingReleases,
        trainingBet: { participants },
      } = betDay;

      const quantityParticipants = participants.length;
      const quantityTraining = trainingReleases.length;
      const totalFaults = quantityParticipants - quantityTraining;

      // Cálculo do aproveitamento em percentual
      const utilization = parseFloat(
        (100 - (totalFaults / participants.length) * 100).toFixed(2),
      );

      // Atualiza o registro do dia
      await this.update(betDay.id, {
        utilization: isNaN(utilization) ? 0 : utilization,
      });
    } catch (e) {
      this.logger.error(e);
      await this.systemLogsService.upsert({
        level: LevelEnum.ERROR,
        message: `Falha ao atualizar aproveitamento do dia de treino ${betDayId}`,
      });
    }
  }

  async getTotalTrainingDays(userId: number) {
    try {
      const days = await this.betDaysRepository.find({
        where: { trainingReleases: { participant: { userId } } },
      });

      return days.length;
    } catch (e) {
      throw e;
    }
  }
}
