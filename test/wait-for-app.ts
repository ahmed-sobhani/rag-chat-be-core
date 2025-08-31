import * as request from 'supertest';

export const waitForApp = async (app) => {
  let isAppUp = false;
  while (!isAppUp) {
    try {
      // @ts-ignore
      await request(app.getHttpServer()).get('/').expect(200);
      isAppUp = true;
    } catch (error) {
      console.log('App is not ready yet, retrying...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
