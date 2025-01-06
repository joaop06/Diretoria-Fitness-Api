import { IsNumber } from 'class-validator';

export class UpdatePenaltyPaidDto {
  @IsNumber()
  participantId: number;

  @IsNumber()
  trainingBetId: number;
}
