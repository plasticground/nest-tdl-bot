import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsPhoneNumber } from "class-validator";
import { Type } from "class-transformer";

export class LoginDto {
  @ApiProperty({
    type: String,
    description: 'Your telegram phone number',
    example: '+79998887766'
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({
    type: Number,
    description: 'Telegram login code',
    example: 12345
  })
  @Type(() => String)
  @IsNumberString()
  @IsOptional()
  code: string;
}