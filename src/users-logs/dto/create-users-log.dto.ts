import { IsNumber, IsString } from 'class-validator';

export class CreateUsersLogDto {
  @IsNumber()
  userId: number;

  @IsString()
  fieldName: string;

  @IsString()
  value: string;
}
