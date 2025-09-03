import { config as dotenvConfig } from 'dotenv';
import * as process from 'node:process';
import path from 'path';

dotenvConfig({ path: '.env' });

export const environment = {
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  node_env: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  api_key: process.env.API_KEY,
  cors: {
    enabled: process.env.CORS_ENABLED?.toLowerCase() === 'true',
    origin: process.env.CORS_ORIGIN,
  },
  rate_limiting: {
    ttl: process.env.RATE_LIMIT_TTL
      ? parseInt(process.env.RATE_LIMIT_TTL, 10)
      : 6000,
    limit: process.env.RATE_LIMIT_LIMIT
      ? parseInt(process.env.RATE_LIMIT_LIMIT, 10)
      : 10,
  },
  logging: {
    dir: process.env.LOG_DIR ?? path.join(process.cwd(), 'logs'),
    level:
      process.env.LOG_LEVEL ??
      (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    service_name: process.env.SERVICE_NAME ?? 'rag-chat-service',
    pretty_log: process.env.PRETTY_LOGS === 'true' || true,
  },
  loki: {
    url: process.env.LOKI_URL || 'http://localhost:3100',
    batch_interval: Number(process.env.LOKI_BATCH_INTERVAL ?? 5000),
    auth: process.env.LOKI_BASIC_AUTH,
    labels: JSON.parse(
      process.env.LOKI_LABELS ??
        '{"job":"rag-chat","env":"' + (process.env.NODE_ENV || 'dev') + '"}',
    ),
  },
};
