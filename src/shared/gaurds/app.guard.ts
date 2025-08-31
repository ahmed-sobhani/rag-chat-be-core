import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseEntity } from '../entities/base-entity';
import { IRequest } from '../interfaces/request';
import { environment } from '../config/environment';

@Injectable()
export class AppGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request: IRequest = context.switchToHttp().getRequest<IRequest>();
    const apiKeyHeader = (request.headers['x-api-key'] as string) || '';
    if (!apiKeyHeader) {
      throw new UnauthorizedException('Unauthorized API key');
    }
    if(apiKeyHeader !== environment.api_key){
      throw new UnauthorizedException('Unauthorized API key');
    }

    const userName = (request.headers['x-username'] as string) || 'default';
    BaseEntity.setUserId(userName);
    request.user = userName;

    return true;
  }
}
