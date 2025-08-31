import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerKey = 'x-request-id';
    const id = req.header(headerKey) || uuid();
    req.headers[headerKey] = id;
    res.setHeader(headerKey, id);
    next();
  }
}
