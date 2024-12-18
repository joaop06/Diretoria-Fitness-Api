import { Exclude, Transform } from 'class-transformer';
import { UsersLogEntity } from '../../users-logs/entities/users-log.entity';
import {
  IsNumber,
  IsString,
  IsDateString,
  IsDecimal,
  IsObject,
} from 'class-validator';

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
  @Transform(({ value }) => parseFloat(value))
  weight: number;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
  height: number;

  @Transform(({ value }) => parseFloat(value))
  bmi: number; // Body Mass Index (Índice de Massa Corporal)

  @IsNumber()
  wins: number;

  @IsNumber()
  losses: number;

  @IsNumber()
  totalFaults: number;

  @IsNumber()
  totalTrainingDays: number;

  @IsNumber()
  betsParticipated: number;

  @IsObject()
  userLogs: {
    bmiLogs: Array<UsersLogEntity>;
    heightLogs: Array<UsersLogEntity>;
    weightLogs: Array<UsersLogEntity>;
  };

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsDateString()
  deletedAt?: Date;
}
