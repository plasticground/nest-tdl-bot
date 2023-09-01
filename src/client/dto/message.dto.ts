import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class MessageDto {
  @ApiProperty({
    type: Number,
    description: 'Telegram chat id',
    example: -1001987654321
  })
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  chat_id: number;

  @ApiProperty({
    type: String,
    description: 'Message text',
    example: 'Hello world!'
  })
  @IsString()
  text: string;
}