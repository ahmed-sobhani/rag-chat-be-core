import { config } from 'dotenv';
import { join } from 'path';

require('ts-node/register');
require('tsconfig-paths/register');

config({ path: join(__dirname, '../.env.test') });

jest.setTimeout(30000); // Increase timeout if needed
