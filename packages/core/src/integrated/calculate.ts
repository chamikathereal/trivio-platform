/**
 * @file packages/core/src/integrated/calculate.ts
 * @description Master integrated calculation engine combining dynamic MDR fees and settlement calendar projections.
 */

import { calculateFeeEstimate } from '../engine/calculate.js';
import { estimateSettlementDate } from '../settlement/calculation.js';
import { parseIsoTimestamp } from '../settlement/timezone.js';
import type {
  SettlementCalendar,
  SettlementPolicy,
  SettlementTransactionInput,
} from '../settlement/types.js';
import { TrivioValidationError } from '../types/errors.js';
import type { MerchantFeeRule } from '../types/rule.js';
import type { TransactionInput } from '../types/transaction.js';
import type {
  IntegratedSettlementConfig,
  IntegratedSettlementEstimateResult,
  IntegratedSettlementOptions,
  IntegratedTransactionInput,
} from './types.js';

export const DEFAULT_INTEGRATED_CALCULATION_VERSION = '2.3.0-core';

/**
 * Recursively freezes an object at runtime to guarantee genuine immutability.
 */
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj);
  for (const key of Object.keys(obj) as Array<keyof T>) {
    const val = obj[key];
    if (val && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val as object);
    }
  }
  return obj;
}

/**
 * Normalizes the transaction timestamp into an explicit ISO 8601 string.
 */
function normalizeTransactionTimestamp(timeInput: string | Date): string {
  if (timeInput instanceof Date) {
    if (Number.isNaN(timeInput.getTime())) {
      throw new TrivioValidationError('Invalid Date object provided for transactionTime.');
    }
    return timeInput.toISOString();
  }

  if (typeof timeInput === 'string') {
    // Validates format and presence of explicit timezone offset ('Z' or +/-HH:mm)
    parseIsoTimestamp(timeInput);
    return timeInput.trim();
  }

  throw new TrivioValidationError(
    `transactionTime must be an ISO 8601 string or Date instance. Received: ${JSON.stringify(timeInput)}`
  );
}

/**
 * Calculates a consolidated payment settlement estimate combining merchant processing fee deductions
 * and projected bank credit deposit dates in a single deterministic, type-safe API call.
 *
 * @param transaction - Unified transaction criteria.
 * @param config - Grouped agreement rules, settlement policies, and holiday calendars.
 * @param options - Optional calculation overrides (e.g. negative net settlement permission).
 * @returns Fully reconciled financial breakdown and deposit date forecast.
 */
export function calculatePaymentSettlementEstimate(
  transaction: IntegratedTransactionInput,
  config: IntegratedSettlementConfig,
  options?: IntegratedSettlementOptions
): IntegratedSettlementEstimateResult;

/**
 * Calculates a consolidated payment settlement estimate (positional argument overload).
 *
 * @param transaction - Unified transaction criteria.
 * @param feeRules - Array of merchant fee agreement rules.
 * @param settlementPolicies - Array of acquirer settlement policies.
 * @param calendars - Array of working day and holiday calendars.
 * @param options - Optional calculation overrides.
 * @returns Fully reconciled financial breakdown and deposit date forecast.
 */
export function calculatePaymentSettlementEstimate(
  transaction: IntegratedTransactionInput,
  feeRules: MerchantFeeRule[],
  settlementPolicies: SettlementPolicy[],
  calendars: SettlementCalendar[],
  options?: IntegratedSettlementOptions
): IntegratedSettlementEstimateResult;

export function calculatePaymentSettlementEstimate(
  transaction: IntegratedTransactionInput,
  configOrFeeRules: IntegratedSettlementConfig | MerchantFeeRule[],
  settlementPoliciesOrOptions?: SettlementPolicy[] | IntegratedSettlementOptions,
  calendars?: SettlementCalendar[],
  options?: IntegratedSettlementOptions
): IntegratedSettlementEstimateResult {
  if (!transaction || typeof transaction !== 'object') {
    throw new TrivioValidationError(
      `Transaction must be a non-null object. Received: ${JSON.stringify(transaction)}`
    );
  }

  // 1. Resolve arguments based on calling signature
  let feeRules: MerchantFeeRule[];
  let settlementPolicies: SettlementPolicy[];
  let calendarList: SettlementCalendar[];
  let opts: IntegratedSettlementOptions | undefined;

  if (Array.isArray(configOrFeeRules)) {
    feeRules = configOrFeeRules;
    settlementPolicies = (settlementPoliciesOrOptions as SettlementPolicy[]) ?? [];
    calendarList = calendars ?? [];
    opts = options;
  } else if (configOrFeeRules && typeof configOrFeeRules === 'object') {
    feeRules = configOrFeeRules.feeRules ?? [];
    settlementPolicies = configOrFeeRules.settlementPolicies ?? [];
    calendarList = configOrFeeRules.calendars ?? [];
    opts = settlementPoliciesOrOptions as IntegratedSettlementOptions | undefined;
  } else {
    throw new TrivioValidationError(
      'Invalid configuration provided. Expected an IntegratedSettlementConfig object or array of MerchantFeeRule.'
    );
  }

  // 2. Validate and normalize the single authoritative transaction timestamp
  const canonicalTimestamp = normalizeTransactionTimestamp(transaction.transactionTime);

  // 3. Delegate financial fee calculation to Stage 2A Dynamic Fee Engine
  const feeTx: TransactionInput = {
    grossMinor: transaction.grossMinor,
    currency: transaction.currency,
    transactionDate: canonicalTimestamp,
    acquirerId: transaction.acquirerId,
    merchantId: transaction.merchantId,
    terminalId: transaction.terminalId,
    cardScheme: transaction.cardScheme,
    cardFundingType: transaction.cardFundingType,
    cardRegion: transaction.cardRegion,
  };

  const feeEstimate = calculateFeeEstimate(feeTx, feeRules, {
    allowNegativeNetSettlement: opts?.allowNegativeNetSettlement,
    calculationPolicy: opts?.feeCalculationPolicy,
  });

  // 4. Delegate settlement calendar projection to Stage 2B Settlement Calendar Engine
  const settlementTx: SettlementTransactionInput = {
    id: transaction.id,
    transactionTime: canonicalTimestamp,
    acquirerId: transaction.acquirerId,
    merchantId: transaction.merchantId,
    terminalId: transaction.terminalId,
    currency: transaction.currency,
    metadata: transaction.metadata,
  };

  const settlementEstimate = estimateSettlementDate(
    settlementTx,
    settlementPolicies,
    calendarList,
    { calculationVersion: opts?.calculationVersion }
  );

  // 5. Synthesize composite integrated result
  const calculationVersion =
    opts?.calculationVersion ?? DEFAULT_INTEGRATED_CALCULATION_VERSION;

  const result: IntegratedSettlementEstimateResult = {
    transactionId: transaction.id,
    transactionTime: canonicalTimestamp,
    acquirerId: transaction.acquirerId,
    merchantId: transaction.merchantId,
    terminalId: transaction.terminalId,
    currency: feeEstimate.currency,

    // Fee breakdown
    grossMinor: feeEstimate.grossMinor,
    percentageFeeMinor: feeEstimate.percentageFeeMinor,
    fixedFeeMinor: feeEstimate.fixedFeeMinor,
    minFeeAdjustmentMinor: feeEstimate.minFeeAdjustmentMinor,
    maxFeeAdjustmentMinor: feeEstimate.maxFeeAdjustmentMinor,
    taxMinor: feeEstimate.taxMinor,
    totalFeeMinor: feeEstimate.totalFeeMinor,
    netMinor: feeEstimate.netMinor,
    appliedRateBasisPoints: feeEstimate.appliedRateBasisPoints,
    appliedFeeRule: feeEstimate.appliedRule.snapshot,
    feeBreakdown: feeEstimate.breakdown,
    feeCalculationPolicy: feeEstimate.calculationPolicy,

    // Settlement projection
    timeZone: settlementEstimate.timeZone,
    localTransactionDate: settlementEstimate.localTransactionDate,
    localTransactionTime: settlementEstimate.localTransactionTime,
    localWeekday: settlementEstimate.localWeekday,
    isLocalTransactionWorkingDay: settlementEstimate.isLocalTransactionWorkingDay,
    isPastCutOff: settlementEstimate.isPastCutOff,
    cutOffTime: settlementEstimate.cutOffTime,
    anchorProcessingDate: settlementEstimate.anchorProcessingDate,
    expectedSettlementDate: settlementEstimate.expectedSettlementDate,
    settlementCycle: settlementEstimate.settlementCycle,
    cycleLength: settlementEstimate.cycleLength,
    cycleUnit: settlementEstimate.cycleUnit,
    nonWorkingDayConvention: settlementEstimate.nonWorkingDayConvention,
    daysDeferred: settlementEstimate.daysDeferred,
    appliedSettlementPolicy: settlementEstimate.appliedPolicy,
    settlementAdjustments: settlementEstimate.adjustments,
    settlementCalculationVersion: settlementEstimate.calculationVersion,

    // Operational metadata
    isEstimated: true,
    status: 'ESTIMATED',
    calculatedAt: feeEstimate.calculatedAt,
    calculationVersion,
  };

  return deepFreeze(result);
}
