import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CalendarsService } from './calendars.service.js';
import { CreateCalendarDto } from './dto/create-calendar.dto.js';
import { CurrentWorkspace, CurrentActor } from '../auth-boundary/decorators.js';

@Controller('calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @Post()
  async createCalendar(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Body() dto: CreateCalendarDto,
  ) {
    return this.calendarsService.createCalendar(workspaceId, actorId, dto);
  }

  @Get()
  async listCalendars(@CurrentWorkspace() workspaceId: string) {
    return this.calendarsService.listCalendars(workspaceId);
  }

  @Get(':id')
  async getCalendar(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.calendarsService.findCalendarById(workspaceId, id);
  }
}
