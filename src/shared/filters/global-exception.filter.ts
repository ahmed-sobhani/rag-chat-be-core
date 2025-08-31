import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionHandler implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionHandler.name);

  catch(e: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Something went wrong';
    let errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    if (e instanceof HttpException) {
      errorStatus = e.getStatus();
      message = typeof e.getResponse() === 'string' ? e.getResponse() : (e.getResponse() as any)['message'];
    }
    this.logger.error(e);
    const userInfo = {
      host: ctx?.getRequest()?.hostname,
      userAgent: ctx?.getRequest()?.headers?.['user-agent'],
      'x-forwarded-for': ctx?.getRequest()?.headers?.['x-forwarded-for'],
      origin: ctx?.getRequest()?.headers?.['origin'],
    };
    this.logger.log(`user agent info `, userInfo);

    return response.status(errorStatus).json({
      success: false,
      message,
    });
  }
}
