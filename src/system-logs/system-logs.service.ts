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

  async upsert(object: Partial<SystemLogEntity>) {
    const existingLog = await this.systemLogRepository.findOne({
      where: { message: object.message, source: object.source },
    });

    if (existingLog) {
      // Atualiza o registro existente
      return await this.systemLogRepository.update(existingLog.id, object);
    } else {
      // Cria um novo registro
      return await this.systemLogRepository.save(object);
    }
  }
}
