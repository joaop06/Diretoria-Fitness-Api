import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersLogsService } from './users-logs.service';
import { UsersLogEntity } from './entities/users-log.entity';
import { UsersLogsController } from './users-logs.controller';

@Module({
  exports: [UsersLogsService],
  providers: [UsersLogsService],
  controllers: [UsersLogsController],
  imports: [TypeOrmModule.forFeature([UsersLogEntity])],
})
export class UsersLogsModule {}
