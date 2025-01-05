import { IsEmail, IsNumber, IsString } from 'class-validator';

export class SendVerificationCodeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  code: number;
}
