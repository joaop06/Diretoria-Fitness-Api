import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemLogEntity } from './entities/system-log.entity';
import { CreateSystemLogDto } from './dto/create-system-log.dto';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemLogEntity)
    private systemLogRepository: Repository<SystemLogEntity>,
  ) {}

  async create(object: CreateSystemLogDto) {
    return await this.systemLogRepository.save(object);
  }
}
