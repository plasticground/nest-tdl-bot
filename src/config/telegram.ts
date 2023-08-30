import {registerAs} from "@nestjs/config";

export default registerAs('telegram', () => ({
  tdjson: process.env.TELEGRAM_TDJSON,
  libdir: process.env.TELEGRAM_LIBDIR,
  verbosityLevel: parseInt(process.env.TELEGRAM_VERBOSITY_LEVEL, 10) || 2,
  apiId: process.env.TELEGRAM_API_ID,
  apiHash: process.env.TELEGRAM_API_HASH
}));