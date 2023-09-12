import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from "@nestjs/config"
import database from "./config/database";
import telegram from "./config/telegram";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientController } from "./client/client.controller";
import { ClientService } from "./client/client.service";
import { Chat } from "./client/entities/chat.entity";
import { ClientModule } from "./client/client.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [database, telegram]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, ClientModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [Chat],
        synchronize: true,
      }),
    })
  ]
})
export class AppModule {
}
