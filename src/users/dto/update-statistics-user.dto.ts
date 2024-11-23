import { IsNumber } from 'class-validator';

export class UpdateStatisticsUserDto {
  @IsNumber()
  wins?: number;

  @IsNumber()
  losses?: number;

  @IsNumber()
  totalFaults?: number;
}
