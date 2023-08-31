import { Injectable } from '@nestjs/common'
import { ConfigService } from "@nestjs/config";
import * as tdl from 'tdl'
import type {
  AuthorizationState,
  User
} from "tdlib-types";


@Injectable()
export class ClientService {
  private client: tdl.Client;
  private authorizationState: AuthorizationState;

  constructor(private configService: ConfigService) {
    tdl.configure({
      // Path to the library. By default, it is 'tdjson.dll' on Windows,
      // 'libtdjson.dylib' on macOS, or 'libtdjson.so' otherwise.
      tdjson: configService.get<string>('telegram.tdjson', 'tdjson.dll'),
      // Path to the library directory. By default, it is empty string.
      libdir: configService.get<string>('telegram.libdir', ''),
      // Verbosity level of TDLib. By default, it is 2.
      verbosityLevel: configService.get<number>('telegram.verbosityLevel', 2)
    })

    this.client = tdl.createClient({
      apiId: configService.get<number>('telegram.apiId'),
      apiHash: configService.get<string>('telegram.apiHash'),
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

  async login(phone_number: string, code: string | null): Promise<any> {
    this.authorizationState = await this.getAuthorizationState()

    switch (this.authorizationState._) {
      case 'authorizationStateWaitPhoneNumber':
        return await this.client.invoke({ _: 'setAuthenticationPhoneNumber', phone_number: phone_number })
      case 'authorizationStateWaitCode':
        if (code) {
          return await this.client.invoke({ _: 'checkAuthenticationCode', code: code })
        } else {
          return null
        }
    }

    return await this.client.invoke({ _: 'getMe' })
  }

  async getMe(): Promise<User> {
    return await this.client.invoke({ _: 'getMe' })
  }

  async getAuthorizationState(): Promise<AuthorizationState> {
    return await this.client.invoke({ _: 'getAuthorizationState' })
  }
}
