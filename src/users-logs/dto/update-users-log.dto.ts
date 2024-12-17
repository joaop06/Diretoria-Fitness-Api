import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersLogDto } from './create-users-log.dto';

export class UpdateUsersLogDto extends PartialType(CreateUsersLogDto) {}
