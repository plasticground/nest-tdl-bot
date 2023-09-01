import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { error as Td$error } from "tdlib-types";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error'
    let error: string | object = {}

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      message = exception.message

      error = exception.getResponse()

      if (error instanceof Object && 'error' in error) {
        error = <string>error['error']
      }
    } else {
      // Check if it's a telegram error
      try {
        error = (exception as Td$error) as Object
        message = 'Telegram error'
      } catch (e) {
        //
      }
    }

    const responseBody = {
      statusCode: httpStatus,
      message: message,
      error: error,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest())
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}