import { IsOptional, IsString } from 'class-validator';

export class CreateTrainingReleasesDto {
  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  imagePath: string;
}
