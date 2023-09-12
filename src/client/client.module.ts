import { Module } from '@nestjs/common'
import { ClientController } from './client.controller'
import { ClientService } from './client.service'
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "./entities/chat.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Chat])
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {
}
