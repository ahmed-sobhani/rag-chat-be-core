import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { waitForApp } from './wait-for-app';
import { useContainer } from 'class-validator';

let app: INestApplication;

export const getApp = async (): Promise<INestApplication> => {
  console.log('getApp called', !!globalThis?.testCtx?.app);
  if (!globalThis?.testCtx?.app) {
    console.log('Starting test module compilation');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    console.log('Test module compiled successfully');

    console.log('Creating NestApplication');
    app = moduleFixture.createNestApplication();
    console.log('NestApplication created');

    app.useGlobalPipes(
      new ValidationPipe({
        // whitelist: true, // Removes properties not defined in the DTO
        forbidNonWhitelisted: true, // Throws error for properties not defined in the DTO
        transform: true, // Automatically transforms plain objects to DTO classes
      }),
    );

    // This allows you to use DI in your validators
    // and also allows you to use the `@Injectable()` decorator
    // in your validators.
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    console.log('Initializing app');
    await app.init();
    console.log('App initialized successfully');

    console.log('Waiting for app to be ready');
    await waitForApp(app);
    console.log('App is ready');

    globalThis.testCtx = {
      app,
    };
  }
  return globalThis.testCtx.app;
};

export const closeApp = async (): Promise<void> => {
  console.log('Closing app ...');
  if (globalThis.testCtx) {
    try {
      // Gracefully close all dynamic modules like Redis, DB, etc.
      await globalThis.testCtx.app?.close();
    } catch (err) {
      console.error('Error during app shutdown:', err);
    }
    // @ts-ignore
    app = undefined;
    // @ts-ignore
    globalThis.testCtx = undefined;
  }
};
