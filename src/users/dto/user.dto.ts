import { IsNumber, IsString, IsDateString, IsDecimal } from 'class-validator';

export class UserDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password?: string;

  @IsDecimal()
  weight: number;

  @IsDecimal()
  height: number;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsDateString()
  deletedAt?: Date;
}
