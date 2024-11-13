import { Exception } from 'interceptors/exception.filter';
import { ParticipantsEntity } from './participants.entity';
import { ParticipantsService } from './participants.service';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  async create(
    @Body() object: CreateParticipantDto,
  ): Promise<ParticipantsEntity> {
    try {
      return await this.participantsService.create(object);
    } catch (e) {
      new Exception(e);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() object: Partial<ParticipantsEntity>,
  ): Promise<any> {
    try {
      return await this.participantsService.update(+id, object);
    } catch (e) {
      throw new Error(`Falha ao atualizar lançamento: ${e.message}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ParticipantsEntity> {
    try {
      return await this.participantsService.findOne(+id);
    } catch (e) {
      throw e;
    }
  }

  @Get()
  async findAll(
    @Query() options: FindOptionsDto<ParticipantsEntity>,
  ): Promise<FindReturnModelDto<ParticipantsEntity>> {
    try {
      return await this.participantsService.findAll(options);
    } catch (e) {
      new Exception(e);
    }
  }
}
