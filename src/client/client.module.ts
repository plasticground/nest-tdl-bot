import { Module } from '@nestjs/common'
import { ClientController } from './client.controller'
import { ClientService } from './client.service'
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule]
    })
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {
}
