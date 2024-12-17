import { Controller, Get, Query } from '@nestjs/common';
import { UsersLogsService } from './users-logs.service';
import { UsersLogEntity } from './entities/users-log.entity';
import { Exception } from '../../public/interceptors/exception.filter';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';

@Controller('users-logs')
export class UsersLogsController {
  constructor(private readonly usersLogsService: UsersLogsService) {}

  @Get()
  async findAll(
    @Query() options: FindOptionsDto<UsersLogEntity>,
  ): Promise<FindReturnModelDto<UsersLogEntity>> {
    try {
      return await this.usersLogsService.findAll(options);
    } catch (e) {
      new Exception(e);
    }
  }
}
