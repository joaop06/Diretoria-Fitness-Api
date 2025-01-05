import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpsertSystemLog } from './dto/upsert-system-log.dto';
import { SystemLogEntity } from './entities/system-log.entity';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemLogEntity)
    private systemLogRepository: Repository<SystemLogEntity>,
  ) {}

  async upsert(object: UpsertSystemLog) {
    const existingLog = await this.systemLogRepository.findOne({
      where: { message: object.message, source: object.source },
    });

    const newLog = { ...object, env: process.env.NODE_ENV };

    if (existingLog) {
      // Atualiza o registro existente
      return await this.systemLogRepository.update(existingLog.id, newLog);
    } else {
      // Cria um novo registro
      return await this.systemLogRepository.save(newLog);
    }
  }
}
