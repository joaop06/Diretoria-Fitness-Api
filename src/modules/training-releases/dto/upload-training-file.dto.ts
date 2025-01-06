import { IsOptional, IsString } from 'class-validator';

export class UploadTrainingFileDto {
  @IsString()
  @IsOptional()
  imagePath: string;
}
