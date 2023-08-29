import {Body, Controller, Get, Post, UsePipes, ValidationPipe} from '@nestjs/common'
import { ClientService } from './client.service'
import {LoginDto} from "./dto/login.dto"

@Controller()
export class ClientController {
  constructor(private readonly service: ClientService) {}

  @Get('getMe')
  getHello(): any {
    return this.service.getMe()
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() loginDto: LoginDto): any {
    return this.service.login(loginDto.phone_number, loginDto.code)
  }
}
