import { IsString } from 'class-validator';

export class CreateTrainingReleasesDto {
  @IsString()
  comment: string;

  @IsString()
  imagePath: string;
}
