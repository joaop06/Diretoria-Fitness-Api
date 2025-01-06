import { IsNumber, IsDateString } from 'class-validator';

export class TrainingBetDto {
  @IsNumber()
  id: number;

  @IsDateString()
  finalDate: Date;

  @IsNumber()
  duration: number;

  @IsDateString()
  initialDate: Date;

  @IsNumber()
  faultsAllowed: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  minimumPenaltyAmount: number;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsDateString()
  deletedAt?: Date;
}
