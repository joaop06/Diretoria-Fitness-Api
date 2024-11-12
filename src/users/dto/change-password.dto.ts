import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Usuário não informado' })
  userId: number;

  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}
