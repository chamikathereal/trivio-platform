import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { SettlementPoliciesService } from './settlement-policies.service.js';
import { CreateSettlementPolicyDto } from './dto/create-settlement-policy.dto.js';
import { CurrentWorkspace, CurrentActor } from '../auth-boundary/decorators.js';

@Controller('settlement-policies')
export class SettlementPoliciesController {
  constructor(private readonly settlementPoliciesService: SettlementPoliciesService) {}

  @Post()
  async createSettlementPolicy(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Body() dto: CreateSettlementPolicyDto,
  ) {
    return this.settlementPoliciesService.createSettlementPolicy(workspaceId, actorId, dto);
  }

  @Get()
  async listSettlementPolicies(
    @CurrentWorkspace() workspaceId: string,
    @Query('merchantId') merchantId?: string,
  ) {
    return this.settlementPoliciesService.listSettlementPolicies(workspaceId, merchantId);
  }

  @Get(':id')
  async getSettlementPolicy(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.settlementPoliciesService.findSettlementPolicyById(workspaceId, id);
  }

  @Delete(':id')
  async archiveSettlementPolicy(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Param('id') id: string,
  ) {
    return this.settlementPoliciesService.archiveSettlementPolicy(workspaceId, actorId, id);
  }
}
