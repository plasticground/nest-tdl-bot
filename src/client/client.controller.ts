import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ClientService } from './client.service'
import { LoginDto } from "./dto/login.dto"
import { ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

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

  @ApiOperation({ description: 'Sign in' })
  @ApiOkResponse({ description: 'Connecting this app to your telegram' })
  @ApiInternalServerErrorResponse({ description: 'Telegram error.' })
  @ApiBody({
    description: 'Telegram phone number and authentication (login) code from your telegram app.',
    type: LoginDto
  })
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() loginDto: LoginDto): any {
    return this.service.login(loginDto.phone_number, loginDto.code)
  }
}
