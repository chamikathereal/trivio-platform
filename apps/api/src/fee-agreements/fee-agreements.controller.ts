import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { FeeAgreementsService } from './fee-agreements.service.js';
import { CreateFeeAgreementDto } from './dto/create-fee-agreement.dto.js';
import { CurrentWorkspace, CurrentActor } from '../auth-boundary/decorators.js';

@Controller('fee-agreements')
export class FeeAgreementsController {
  constructor(private readonly feeAgreementsService: FeeAgreementsService) {}

  @Post()
  async createFeeAgreement(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Body() dto: CreateFeeAgreementDto,
  ) {
    return this.feeAgreementsService.createFeeAgreement(workspaceId, actorId, dto);
  }

  @Get()
  async listFeeAgreements(
    @CurrentWorkspace() workspaceId: string,
    @Query('merchantId') merchantId?: string,
  ) {
    return this.feeAgreementsService.listFeeAgreements(workspaceId, merchantId);
  }

  @Get(':id')
  async getFeeAgreement(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.feeAgreementsService.findFeeAgreementById(workspaceId, id);
  }

  @Delete(':id')
  async archiveFeeAgreement(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Param('id') id: string,
  ) {
    return this.feeAgreementsService.archiveFeeAgreement(workspaceId, actorId, id);
  }
}
