import { plainToClass } from 'class-transformer';
import { TrainingBetsService } from './training-bets.service';
import { Exception } from '../../interceptors/exception.filter';
import { TrainingBetEntity } from './entities/training-bet.entity';
import { CreateTrainingBetDto } from './dto/create-training-bet.dto';
import { FindOptionsDto, FindReturnModelDto } from '../../dtos/find.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

@Controller('training-bets')
export class TrainingBetsController {
  constructor(private readonly trainingBetService: TrainingBetsService) { }

  @Post()
  async create(
    @Body() object: CreateTrainingBetDto,
  ): Promise<TrainingBetEntity> {
    try {
      return await this.trainingBetService.create(object);
    } catch (e) {
      new Exception(e);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() object: Partial<TrainingBetEntity>,
  ): Promise<any> {
    try {
      return await this.trainingBetService.update(+id, object);
    } catch (e) {
      const message = `Falha ao atualizar aposta: ${e.message}`;
      new Exception({ ...e, message });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    try {
      return await this.trainingBetService.delete(+id);
    } catch (e) {
      const message = `Falha ao deletar aposta: ${e.message}`;
      new Exception({ ...e, message });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TrainingBetEntity> {
    try {
      const trainingBet = await this.trainingBetService.findOne(+id);
      return plainToClass(TrainingBetEntity, trainingBet);
    } catch (e) {
      const message = `Falha ao buscar aposta: ${e.message}`;
      new Exception({ ...e, message });
    }
  }

  @Get()
  async findAll(
    @Query() options: FindOptionsDto<TrainingBetEntity>,
  ): Promise<FindReturnModelDto<TrainingBetEntity>> {
    try {
      const trainingBets = await this.trainingBetService.findAll(options);
      trainingBets.rows = trainingBets.rows.map((trainingBet) =>
        plainToClass(TrainingBetEntity, trainingBet),
      );

      return trainingBets;
    } catch (e) {
      new Exception(e);
    }
  }
}
