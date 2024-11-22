import { IsString } from 'class-validator';

export class CreateSystemLogDto {
  @IsString()
  message: string;

  // @IsString()
  // level: string;

  @IsString()
  source: string;
}
