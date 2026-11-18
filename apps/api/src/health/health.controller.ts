import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth-boundary/decorators.js';
import { PrismaService } from '../database/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async getHealth() {
    let databaseStatus = 'DISCONNECTED';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'CONNECTED';
    } catch {
      databaseStatus = 'UNREACHABLE';
    }

    return {
      status: 'ok',
      service: '@trivio-apps/api',
      version: '0.1.0',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
