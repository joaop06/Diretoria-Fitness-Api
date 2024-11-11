import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsNotEmpty, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsNumber()
    @ApiProperty({ example: 1 })
    @IsNotEmpty({ message: 'Usuário não informado' })
    userId: number;

    @IsString()
    @ApiProperty({ example: 'test123' })
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    oldPassword: string;

    @IsString()
    @ApiProperty({ example: '123test@' })
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    newPassword: string;
}