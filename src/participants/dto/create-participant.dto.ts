import { IsBoolean, IsNumber } from "class-validator";

export class CreateParticipantDto {
    @IsNumber()
    faults: number;

    @IsBoolean()
    declassified: boolean;
}
