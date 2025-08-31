import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env' });

export const config = {
  type: 'postgres',
  host: `${process?.env.DATABASE_HOST || '127.0.0.1'}`,
  port: `${process?.env.DATABASE_PORT || 5432}`,
  username: `${process?.env.DATABASE_USERNAME || 'postgres'}`,
  password: `${process?.env.DATABASE_PASSWORD || 'postgres'}`,
  database: `${process?.env.DATABASE_NAME || 'rag_chat_app'}`,
  entities: ['dist/**/*.entity{.ts,.js}', 'database/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}', 'database/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: process?.env.NODE_ENV !== 'production',
  ssl:
    process?.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
};
