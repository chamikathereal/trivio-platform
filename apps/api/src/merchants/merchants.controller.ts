import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { MerchantsService } from './merchants.service.js';
import { CreateMerchantDto } from './dto/create-merchant.dto.js';
import { UpdateMerchantDto } from './dto/update-merchant.dto.js';
import { CurrentWorkspace, CurrentActor } from '../auth-boundary/decorators.js';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  async createMerchant(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Body() dto: CreateMerchantDto,
  ) {
    return this.merchantsService.createMerchant(workspaceId, actorId, dto);
  }

  @Get()
  async listMerchants(@CurrentWorkspace() workspaceId: string) {
    return this.merchantsService.listMerchants(workspaceId);
  }

  @Get(':id')
  async getMerchant(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.merchantsService.findMerchantById(workspaceId, id);
  }

  @Put(':id')
  async updateMerchant(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMerchantDto,
  ) {
    return this.merchantsService.updateMerchant(workspaceId, actorId, id, dto);
  }

  @Delete(':id')
  async archiveMerchant(
    @CurrentWorkspace() workspaceId: string,
    @CurrentActor() actorId: string,
    @Param('id') id: string,
  ) {
    return this.merchantsService.archiveMerchant(workspaceId, actorId, id);
  }
}
