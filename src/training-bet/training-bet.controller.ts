import { TrainingBetService } from './training-bet.service';
import { TrainingBetEntity } from './entities/training-bet.entity';
import { CreateTrainingBetDto } from './dto/create-training-bet.dto';
import { Exception } from '../../public/interceptors/exception.filter';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';
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

@Controller('training-bet')
export class TrainingBetController {
  constructor(private readonly trainingBetService: TrainingBetService) { }

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
      return await this.trainingBetService.findOne(+id);
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
      return await this.trainingBetService.findAll(options);
    } catch (e) {
      new Exception(e);
    }
  }
}
