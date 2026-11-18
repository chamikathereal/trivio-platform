import { Module } from '@nestjs/common';
import { SettlementPoliciesService } from './settlement-policies.service.js';
import { SettlementPoliciesController } from './settlement-policies.controller.js';

@Module({
  controllers: [SettlementPoliciesController],
  providers: [SettlementPoliciesService],
  exports: [SettlementPoliciesService],
})
export class SettlementPoliciesModule {}
