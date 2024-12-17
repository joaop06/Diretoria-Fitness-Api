import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { UsersLogEntity } from './entities/users-log.entity';
import { CreateUsersLogDto } from './dto/create-users-log.dto';
import { FindOptionsDto, FindReturnModelDto } from '../../public/dto/find.dto';

@Injectable()
export class UsersLogsService {
  constructor(
    @InjectRepository(UsersLogEntity)
    private usersLogRepository: Repository<UsersLogEntity>,
  ) {}

  async create(object: CreateUsersLogDto): Promise<UsersLogEntity> {
    const userLog = this.usersLogRepository.create(object);
    return await this.usersLogRepository.save(userLog);
  }

  async findAll(
    options: FindOptionsDto<UsersLogEntity> | FindManyOptions<UsersLogEntity>,
  ): Promise<FindReturnModelDto<UsersLogEntity>> {
    const [rows, count] = await this.usersLogRepository.findAndCount(options);
    return { rows, count };
  }
}
