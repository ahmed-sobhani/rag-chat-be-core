import { environment } from '../config/environment';

export const loggerConfig = {
  pinoHttp: {
    // redact sensitive fields (headers & bodies)
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
      ],
      remove: true,
    },
    // auto add/request-id header
    genReqId: (req, res) => {
      const existing = req.headers['x-request-id'] as string | undefined;
      const id = existing || cryptoRandom();
      res.setHeader('x-request-id', id);
      return id;
    },
    // base fields & level
    base: { service: 'rag-chat-service' },
    level:
      process.env.LOG_LEVEL || (environment.isProduction ? 'info' : 'debug'),
    // pretty print ONLY in dev
    transport: environment.isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: { singleLine: true, colorize: true, translateTime: true },
        },
    // custom serializers keep logs lean
    serializers: {
      // Hide huge bodies; log method/url/ip/ua/status/latency automatically
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
    // custom success/error messages (optional)
    customSuccessMessage: (req, res) =>
      `request_completed ${req.method} ${req.url}`,
    customErrorMessage: (req, res, err) =>
      `request_failed ${req.method} ${req.url} ${err?.message ?? ''}`,
    customReceivedMessage: (req) => `request_start ${req.method} ${req.url}`,
    // add extra fields to every log line
    customProps: (req, res) => ({
      requestId: req.id,
    }),
  },
};

function cryptoRandom() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
