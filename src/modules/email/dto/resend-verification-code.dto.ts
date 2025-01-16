import { IsNumber } from 'class-validator';

export class ResendVerificationCodeDto {
  @IsNumber()
  userId: number;
}
