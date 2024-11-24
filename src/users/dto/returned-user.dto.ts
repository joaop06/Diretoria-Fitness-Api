import { Exclude } from 'class-transformer';
import { IsNumber, IsString, IsDateString, IsDecimal } from 'class-validator';

export class ReturnedUserDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @Exclude()
  password: string;

  @IsDecimal()
  weight: number;

  @IsDecimal()
  height: number;

  @IsNumber()
  wins: number;

  @IsNumber()
  losses: number;

  @IsNumber()
  totalFaults: number;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsDateString()
  deletedAt?: Date;
}
