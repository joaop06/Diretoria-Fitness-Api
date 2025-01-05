import { ParticipantsService } from './participants.service';
import { Exception } from '../../interceptors/exception.filter';
import { ParticipantsEntity } from './entities/participants.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdatePenaltyPaidDto } from './dto/update-penalty-paid.dto';
import { FindOptionsDto, FindReturnModelDto } from '../../dtos/find.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) { }

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

  @Put('penalty-paid')
  async updatePenaltyPaid(@Req() req, @Body() object: UpdatePenaltyPaidDto) {
    try {
      const { id: userId } = req.user;
      return await this.participantsService.updatePenaltyPaid(userId, object);
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

  @Get('participants-by-training-bet/:betId')
  async findParticipantsByTrainingBet(@Param('betId') betId: string) {
    try {
      return await this.participantsService.findParticipantsByTrainingBet(
        +betId,
      );
    } catch (e) {
      new Exception(e);
    }
  }

  @Get('winning-participants/:betId')
  async findWinningParticipants(@Param('betId') betId: string) {
    try {
      return await this.participantsService.findWinningParticipants(+betId);
    } catch (e) {
      new Exception(e);
    }
  }
}
