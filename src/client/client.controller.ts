import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ClientService } from './client.service'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { MessageDto } from "./dto/message.dto";
import type { Chat, User, Message, Ok } from "tdlib-types";

@ApiTags('Docs')
@Controller()
export class ClientController {
  constructor(private readonly service: ClientService) {
  }

  @ApiOperation({ description: 'Get the current user' })
  @ApiOkResponse({ description: 'Returns the current user' })
  @ApiInternalServerErrorResponse({ description: 'Telegram error' })
  @Get('getMe')
  getMe(): Promise<User> {
    return this.service.getMe()
  }

  @ApiOperation({ description: 'Get the chat info by ID' })
  @ApiOkResponse({ description: 'Returns the chat info by ID' })
  @ApiInternalServerErrorResponse({ description: 'Telegram error' })
  @ApiParam({
    name: 'chat_id',
    description: 'Telegram chat ID',
    type: Number,
    example: -1001987654321
  })
  @Get('getChat/:chat_id')
  getChat(@Param('chat_id') chat_id: number): Promise<Chat> {
    return this.service.getChat(chat_id)
  }

  @ApiOperation({ description: 'Send message' })
  @ApiCreatedResponse({ description: 'Send text message to telegram chat' })
  @ApiInternalServerErrorResponse({ description: 'Telegram error' })
  @ApiBody({
    description: 'Telegram chat ID and message text',
    type: MessageDto
  })
  @Post('sendMessage')
  @UsePipes(new ValidationPipe({ transform: true }))
  sendMessage(@Body() messageDto: MessageDto): Promise<Message> {
    return this.service.sendMessage(messageDto)
  }

  @ApiOperation({ description: 'Send multiple messages' })
  @ApiCreatedResponse({ description: 'Send multiple text messages to multiple telegram chats' })
  @ApiInternalServerErrorResponse({ description: 'Telegram error' })
  @ApiBody({
    description: 'Telegram chat IDs and text messages',
    type: [MessageDto]
  })
  @Post('sendMessages')
  @UsePipes(new ValidationPipe({ transform: true }))
  sendMessages(@Body() messagesDto: MessageDto[]): Promise<Ok> {
    return this.service.sendMessages(messagesDto)
  }
}
