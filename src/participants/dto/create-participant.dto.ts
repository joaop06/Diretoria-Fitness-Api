import { IsBoolean, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateParticipantDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Usuário não informado' })
  userId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Aposta não informada' })
  trainingBetId: number;

  @IsNumber()
  @IsOptional()
  faults?: number;

  @IsBoolean()
  @IsOptional()
  declassified?: boolean;
}
