import {
  IsEmail,
  IsNumber,
  IsString,
  MinLength,
  IsOptional,
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

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  weight?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  height?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  bmi?: number; // Body Mass Index (Índice de Massa Corporal)
}
