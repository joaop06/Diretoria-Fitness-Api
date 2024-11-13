import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { TrainingBetEntity } from 'src/training-bet/training-bet.entity';

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
