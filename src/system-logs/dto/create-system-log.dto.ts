import { IsString, IsOptional } from 'class-validator';

export class CreateSystemLogDto {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  level?: 'INFO' | 'WARN' | 'ERROR' = 'INFO';

  @IsString()
  source: string;
}
