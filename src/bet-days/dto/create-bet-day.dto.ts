import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateBetDayDto {
  @IsString()
  @IsNotEmpty()
  nameDay: string;

  @IsNumber()
  @IsNotEmpty()
  trainingBetId: number;
}
