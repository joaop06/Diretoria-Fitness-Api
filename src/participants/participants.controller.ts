import { ParticipantsService } from './participants.service';
import { ParticipantsEntity } from './entities/participants.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { Exception } from '../../public/interceptors/exception.filter';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';
import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  async create(
    @Req() req,
    @Body() object: CreateParticipantDto,
  ): Promise<ParticipantsEntity> {
    try {
      if (req.user.id !== +object.userId) {
        throw new Error('Não é possível inscrever outro usuário na aposta');
      }

      return await this.participantsService.create(object);
    } catch (e) {
      new Exception(e);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ParticipantsEntity> {
    try {
      return await this.participantsService.findOne(+id);
    } catch (e) {
      new Exception(e);
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
