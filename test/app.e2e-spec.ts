import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication = null;

  beforeAll(() => {
    app = globalThis.testCtx.app;
  });

  it('/ (GET) - without token', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });
});
