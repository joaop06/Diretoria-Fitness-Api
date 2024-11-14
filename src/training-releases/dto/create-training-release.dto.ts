import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTrainingReleasesDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Participante não informado' })
  participantId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Dia de treino não informado' })
  betDayId: number;

  @IsString()
  @IsNotEmpty({ message: 'Tipo de treino não informado' })
  trainingType: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
