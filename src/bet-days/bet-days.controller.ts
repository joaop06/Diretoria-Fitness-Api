import { BetDaysEntity } from './bet-days.entity';
import { BetDaysService } from './bet-days.service';
import { Exception } from 'interceptors/exception.filter';
import { CreateBetDayDto } from './dto/create-bet-day.dto';
import { FindOptionsDto, FindReturnModelDto } from 'dto/find.dto';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

@Controller('bet-days')
export class BetDaysController {
    constructor(private readonly betDaysService: BetDaysService) { }

    @Post()
    async create(@Body() object: CreateBetDayDto,): Promise<BetDaysEntity> {
        try {
            return await this.betDaysService.create(object);
        } catch (e) {
            throw new Error(`Falha ao inserir lançamento: ${e.message}`);
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() object: Partial<BetDaysEntity>,
    ): Promise<any> {
        try {
            return await this.betDaysService.update(+id, object);
        } catch (e) {
            throw new Error(`Falha ao atualizar lançamento: ${e.message}`);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
        try {
            return await this.betDaysService.delete(+id);
        } catch (e) {
            new Exception({ ...e, message: `Falha ao deletar lançamento: ${e.message}` });
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<BetDaysEntity> {
        try {
            return await this.betDaysService.findOne(+id);
        } catch (e) {
            throw e;
        }
    }

    @Get()
    async findAll(@Query() options: FindOptionsDto<BetDaysEntity>): Promise<FindReturnModelDto<BetDaysEntity>> {
        try {
            return await this.betDaysService.findAll(options);

        } catch (e) {
            new Exception(e);
        }
    }
}
