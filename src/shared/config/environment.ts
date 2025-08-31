import { config as dotenvConfig } from 'dotenv';
import * as process from 'node:process';

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
      : 60,
    limit: process.env.RATE_LIMIT_LIMIT
      ? parseInt(process.env.RATE_LIMIT_LIMIT, 10)
      : 10,
  },
};
