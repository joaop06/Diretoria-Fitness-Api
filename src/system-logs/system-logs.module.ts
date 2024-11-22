import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemLogsService } from './system-logs.service';
import { SystemLogEntity } from './entities/system-log.entity';

@Module({
  exports: [SystemLogsService],
  providers: [SystemLogsService],
  imports: [TypeOrmModule.forFeature([SystemLogEntity])],
})
export class SystemLogsModule {}
