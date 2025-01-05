import { Controller, Get } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { Exception } from '../../interceptors/exception.filter';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) { }

  @Get()
  async findAll() {
    try {
      return await this.rankingService.findAll();
    } catch (e) {
      new Exception(e);
    }
  }
}
