import { Module } from '@nestjs/common';
import { FeeAgreementsService } from './fee-agreements.service.js';
import { FeeAgreementsController } from './fee-agreements.controller.js';

@Module({
  controllers: [FeeAgreementsController],
  providers: [FeeAgreementsService],
  exports: [FeeAgreementsService],
})
export class FeeAgreementsModule {}
