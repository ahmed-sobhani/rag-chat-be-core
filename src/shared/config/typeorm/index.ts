import * as defaultConfig from './typeorm';
import * as e2eConfig from './typeorm.e2e';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
dotenvConfig({ path: '.env' });

const config =
  process.env.NODE_ENV === 'test' ? e2eConfig.config : defaultConfig.config;

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
