const request = require('supertest');

export const waitForApp = async (app) => {
  let isAppUp = false;
  while (!isAppUp) {
    try {
      const server = app.getHttpServer();
      if (!server) {
        throw new Error('HTTP server not available');
      }
      const res = await request(app.getHttpServer()).get('/').expect(200);
      isAppUp = true;
    } catch (error) {
      console.error(error);
      console.log('App is not ready yet, retrying...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
