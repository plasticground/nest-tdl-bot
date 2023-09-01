import { Injectable } from '@nestjs/common'
import { ConfigService } from "@nestjs/config";
import * as tdl from 'tdl'
import type {
  AuthorizationState,
  User,
  messageText,
  Message,
  sendMessage,
  formattedText$Input,
  inputMessageText$Input
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
      .then((authorizationState) => {
        this.authorizationState = authorizationState

        if (this.authorizationState._ === 'authorizationStateWaitPhoneNumber') {
          this.client.loginAsBot(configService.get<string>('telegram.botToken'))
            .then(console.log)
            .catch(console.error)
        }
      })

    this.client.on('error', console.error)
    this.client.on('update',(update) => {
      console.log(update)

      if (update._ === 'updateNewMessage') {
        let content = update.message.content as messageText

        console.log(
          update.message.chat_id,
          {
            content: content,
            entities: content.text.entities,
            entity_0: content.text.entities[0],
            entity_1: content.text.entities[1],
          })
      }
    })
  }

  async getMe(): Promise<User> {
    return await this.client.invoke({_: 'getMe'})
  }

  async sendMessage(chat_id: number, text: string): Promise<Message> {
    let message = <sendMessage>{
      _: 'sendMessage',
      chat_id: chat_id,
      input_message_content: <inputMessageText$Input>{
        _: 'inputMessageText',
        text: <formattedText$Input>{
          _: 'formattedText',
          text: text
        }
      }
  }

    return await this.client.invoke(message)
  }

  async getAuthorizationState(): Promise<AuthorizationState> {
    return await this.client.invoke({_: 'getAuthorizationState'})
  }
}
