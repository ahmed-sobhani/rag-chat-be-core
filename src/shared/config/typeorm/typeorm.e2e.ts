import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const config = {
  type: 'postgres',
  host: `${process?.env.TEST_DATABASE_HOST || '127.0.0.1'}`,
  port: `${process?.env.TEST_DATABASE_PORT || 5432}`,
  username: `${process?.env.TEST_DATABASE_USERNAME || 'postgres'}`,
  password: `${process?.env.TEST_DATABASE_PASSWORD || 'postgres'}`,
  database: `${process?.env.TEST_DATABASE_NAME || 'rag_chat_app_test'}`,
  entities: ['dist/**/*.entity{.ts,.js}', '**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}', 'migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: process?.env.NODE_ENV !== 'production',
  ssl:
    process?.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
};
