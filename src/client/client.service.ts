import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config";
import * as tdl from "tdl"
import type {
  AuthorizationState,
  User,
  Message,
  sendMessage,
  formattedText$Input,
  inputMessageText$Input,
  textParseModeMarkdown$Input,
  Ok,
  getMe,
  getChat,
  Chat,
  Update,
  File,
  downloadFile
} from "tdlib-types";
import { MessageDto } from "./dto/message.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Chat as ChatEntity } from "./entities/chat.entity";
import { Repository } from "typeorm";

@Injectable()
export class ClientService {
  private client: tdl.Client;
  private authorizationState: AuthorizationState;

  constructor(
    private configService: ConfigService,
    @InjectRepository(ChatEntity)
    private chatsRepository: Repository<ChatEntity>
  ) {
    tdl.configure({
      // Path to the library. By default, it is "tdjson.dll" on Windows,
      // "libtdjson.dylib" on macOS, or "libtdjson.so" otherwise.
      tdjson: configService.get<string>("telegram.tdjson", "tdjson.dll"),
      // Path to the library directory. By default, it is empty string.
      libdir: configService.get<string>("telegram.libdir", ""),
      // Verbosity level of TDLib. By default, it is 2.
      verbosityLevel: configService.get<number>("telegram.verbosityLevel", 2)
    })

    this.client = tdl.createClient({
      apiId: configService.get<number>("telegram.apiId"),
      apiHash: configService.get<string>("telegram.apiHash"),
      tdlibParameters: {
        use_file_database: true,
        use_chat_info_database: true,
        use_message_database: true,
        use_secret_chats: true,
        system_language_code: "en",
        application_version: "1.0",
        device_model: "API",
        system_version: "1.0",
        enable_storage_optimizer: true
      }
    })

    this.getAuthorizationState()
      .then((authorizationState) => {
        this.authorizationState = authorizationState

        if (this.authorizationState._ === "authorizationStateWaitPhoneNumber") {
          this.client.loginAsBot(configService.get<string>("telegram.botToken"))
            .then(console.log)
            .catch(console.error)
        }
      })

    this.client.on("error", console.error)
    this.client.on("update", (update: Update) => {
      // console.log(update)

      this.manageBotChat(update).catch(console.error)
    })
  }

  async getMe(): Promise<User> {
    return await this.client.invoke(<getMe>{ _: "getMe" })
  }

  async getChat(chat_id: number): Promise<Chat> {
    return await this.client.invoke(<getChat>{ _: "getChat", chat_id: chat_id })
  }

  async getFile(file_id: number): Promise<File> {
    return await this.client.invoke(<downloadFile>{ _: "downloadFile", file_id: file_id, priority: 1, synchronous: true })
  }

  async manageBotChat(update: Update) {
    let photo = null
    let chat = null
    let storedChat = null
    let newChatData = new ChatEntity()
    let message = null

    switch (update._) {
      case "updateChatPhoto":
        chat = await this.getChat(update.chat_id)
        break
      case "updateNewChat":
        chat = await this.getChat(update.chat.id)
        break
      case "updateChatMember":
        chat = await this.getChat(update.chat_id)

        if (update.new_chat_member.status._ === "chatMemberStatusMember") {
          newChatData.isActive = true
          newChatData.added_at = update.date

          message = `Bot added to chat: ${chat.id}`
        }

        if (update.new_chat_member.status._ === "chatMemberStatusLeft") {
          newChatData.isActive = false
          newChatData.left_at = update.date

          message = `Bot left from chat: ${chat.id}`
        }
        break
      default:
        break
    }
    
    if (chat) {
      if (chat.photo) {
        photo = await this.getFile(chat.photo.small.id)

        newChatData.photo_id = photo.id
        newChatData.photo_path = photo.local.path
      }

      storedChat = await this.chatsRepository.findOneBy({ chat_id: chat.id })

      newChatData.id = storedChat?.id
      newChatData.chat_id = chat.id
      newChatData.title = chat.title

      this.chatsRepository.save(newChatData)
        .then(() => {
          if (message) {
            console.log(message)
          }
        })
        .catch(console.error)
    }
  }

  async getChats(): Promise<ChatEntity[]> {
    return await this.chatsRepository.find()
  }

  async sendMessage(message: MessageDto): Promise<Message> {
    return await this.client.invoke(await this.prepareMessage(message.chat_id, message.text))
  }

  async sendMessages(messages: MessageDto[]): Promise<Ok> {
    messages.forEach((message: MessageDto) => {
      this.sendMessage(message).catch(console.error)
    })

    return <Ok>{ _: "ok" }
  }

  async prepareMessage(chat_id: number, text: string): Promise<sendMessage> {
    return {
      _: "sendMessage",
      chat_id: chat_id,
      input_message_content: <inputMessageText$Input>{
        _: "inputMessageText",
        text: await this.parseText(text)
      }
    } as sendMessage
  }

  async parseText(text: string): Promise<formattedText$Input> {
    return await this.client.invoke({
      _: "parseTextEntities",
      text: text,
      parse_mode: <textParseModeMarkdown$Input>{
        _: "textParseModeMarkdown",
        version: 2 // https://core.telegram.org/bots/api#markdownv2-style
      }
    }) as formattedText$Input
  }

  async getAuthorizationState(): Promise<AuthorizationState> {
    return await this.client.invoke({ _: "getAuthorizationState" })
  }
}
