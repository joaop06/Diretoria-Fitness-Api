import { LevelEnum } from '../enum/log-level.enum';
import { IsOptional, IsString } from 'class-validator';

export class UpsertSystemLog {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  level?: LevelEnum = LevelEnum.INFO;

  @IsString()
  source?: string;
}
