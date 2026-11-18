import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CreateMerchantDto } from './dto/create-merchant.dto.js';
import { UpdateMerchantDto } from './dto/update-merchant.dto.js';

@Injectable()
export class MerchantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createMerchant(workspaceId: string, actorId: string, dto: CreateMerchantDto) {
    const existing = await this.prisma.merchant.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Merchant code '${dto.code}' already exists in this workspace.`);
    }

    const merchant = await this.prisma.merchant.create({
      data: {
        workspaceId,
        name: dto.name,
        code: dto.code,
        currency: dto.currency.toUpperCase(),
        acquirerId: dto.acquirerId,
        status: 'ACTIVE',
      },
    });

    await this.audit.logEvent({
      workspaceId,
      actorId,
      action: 'MERCHANT_CREATED',
      entityType: 'Merchant',
      entityId: merchant.id,
      payload: { name: merchant.name, code: merchant.code, currency: merchant.currency },
    });

    return merchant;
  }

  async listMerchants(workspaceId: string) {
    return this.prisma.merchant.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        feeAgreements: { where: { status: 'ACTIVE' } },
        settlementPolicies: { where: { status: 'ACTIVE' } },
      },
    });
  }

  async findMerchantById(workspaceId: string, id: string) {
    const merchant = await this.prisma.merchant.findFirst({
      where: { id, workspaceId },
      include: {
        feeAgreements: true,
        settlementPolicies: true,
      },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found in this workspace.`);
    }

    return merchant;
  }

  async updateMerchant(workspaceId: string, actorId: string, id: string, dto: UpdateMerchantDto) {
    await this.findMerchantById(workspaceId, id);

    const updated = await this.prisma.merchant.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.currency && { currency: dto.currency.toUpperCase() }),
        ...(dto.acquirerId && { acquirerId: dto.acquirerId }),
        ...(dto.status && { status: dto.status }),
      },
    });

    await this.audit.logEvent({
      workspaceId,
      actorId,
      action: 'MERCHANT_UPDATED',
      entityType: 'Merchant',
      entityId: updated.id,
      payload: dto as Record<string, unknown>,
    });

    return updated;
  }

  async archiveMerchant(workspaceId: string, actorId: string, id: string) {
    return this.updateMerchant(workspaceId, actorId, id, { status: 'ARCHIVED' });
  }
}
