import { INestApplication } from '@nestjs/common';
import request from 'supertest';

// We rely on your global setup that creates and caches the app.

const API = '/chat/session';
const H = {
  'x-api-key': process.env.X_API_KEY || 'test', // set in .env.test
  'x-username': process.env.X_USERNAME || 'default',
};

describe('Sessions E2E', () => {
  let app: INestApplication;
  let http: any;
  let sessionId: string;

  beforeAll(async () => {
    app = globalThis.testCtx.app;
    http = app.getHttpServer();
  });

  it('POST /v1/chat/session -> create', async () => {
    const body = { title: 'My First Chat', isFavorite: false };
    const res = await request(http).post(API).set(H).send(body).expect(201); // successHandler often returns 201 on create

    // Accept both 200/201 depending on your success handler
    // If you see 200 locally, change expect(201) to expect(200)
    const data = res.body?.data ?? res.body?.result ?? res.body;
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.title).toBe('My First Chat');
    sessionId = data.id;
    // also keep in global testCtx if you want cross-file sharing
    if (globalThis.testCtx) globalThis.testCtx.sessionId = sessionId;
  });

  it('GET /v1/chat/session/:id -> fetch one', async () => {
    const res = await request(http)
      .get(`${API}/${sessionId}`)
      .set(H)
      .expect(200);
    const data = res.body?.data ?? res.body?.result ?? res.body;
    expect(data.id).toBe(sessionId);
    expect(typeof data.isFavorite).toBe('boolean');
  });

  it('PATCH /v1/chat/session/:id -> update title', async () => {
    const res = await request(http)
      .patch(`${API}/${sessionId}`)
      .set(H)
      .send({ title: 'Renamed Chat' })
      .expect(200);

    const data = res.body?.data ?? res.body?.result ?? res.body;
    expect(data.id).toBe(sessionId);
    expect(data.title).toBe('Renamed Chat');
  });

  it('PATCH /v1/chat/session/:id/favorite -> toggle favorite', async () => {
    const res = await request(http)
      .patch(`${API}/${sessionId}/favorite`)
      .set(H)
      .expect(200);
  });

  it('GET /v1/chat/session -> list with pagination', async () => {
    const res = await request(http)
      .get(`${API}?page=1&limit=10`)
      .set(H)
      .expect(200);

    const payload = res.body?.data ?? res.body?.result ?? res.body;
    expect(payload).toBeDefined();
    expect(Array.isArray(payload.items)).toBe(true);
    if (payload.items.length) {
      expect(payload.items[0]).toHaveProperty('id');
      expect(payload).toHaveProperty('currentPage');
      expect(payload).toHaveProperty('totalPages');
      expect(payload).toHaveProperty('limit');
      expect(payload).toHaveProperty('totalItems');
    }
  });

  it('DELETE /v1/chat/session/:id -> soft delete', async () => {
    await request(http).delete(`${API}/${sessionId}`).set(H).expect(200);
  });

  it('GET /v1/chat/session/:id -> now 404 after delete', async () => {
    await request(http).get(`${API}/${sessionId}`).set(H).expect(404);
  });

  it('should reject when headers are missing (401/403)', async () => {
    await request(http)
      .get(`${API}?page=1&limit=5`)
      .expect((res) => {
        expect([401, 403]).toContain(res.status);
      });
  });

  it('GET /:id with invalid UUID -> 400', async () => {
    await request(http).get(`${API}/not-a-uuid`).set(H).expect(400);
  });

  it('PATCH /:id with invalid UUID -> 400', async () => {
    await request(http)
      .patch(`${API}/not-a-uuid`)
      .set(H)
      .send({ title: 'x' })
      .expect(400);
  });

  it('DELETE /:id with invalid UUID -> 400', async () => {
    await request(http).delete(`${API}/not-a-uuid`).set(H).expect(400);
  });

  it('POST missing required "title" -> 400', async () => {
    await request(http)
      .post(API)
      .set(H)
      .send({}) // no title
      .expect(400);
  });

  it('POST wrong type for "title" (number) -> 400', async () => {
    await request(http).post(API).set(H).send({ title: 1234 }).expect(400);
  });

  it('GET /:id as a different user -> 403 (or 404 if you hide existence)', async () => {
    // create as user A
    const createRes = await request(http)
      .post(API)
      .set({ ...H, 'x-username': 'userA' })
      .send({ title: 'private-of-A' })
      .expect((res) => expect([200, 201]).toContain(res.status));

    const id =
      createRes.body?.data?.id ??
      createRes.body?.result?.id ??
      createRes.body?.id;

    // read as user B
    await request(http)
      .get(`${API}/${id}`)
      .set({ ...H, 'x-username': 'userB' })
      .expect((res) => {
        expect([403, 404]).toContain(res.status);
      });
  });
});
