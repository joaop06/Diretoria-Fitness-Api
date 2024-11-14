import { IsString, IsEmail, IsOptional, IsDecimal } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  password: string;

  @IsDecimal()
  @IsOptional()
  weight?: number;

  @IsDecimal()
  @IsOptional()
  height?: number;
}
