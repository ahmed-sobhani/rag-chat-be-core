import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get App Info' })
  @ApiResponse({
    example: {
      app: 'RAG Chat API',
      timestamp: '2025-08-31T12:45:25.456Z'
    }
  })
  getApp(){
    return this.appService.getApp();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description:
      'Checks if the app is ready (DB reachable). Returns 200 if OK, 503 if DB is down.',
  })
  @ApiResponse({
    status: 200,
    description: 'App and database are healthy',
    schema: {
      example: {
        status: 'ok',
        checks: {
          database: { status: 'up', latencyMs: 12 },
        },
        uptime: 4521.87,
        timestamp: '2025-08-31T12:45:25.456Z',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Database is unreachable',
    schema: {
      example: {
        status: 'error',
        checks: {
          database: {
            status: 'down',
            error: 'connect ECONNREFUSED 172.19.0.2:5432',
          },
        },
        timestamp: '2025-08-31T12:45:30.789Z',
      },
    },
  })
  async health() {
    return await this.appService.readiness();
  }
}
