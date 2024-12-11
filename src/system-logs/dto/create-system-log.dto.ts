import { LevelEnum } from '../enum/log-level.enum';
import { IsString, IsOptional } from 'class-validator';

export class CreateSystemLogDto {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  level?: LevelEnum = LevelEnum.INFO;

  @IsString()
  source: string;
}
