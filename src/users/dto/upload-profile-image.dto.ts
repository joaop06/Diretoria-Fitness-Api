import { IsOptional, IsString } from 'class-validator';

export class UploadProfileImageDto {
  @IsString()
  @IsOptional()
  profileImagePath: string;
}
