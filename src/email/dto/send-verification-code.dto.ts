import { IsEmail, IsNumber } from 'class-validator';

export class SendVerificationCodeDto {
  @IsEmail()
  email: string;

  @IsNumber()
  code: number;
}
