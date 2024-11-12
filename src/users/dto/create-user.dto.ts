import { IsString, IsEmail, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  role?: string;
}
