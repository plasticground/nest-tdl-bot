import { Injectable } from '@nestjs/common'
import { ConfigService } from "@nestjs/config";
import * as tdl from 'tdl'
import * as Td from 'tdlib-types'

@Injectable()
export class ClientService {
  private client: tdl.Client;
  private authorizationState: Td.AuthorizationState;

  constructor(private configService: ConfigService) {
    tdl.configure({
      // Path to the library. By default, it is 'tdjson.dll' on Windows,
      // 'libtdjson.dylib' on macOS, or 'libtdjson.so' otherwise.
      tdjson: configService.get<string>('TELEGRAM_TDJSON', 'tdjson.dll'),
      // Path to the library directory. By default, it is empty string.
      libdir: configService.get<string>('TELEGRAM_LIBDIR', ''),
      // Verbosity level of TDLib. By default, it is 2.
      verbosityLevel: 3
    })

    this.client = tdl.createClient({
      apiId: configService.get<number>('TELEGRAM_API_ID'),
      apiHash: configService.get<string>('TELEGRAM_API_HASH'),
      tdlibParameters: {
        use_message_database: true,
        use_secret_chats: true,
        system_language_code: 'en',
        application_version: '1.0',
        device_model: 'API',
        system_version: '1.0',
        enable_storage_optimizer: true
      }
    })

    this.getAuthorizationState()
        .then(authorizationState => this.authorizationState = authorizationState)

    this.client.on('error', console.error)
    this.client.on('update', console.log)
  }

  async login(phone_number: string, code: number|null): any {
    this.authorizationState = await this.getAuthorizationState()

    switch (this.authorizationState) {
      case Td.authorizationStateWaitPhoneNumber:
        return await this.client.invoke({_: 'sendPhoneNumberVerificationCode', phone_number: phone_number})
      case Td.authorizationStateWaitCode:
        if (code) {
          return await this.client.invoke({_: 'checkAuthenticationCode', code: code})//TODO
        }
    }

    return await this.client.invoke({_: 'getMe'})
  }

  async getMe(): Promise<Td.User> {
    return await this.client.invoke({_: 'getMe'})
  }

  async getAuthorizationState(): Promise<Td.AuthorizationState> {
    return await this.client.invoke({_: 'getAuthorizationState'})
  }
}
