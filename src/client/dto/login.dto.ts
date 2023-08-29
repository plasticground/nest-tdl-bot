import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber} from "class-validator";

export class LoginDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsPhoneNumber()
    phone_number: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    code: number;
}