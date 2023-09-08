import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ClientService } from './client.service'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { MessageDto } from "./dto/message.dto";

@ApiTags('Docs')
@Controller()
export class ClientController {
  constructor(private readonly service: ClientService) {
  }

  @ApiOperation({ description: 'Get the current user' })
  @ApiOkResponse({ description: 'Returns the current user' })
  @ApiInternalServerErrorResponse({ description: 'Telegram error' })
  @Get('getMe')
  getHello(): any {
    return this.service.getMe()
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
  sendMessage(@Body() messageDto: MessageDto): any {
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
  sendMessages(@Body() messagesDto: MessageDto[]): any {
    return this.service.sendMessages(messagesDto)
  }
}
