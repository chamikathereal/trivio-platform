import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CreateSettlementPolicyDto } from './dto/create-settlement-policy.dto.js';

@Injectable()
export class SettlementPoliciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createSettlementPolicy(workspaceId: string, actorId: string, dto: CreateSettlementPolicyDto) {
    if (dto.merchantId) {
      const merchant = await this.prisma.merchant.findFirst({
        where: { id: dto.merchantId, workspaceId },
      });
      if (!merchant) {
        throw new ForbiddenException(
          `Cannot associate settlement policy with merchant ${dto.merchantId}: merchant does not belong to this workspace.`,
        );
      }
    }

    if (dto.calendarId) {
      const calendar = await this.prisma.settlementCalendar.findFirst({
        where: { id: dto.calendarId, workspaceId },
      });
      if (!calendar) {
        throw new ForbiddenException(
          `Cannot associate settlement policy with calendar ${dto.calendarId}: calendar does not belong to this workspace.`,
        );
      }
    }

    const policy = await this.prisma.settlementPolicy.create({
      data: {
        workspaceId,
        merchantId: dto.merchantId ?? null,
        name: dto.name,
        version: dto.version ?? '1.0.0',
        status: 'ACTIVE',
        acquirerId: dto.acquirerId,
        cycleDays: dto.cycleDays,
        cycleUnit: dto.cycleUnit ?? 'business_days',
        cutOffTimeUtc: dto.cutOffTimeUtc,
        timeZone: dto.timeZone,
        calendarId: dto.calendarId ?? null,
        weekendHandling: dto.weekendHandling,
        priority: dto.priority ?? 0,
      },
    });

    await this.audit.logEvent({
      workspaceId,
      actorId,
      action: 'SETTLEMENT_POLICY_CREATED',
      entityType: 'SettlementPolicy',
      entityId: policy.id,
      payload: {
        name: policy.name,
        cycleDays: policy.cycleDays,
        cutOffTimeUtc: policy.cutOffTimeUtc,
        weekendHandling: policy.weekendHandling,
      },
    });

    return policy;
  }

  async listSettlementPolicies(workspaceId: string, merchantId?: string) {
    return this.prisma.settlementPolicy.findMany({
      where: {
        workspaceId,
        ...(merchantId && { merchantId }),
      },
      include: {
        calendar: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findSettlementPolicyById(workspaceId: string, id: string) {
    const policy = await this.prisma.settlementPolicy.findFirst({
      where: { id, workspaceId },
      include: { calendar: true },
    });

    if (!policy) {
      throw new NotFoundException(`Settlement policy ${id} not found in this workspace.`);
    }

    return policy;
  }

  async archiveSettlementPolicy(workspaceId: string, actorId: string, id: string) {
    await this.findSettlementPolicyById(workspaceId, id);

    const updated = await this.prisma.settlementPolicy.update({
      where: { id },
      data: { status: 'DEPRECATED' },
    });

    await this.audit.logEvent({
      workspaceId,
      actorId,
      action: 'SETTLEMENT_POLICY_ARCHIVED',
      entityType: 'SettlementPolicy',
      entityId: updated.id,
      payload: { status: 'DEPRECATED' },
    });

    return updated;
  }
}
