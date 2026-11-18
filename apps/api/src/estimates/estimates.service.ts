import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CalculateEstimateDto } from './dto/calculate-estimate.dto.js';
import {
  calculatePaymentSettlementEstimate,
  type IntegratedSettlementConfig,
  type MerchantFeeRule,
  type SettlementPolicy as CoreSettlementPolicy,
  type SettlementCalendar as CoreSettlementCalendar,
  type NonWorkingDayHandlingConvention,
} from '@trivio.ink/core';
import type { Prisma } from '@prisma/client';

export interface FormattedEstimateResponse {
  estimateRecordId?: string;
  status: 'ESTIMATED';
  grossMinor: string;
  totalFeeMinor: string;
  netMinor: string;
  currency: string;
  transactionTime: string;
  expectedSettlementDate: string;
  isPastCutOff: boolean;
  appliedFeeRule: {
    id: string;
    acquirerId: string;
    rateBasisPoints: number;
    rateSource: string;
  };
  appliedSettlementPolicy: {
    id: string;
    acquirerId: string;
    cycleDays: number;
    cutOffTime: string;
    timeZone: string;
    weekendHandling: string;
  };
  feeBreakdown: {
    grossMinor: string;
    percentageFeeMinor: string;
    fixedFeeMinor: string;
    totalFeeMinor: string;
    netMinor: string;
  };
}

@Injectable()
export class EstimatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async calculateEstimate(
    workspaceId: string,
    actorId: string,
    dto: CalculateEstimateDto,
  ): Promise<FormattedEstimateResponse> {
    if (dto.merchantId) {
      const merchant = await this.prisma.merchant.findFirst({
        where: { id: dto.merchantId, workspaceId },
      });
      if (!merchant) {
        throw new NotFoundException(`Merchant ${dto.merchantId} not found in this workspace.`);
      }
    }

    // Load active fee agreements for this workspace / merchant
    const dbFeeAgreements = await this.prisma.feeAgreement.findMany({
      where: {
        workspaceId,
        status: 'ACTIVE',
        acquirerId: dto.acquirerId,
        ...(dto.merchantId && {
          OR: [{ merchantId: dto.merchantId }, { merchantId: null }],
        }),
      },
      orderBy: { priority: 'desc' },
    });

    // Load active settlement policies
    const dbPolicies = await this.prisma.settlementPolicy.findMany({
      where: {
        workspaceId,
        status: 'ACTIVE',
        acquirerId: dto.acquirerId,
        ...(dto.merchantId && {
          OR: [{ merchantId: dto.merchantId }, { merchantId: null }],
        }),
      },
      orderBy: { priority: 'desc' },
    });

    // Load calendars
    const dbCalendars = await this.prisma.settlementCalendar.findMany({
      where: { workspaceId },
    });

    // Map DB entities to @trivio.ink/core config interfaces
    const feeRules: MerchantFeeRule[] = dbFeeAgreements.length > 0
      ? dbFeeAgreements.map((a) => ({
          id: a.id,
          version: a.version,
          acquirerId: a.acquirerId,
          merchantId: a.merchantId ?? undefined,
          effectiveFrom: a.effectiveFrom.toISOString(),
          effectiveTo: a.effectiveTo ? a.effectiveTo.toISOString() : undefined,
          priority: a.priority,
          feeStructure: {
            rateBasisPoints: a.percentageBps,
            fixedFeeMinor: Number(a.fixedFeeMinor),
            minFeeMinor: a.minFeeMinor ? Number(a.minFeeMinor) : undefined,
            maxFeeMinor: a.maxFeeMinor ? Number(a.maxFeeMinor) : undefined,
          },
          rateSource: 'merchant_configured',
        }))
      : [
          {
            id: 'RULE_DEFAULT',
            version: '1.0.0',
            acquirerId: dto.acquirerId,
            effectiveFrom: '2026-01-01T00:00:00Z',
            priority: 0,
            feeStructure: {
              rateBasisPoints: 220, // 2.20% default demo
              fixedFeeMinor: 30,    // $0.30 fixed fee
            },
            rateSource: 'merchant_configured',
          },
        ];

    const settlementPolicies: CoreSettlementPolicy[] = dbPolicies.length > 0
      ? dbPolicies.map((p) => ({
          id: p.id,
          version: p.version,
          acquirerId: p.acquirerId,
          merchantId: p.merchantId ?? undefined,
          effectiveFrom: p.effectiveFrom.toISOString().slice(0, 10),
          priority: p.priority,
          cycleLength: p.cycleDays,
          cycleUnit: 'business_days',
          cutOffTime: p.cutOffTimeUtc,
          timeZone: p.timeZone,
          calendarId: p.calendarId ?? 'CAL_DEFAULT',
          nonWorkingDayConvention: p.weekendHandling as NonWorkingDayHandlingConvention,
        }))
      : [
          {
            id: 'POLICY_DEFAULT',
            version: '1.0.0',
            acquirerId: dto.acquirerId,
            effectiveFrom: '2026-01-01',
            priority: 0,
            cycleLength: 2,
            cycleUnit: 'business_days',
            cutOffTime: '16:00',
            timeZone: 'America/New_York',
            calendarId: 'CAL_DEFAULT',
            nonWorkingDayConvention: 'following_business_day',
          },
        ];

    const calendars: CoreSettlementCalendar[] = dbCalendars.length > 0
      ? dbCalendars.map((c) => ({
          id: c.id,
          version: c.version,
          timeZone: c.timeZone,
          workingDays: c.workingDays,
          holidays: c.holidays,
        }))
      : [
          {
            id: 'CAL_DEFAULT',
            version: '1.0.0',
            timeZone: 'America/New_York',
            workingDays: [1, 2, 3, 4, 5],
            holidays: ['2026-01-01', '2026-12-25'],
          },
        ];

    const config: IntegratedSettlementConfig = {
      feeRules,
      settlementPolicies,
      calendars,
    };

    const estimate = calculatePaymentSettlementEstimate(
      {
        grossMinor: Number(dto.grossMinor),
        currency: dto.currency.toUpperCase(),
        transactionTime: dto.transactionTime,
        acquirerId: dto.acquirerId,
        merchantId: dto.merchantId,
      },
      config,
    );

    let estimateRecordId: string | undefined;

    if (dto.persist) {
      const record = await this.prisma.estimateRecord.create({
        data: {
          workspaceId,
          merchantId: dto.merchantId ?? null,
          grossMinor: BigInt(estimate.grossMinor),
          netMinor: BigInt(estimate.netMinor),
          totalFeeMinor: BigInt(estimate.totalFeeMinor),
          currency: estimate.currency,
          transactionTime: new Date(estimate.transactionTime),
          expectedSettlementDate: estimate.expectedSettlementDate,
          isPastCutOff: estimate.isPastCutOff,
          status: 'ESTIMATED',
          feeBreakdownJson: {
            appliedRateBasisPoints: estimate.appliedRateBasisPoints,
            fixedFeeMinor: estimate.fixedFeeMinor.toString(),
            totalFeeMinor: estimate.totalFeeMinor.toString(),
          } as Prisma.InputJsonValue,
          settlementPolicyJson: {
            policyId: estimate.appliedSettlementPolicy.policyId,
            cycleDays: estimate.appliedSettlementPolicy.cycleLength,
            cutOffTime: estimate.appliedSettlementPolicy.cutOffTime,
          } as Prisma.InputJsonValue,
        },
      });
      estimateRecordId = record.id;

      await this.audit.logEvent({
        workspaceId,
        actorId,
        action: 'ESTIMATE_PERSISTED',
        entityType: 'EstimateRecord',
        entityId: record.id,
        payload: {
          grossMinor: record.grossMinor.toString(),
          netMinor: record.netMinor.toString(),
          expectedSettlementDate: record.expectedSettlementDate,
        },
      });
    }

    return {
      estimateRecordId,
      status: 'ESTIMATED',
      grossMinor: estimate.grossMinor.toString(),
      totalFeeMinor: estimate.totalFeeMinor.toString(),
      netMinor: estimate.netMinor.toString(),
      currency: estimate.currency,
      transactionTime: estimate.transactionTime,
      expectedSettlementDate: estimate.expectedSettlementDate,
      isPastCutOff: estimate.isPastCutOff,
      appliedFeeRule: {
        id: estimate.appliedFeeRule.id,
        acquirerId: estimate.appliedFeeRule.acquirerId,
        rateBasisPoints: estimate.appliedRateBasisPoints,
        rateSource: 'merchant_configured',
      },
      appliedSettlementPolicy: {
        id: estimate.appliedSettlementPolicy.policyId,
        acquirerId: estimate.appliedSettlementPolicy.acquirerId,
        cycleDays: estimate.appliedSettlementPolicy.cycleLength,
        cutOffTime: estimate.appliedSettlementPolicy.cutOffTime,
        timeZone: estimate.appliedSettlementPolicy.timeZone,
        weekendHandling: estimate.appliedSettlementPolicy.nonWorkingDayConvention,
      },
      feeBreakdown: {
        grossMinor: estimate.feeBreakdown.grossMinor.toString(),
        percentageFeeMinor: estimate.feeBreakdown.percentageFeeMinor.toString(),
        fixedFeeMinor: estimate.feeBreakdown.fixedFeeMinor.toString(),
        totalFeeMinor: estimate.totalFeeMinor.toString(),
        netMinor: estimate.netMinor.toString(),
      },
    };
  }

  async listPersistedEstimates(workspaceId: string, merchantId?: string, limit = 50) {
    const records = await this.prisma.estimateRecord.findMany({
      where: {
        workspaceId,
        ...(merchantId && { merchantId }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map((r) => ({
      ...r,
      grossMinor: r.grossMinor.toString(),
      netMinor: r.netMinor.toString(),
      totalFeeMinor: r.totalFeeMinor.toString(),
    }));
  }
}
