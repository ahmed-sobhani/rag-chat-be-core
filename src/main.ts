import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsConfig } from './shared/config/cors-config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { environment } from './shared/config/environment';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import compression from 'compression';
import { useContainer } from 'class-validator';
import { GlobalExceptionHandler } from './shared/filters/global-exception.filter';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: corsConfig(),
    bufferLogs: true, // buffers until pino logger ready
  });

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalFilters(new GlobalExceptionHandler());

  if (!environment.isProduction) {
    const config = new DocumentBuilder()
      .setTitle('RAG Chat Core Server API')
      .setDescription('API Documentations')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        docExpansion: 'none', // This setting closes all tags by default
        filter: true,
      },
    });

    app.use(
      '/docs',
      apiReference({
        theme: 'purple',
        url: '/api-json',
        title: 'RAG Chat API Documentation',
        layout: 'modern', // optional, cleaner UI
        hideClientButton: true,
        hideTestRequestButton: true,
        hideDownloadButton: true,
        withDefaultFonts: true,
      }),
    );
  }

  app.use(bodyParser.json({ limit: '150mb' }));
  app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));
  app.use(compression());
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // to use async validations in class-validator

  await app.listen(environment.port);
}

bootstrap();
