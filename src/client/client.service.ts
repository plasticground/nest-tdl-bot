import { Injectable } from '@nestjs/common'
import * as tdl from 'tdl'
import {ConfigService} from "@nestjs/config";
// import TDLib types:
// https://github.com/Bannerets/tdl#types
// import * as Td from 'tdlib-types'

const client = tdl.createClient({
  apiId: 2222, // Your api_id
  apiHash: 'YOUR_API_HASH'
})

client.on('error', console.error)
client.on('update', console.log)

async function main() {
  await client.login()

  console.log(await client.invoke({ _: 'getMe' }))

  await client.close()
}

main().catch(console.error)

@Injectable()
export class ClientService {


  constructor(private configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!'
  }
}
