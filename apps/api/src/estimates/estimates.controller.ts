import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { EstimatesService } from './estimates.service.js';
import { CalculateEstimateDto } from './dto/calculate-estimate.dto.js';
import { CurrentWorkspace, CurrentActor } from '../auth-boundary/decorators.js';

@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post('calculate')
  async calculateEstimate(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Body() dto: CalculateEstimateDto,
  ) {
    return this.estimatesService.calculateEstimate(workspaceId, actorId, dto);
  }

  @Get('persisted')
  async listPersistedEstimates(
    @CurrentWorkspace() workspaceId: string,
    @Query('merchantId') merchantId?: string,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? parseInt(limit, 10) : 50;
    return this.estimatesService.listPersistedEstimates(workspaceId, merchantId, take);
  }
}
