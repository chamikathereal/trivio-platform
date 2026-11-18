import { Module } from '@nestjs/common';
import { CalendarsService } from './calendars.service.js';
import { CalendarsController } from './calendars.controller.js';

@Module({
  controllers: [CalendarsController],
  providers: [CalendarsService],
  exports: [CalendarsService],
})
export class CalendarsModule {}
