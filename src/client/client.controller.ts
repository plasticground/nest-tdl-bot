import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ClientService } from './client.service'
import { ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MessageDto } from "./dto/message.dto";

@ApiTags('Docs')
@Controller()
export class ClientController {
  constructor(private readonly service: ClientService) {
  }

  @ApiOperation({ description: 'Get the current user' })
  @ApiOkResponse({ description: 'Returns the current user.' })
  @ApiInternalServerErrorResponse({ description: 'Telegram error.' })
  @Get('getMe')
  getHello(): any {
    return this.service.getMe()
  }

  @ApiOperation({ description: 'Send message' })
  @ApiOkResponse({ description: 'Send text message to telegram chat' })
  @ApiInternalServerErrorResponse({ description: 'Telegram error.' })
  @ApiBody({
    description: 'Telegram chat ID and message text.',
    type: MessageDto
  })
  @Post('sendMessage')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() messageDto: MessageDto): any {
    return this.service.sendMessage(messageDto.chat_id, messageDto.text)
  }
}
