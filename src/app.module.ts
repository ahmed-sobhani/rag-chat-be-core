import {  Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './shared/config/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { environment } from './shared/config/environment';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomThrottlerGuard } from './shared/gaurds/custom-throttler.guard';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { AuditSubscriber } from './shared/subscribers/audit.subscriber';
import { ClsModule } from 'nestjs-cls';
import { ChatModule } from './chat/chat.module';
import * as Joi from 'joi';
import { loggerConfig } from './shared/helpers/pino-logger.config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY: Joi.string().required(),
      }),
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm') as TypeOrmModuleOptions,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [
          {
            ttl: environment.rate_limiting.ttl,
            limit: environment.rate_limiting.limit,
          },
        ],
        ignoreUserAgents: [/x-if-platform-next-build/],
        errorMessage: 'Too many requests. Give it a moment and attempt again.',
      }),
    }),
    ClsModule.forRoot({
      middleware: {
        // automatically mount the
        // ClsMiddleware for all routes
        mount: true,
        setup: (cls, req) => {
          const user = req.headers['x-username'] || 'default';
          if (!user) {
            return;
          }
          cls.set('userId', user);
        },
      },
    }),
    LoggerModule.forRoot(loggerConfig),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuditSubscriber,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
