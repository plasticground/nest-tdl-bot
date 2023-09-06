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
  inputMessageText$Input, textParseModeMarkdown$Input, Ok
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
    this.client.on('update', (update) => {
      console.log(update)

      if (update._ === 'updateNewMessage') {
        let content = update.message.content as messageText

        console.log(
          update.message.chat_id,
          {
            content: content,
            entities: content.text.entities
          })
      }
    })
  }

  async getMe(): Promise<User> {
    return await this.client.invoke({ _: 'getMe' })
  }

  async sendMessage(chat_id: number, text: string): Promise<Message> {
    return await this.client.invoke(await this.prepareMessage(chat_id, text))
  }

  // async sendMessages(messages: sendMessage[]): Promise<Ok> {
  //   //TODO
  // }

  async prepareMessage(chat_id: number, text: string): Promise<sendMessage> {
    return {
      _: 'sendMessage',
      chat_id: chat_id,
      input_message_content: <inputMessageText$Input>{
        _: 'inputMessageText',
        text: await this.parseText(text)
      }
    } as sendMessage
  }

  async parseText(text: string): Promise<formattedText$Input> {
    return await this.client.invoke({
      _: 'parseTextEntities',
      text: text,
      parse_mode: <textParseModeMarkdown$Input>{
        _: 'textParseModeMarkdown',
        version: 2 // https://core.telegram.org/bots/api#markdownv2-style
      }
    }) as formattedText$Input
  }

  async getAuthorizationState(): Promise<AuthorizationState> {
    return await this.client.invoke({ _: 'getAuthorizationState' })
  }
}
