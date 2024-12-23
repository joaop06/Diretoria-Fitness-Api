import { IsNumber } from "class-validator";

export class UserVerificationCodeDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    code: number;
}