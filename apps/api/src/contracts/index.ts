/**
 * @file apps/api/src/contracts/index.ts
 * @description Exported REST contracts and DTO interfaces for Stage 4C.2 console integration.
 */

export interface ApiWorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  status: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMerchantResponse {
  id: string;
  workspaceId: string;
  name: string;
  code: string;
  currency: string;
  acquirerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiFeeAgreementResponse {
  id: string;
  workspaceId: string;
  merchantId: string | null;
  name: string;
  version: string;
  status: string;
  acquirerId: string;
  percentageBps: number;
  fixedFeeMinor: string;
  minFeeMinor: string | null;
  maxFeeMinor: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  priority: number;
  rateSource: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSettlementPolicyResponse {
  id: string;
  workspaceId: string;
  merchantId: string | null;
  name: string;
  version: string;
  status: string;
  acquirerId: string;
  cycleDays: number;
  cycleUnit: string;
  cutOffTimeUtc: string;
  timeZone: string;
  calendarId: string | null;
  weekendHandling: string;
  effectiveFrom: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSettlementCalendarResponse {
  id: string;
  workspaceId: string;
  name: string;
  version: string;
  timeZone: string;
  workingDays: number[];
  holidays: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiEstimateRequest {
  grossMinor: string | number;
  currency: string;
  transactionTime: string;
  acquirerId: string;
  merchantId?: string;
  persist?: boolean;
}

export interface ApiEstimateResponse {
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
    fixedFeeMinor: string;
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

export interface ApiAuditEventResponse {
  id: string;
  workspaceId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  payloadJson: Record<string, unknown>;
  timestamp: string;
}
