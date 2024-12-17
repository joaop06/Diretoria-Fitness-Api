import { IsNumber, IsString } from 'class-validator';

export class FindUserLogsDto {
  @IsNumber()
  userId: number;

  @IsString()
  fieldName: string;
}
