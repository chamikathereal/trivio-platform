import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CreateFeeAgreementDto } from './dto/create-fee-agreement.dto.js';

@Injectable()
export class FeeAgreementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private serialize(agreement: Record<string, unknown>) {
    return {
      ...agreement,
      fixedFeeMinor: agreement['fixedFeeMinor']?.toString(),
      minFeeMinor: agreement['minFeeMinor'] ? agreement['minFeeMinor']?.toString() : null,
      maxFeeMinor: agreement['maxFeeMinor'] ? agreement['maxFeeMinor']?.toString() : null,
    };
  }

  async createFeeAgreement(workspaceId: string, actorId: string, dto: CreateFeeAgreementDto) {
    if (dto.merchantId) {
      const merchant = await this.prisma.merchant.findFirst({
        where: { id: dto.merchantId, workspaceId },
      });
      if (!merchant) {
        throw new ForbiddenException(
          `Cannot associate fee agreement with merchant ${dto.merchantId}: merchant does not belong to this workspace.`,
        );
      }
    }

    const fixedFee = BigInt(dto.fixedFeeMinor);
    const minFee = dto.minFeeMinor !== undefined && dto.minFeeMinor !== null ? BigInt(dto.minFeeMinor) : null;
    const maxFee = dto.maxFeeMinor !== undefined && dto.maxFeeMinor !== null ? BigInt(dto.maxFeeMinor) : null;

    const agreement = await this.prisma.feeAgreement.create({
      data: {
        workspaceId,
        merchantId: dto.merchantId ?? null,
        name: dto.name,
        version: dto.version ?? '1.0.0',
        status: 'ACTIVE',
        acquirerId: dto.acquirerId,
        percentageBps: dto.percentageBps,
        fixedFeeMinor: fixedFee,
        minFeeMinor: minFee,
        maxFeeMinor: maxFee,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
        priority: dto.priority ?? 0,
        rateSource: 'merchant_configured',
      },
    });

    await this.audit.logEvent({
      workspaceId,
      actorId,
      action: 'FEE_AGREEMENT_CREATED',
      entityType: 'FeeAgreement',
      entityId: agreement.id,
      payload: {
        name: agreement.name,
        percentageBps: agreement.percentageBps,
        fixedFeeMinor: agreement.fixedFeeMinor.toString(),
      },
    });

    return this.serialize(agreement as unknown as Record<string, unknown>);
  }

  async listFeeAgreements(workspaceId: string, merchantId?: string) {
    const agreements = await this.prisma.feeAgreement.findMany({
      where: {
        workspaceId,
        ...(merchantId && { merchantId }),
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return agreements.map((a) => this.serialize(a as unknown as Record<string, unknown>));
  }

  async findFeeAgreementById(workspaceId: string, id: string) {
    const agreement = await this.prisma.feeAgreement.findFirst({
      where: { id, workspaceId },
    });

    if (!agreement) {
      throw new NotFoundException(`Fee agreement ${id} not found in this workspace.`);
    }

    return this.serialize(agreement as unknown as Record<string, unknown>);
  }

  async archiveFeeAgreement(workspaceId: string, actorId: string, id: string) {
    await this.findFeeAgreementById(workspaceId, id);

    const updated = await this.prisma.feeAgreement.update({
      where: { id },
      data: { status: 'DEPRECATED' },
    });

    await this.audit.logEvent({
      workspaceId,
      actorId,
      action: 'FEE_AGREEMENT_ARCHIVED',
      entityType: 'FeeAgreement',
      entityId: updated.id,
      payload: { status: 'DEPRECATED' },
    });

    return this.serialize(updated as unknown as Record<string, unknown>);
  }
}
