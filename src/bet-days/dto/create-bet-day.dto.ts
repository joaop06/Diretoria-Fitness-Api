import { IsString, IsNumber } from 'class-validator';

export class CreateBetDayDto {
  @IsString()
  nameDay: string;

  @IsNumber()
  totalFaults: number;

  @IsNumber()
  utilization: number;
}
