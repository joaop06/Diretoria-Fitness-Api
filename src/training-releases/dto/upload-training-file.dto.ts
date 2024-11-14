import { IsOptional, IsString } from 'class-validator';

export class UploadTrainingFile {
  @IsString()
  @IsOptional()
  imagePath: string;
}
