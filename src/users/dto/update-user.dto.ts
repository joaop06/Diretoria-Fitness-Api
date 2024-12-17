import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

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
