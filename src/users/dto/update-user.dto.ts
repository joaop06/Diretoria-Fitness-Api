import { IsString, IsOptional, IsDecimal } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsDecimal()
  @IsOptional()
  weight?: number;

  @IsDecimal()
  @IsOptional()
  height?: number;
}
