import { IsDateString, IsNumber } from 'class-validator';

export class CreateTrainingBetDto {
  @IsDateString()
  finalDate: Date;

  @IsDateString()
  initialDate: Date;

  @IsNumber()
  faultsAllowed: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  minimumPenaltyAmount: number;
}
