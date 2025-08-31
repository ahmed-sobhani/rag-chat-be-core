import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async readiness() {
    try {
      const started = Date.now();

      // Quick DB ping; throws if DB is unavailable
      await this.dataSource.query('SELECT 1');

      const latency = Date.now() - started;
      return {
        status: 'ok',
        checks: {
          database: { status: 'up', latencyMs: latency },
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        checks: {
          database: { status: 'down', error: (error as Error).message },
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  getApp() {
    return {
      app: 'RAG Chat API',
      timestamp: new Date().toISOString(),
    }
  }
}
