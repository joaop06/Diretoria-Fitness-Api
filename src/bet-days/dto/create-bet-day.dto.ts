import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { TrainingBetEntity } from '../../training-bets/entities/training-bet.entity';

export class CreateBetDayDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  trainingBet: TrainingBetEntity;
}
