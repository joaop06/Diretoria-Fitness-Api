import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateTrainingBetDto {
  @IsDateString()
  finalDate: Date;

  @IsDateString()
  initialDate: Date;

  @IsNumber()
  faultsAllowed: number;

  @IsNumber()
  minimumPenaltyAmount: number;

  @IsNumber()
  @IsOptional()
  duration?: number;
}
