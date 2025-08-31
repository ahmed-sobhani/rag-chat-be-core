import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createHash } from 'crypto';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceId = req.headers['x-device-id'] || 'unknown';
    const platform = req.headers['if-platform'] || 'unknown';
    const key = createHash('sha256')
      .update(`${ip}_${userAgent}_${deviceId}_${platform}`)
      .digest('hex');
    // @ts-ignore
    return key;
  }

  override getRequestResponse(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    return {
      req: ctx.getRequest(),
      res: ctx.getResponse(),
    };
  }
}
