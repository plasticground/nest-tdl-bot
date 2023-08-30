## Description

Telegram client based on TypeScript, [Nest](https://github.com/nestjs/nest) framework and [tdl](https://github.com/Bannerets/tdl) wrapper for [TDLib](https://github.com/tdlib/td).

## Installation

1. Build [TDLib](https://github.com/tdlib/td#building).
   - For windows, copy all files from *...\tdlib\td\build\Release* to the [root](/) of the project
   - If you have any problems, see additional instructions [there](https://github.com/Bannerets/tdl#possible-errors) 
2. Run `yarn install`
3. Make an **.env** file from [.env.example](.env.example)

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```