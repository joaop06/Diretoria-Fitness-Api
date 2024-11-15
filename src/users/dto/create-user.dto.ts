import {
  IsString,
  IsEmail,
  IsOptional,
  IsDecimal,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsDecimal()
  @IsOptional()
  weight?: number;

  @IsDecimal()
  @IsOptional()
  height?: number;
}
