import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { environment } from '../config/environment';

@Catch()
export class GlobalExceptionHandler implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionHandler.name);

  catch(err: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const errorId = randomUUID();

    // Default values
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let clientMessage = 'Something went wrong';
    let errorName = 'Error';
    let details: any = undefined;

    // Extract message/status from HttpException if available
    if (err instanceof HttpException) {
      status = err.getStatus();
      const response = err.getResponse();

      // Normalize possible shapes: string | { message?: string | string[]; error?: string; ... }
      if (typeof response === 'string') {
        clientMessage = response;
      } else if (response && typeof response === 'object') {
        const msg = (response as any).message;
        if (Array.isArray(msg)) {
          clientMessage = msg.join(', ');
          details = { messages: msg };
        } else if (typeof msg === 'string') {
          clientMessage = msg;
        } else if (typeof (response as any).error === 'string') {
          clientMessage = (response as any).error;
        }
      }
      errorName = err.name || 'HttpException';
    } else if (err && typeof err === 'object') {
      // Non-Http errors
      const e = err as any;
      errorName = e?.name || 'Error';
      // Prefer a meaningful message if present
      if (typeof e?.message === 'string' && e.message.trim()) {
        clientMessage = e.message;
      }
      // Optionally attach known DB/library codes without exposing internals to the client
      if (e?.code) details = { code: e.code };
    }

    // Don’t leak internals on 5xx in production
    if (environment.isProduction && status >= 500) {
      clientMessage = 'Internal server error';
      details = undefined; // hide specifics
    }

    // Collect request metadata (avoid body/PII by default)
    const meta = {
      errorId,
      requestId: (req as any).id ?? (req as any).requestId ?? undefined,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      ua: req.headers['user-agent'],
      origin: req.headers['origin'],
      host: req.hostname,
      status,
      errorName,
    };

    // Log with stack outside prod; in prod log message + meta
    if (err instanceof Error) {
      if (environment.isProduction) {
        this.logger.error(err.message, undefined, JSON.stringify(meta));
      } else {
        this.logger.error(
          err.stack || err.message,
          undefined,
          JSON.stringify(meta),
        );
      }
    } else {
      this.logger.error(
        'Unknown error thrown',
        undefined,
        JSON.stringify(meta),
      );
    }

    // Build consistent response body
    const body = {
      success: false,
      statusCode: status,
      message: clientMessage,
      errorId, // for support to trace logs
      path: meta.url,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {}),
      // You might include requestId too, if you surface it to clients:
      ...(meta.requestId ? { requestId: meta.requestId } : {}),
    };

    return res.status(status).json(body);
  }
}
