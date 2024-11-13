import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTrainingReleasesDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Participante não informado' })
  participantId: number;

  @IsNumber()
  @IsNotEmpty()
  betDayId: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  imagePath: string;
}
