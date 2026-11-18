import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CreateCalendarDto } from './dto/create-calendar.dto.js';

@Injectable()
export class CalendarsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createCalendar(workspaceId: string, actorId: string, dto: CreateCalendarDto) {
    const calendar = await this.prisma.settlementCalendar.create({
      data: {
        workspaceId,
        name: dto.name,
        version: dto.version ?? '1.0.0',
        timeZone: dto.timeZone,
        workingDays: dto.workingDays,
        holidays: dto.holidays,
      },
    });

    await this.audit.logEvent({
      workspaceId,
      actorId,
      action: 'CALENDAR_CREATED',
      entityType: 'SettlementCalendar',
      entityId: calendar.id,
      payload: {
        name: calendar.name,
        timeZone: calendar.timeZone,
        workingDays: calendar.workingDays,
        holidayCount: calendar.holidays.length,
      },
    });

    return calendar;
  }

  async listCalendars(workspaceId: string) {
    return this.prisma.settlementCalendar.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCalendarById(workspaceId: string, id: string) {
    const calendar = await this.prisma.settlementCalendar.findFirst({
      where: { id, workspaceId },
    });

    if (!calendar) {
      throw new NotFoundException(`Settlement calendar ${id} not found in this workspace.`);
    }

    return calendar;
  }
}
