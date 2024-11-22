import { IsNumber } from 'class-validator';

export class CreateRankingDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  score: number;
}
