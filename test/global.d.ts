declare global {
  // eslint-disable-next-line no-var
  var testCtx: {
    app: import('@nestjs/common').INestApplication;
    sessionId?: string | null;
  };
}

export {};
