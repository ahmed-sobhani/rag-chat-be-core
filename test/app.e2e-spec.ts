import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('AppController (e2e)', () => {
  // @ts-ignore
  let app: INestApplication = null;

  beforeAll(() => {
    app = globalThis.testCtx.app;
  });

  it('/ (GET) - without token', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });
});
