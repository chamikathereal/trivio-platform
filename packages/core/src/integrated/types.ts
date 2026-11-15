/**
 * @file packages/core/src/integrated/types.ts
 * @description Types for Stage 2C integrated merchant fee and settlement date estimation.
 */

import type {
  AppliedSettlementPolicySnapshot,
  CycleUnit,
  NonWorkingDayHandlingConvention,
  SettlementCalendar,
  SettlementPolicy,
} from '../settlement/types.js';
import type {
  AppliedRuleSnapshot,
  FeeBreakdownDetails,
} from '../types/result.js';
import type { MerchantFeeRule } from '../types/rule.js';
import type {
  CardFundingType,
  CardRegion,
  CardScheme,
} from '../types/transaction.js';

/**
 * Unified payment transaction input criteria for combined fee deduction
 * and settlement calendar deposit date estimation.
 */
export interface IntegratedTransactionInput {
  /** Optional transaction identifier for tracing and ledger reconciliation */
  id?: string;
  /** Gross authorized payment amount in integer minor currency units (e.g. 1000000 for LKR 10,000.00) */
  grossMinor: number;
  /** Three-letter ISO 4217 currency code (e.g. 'LKR', 'USD', 'EUR') */
  currency: string;
  /**
   * Explicit transaction timestamp containing UTC 'Z' or a numeric timezone offset (+/-HH:mm).
   * Accepts ISO 8601 string (e.g. '2026-11-13T10:00:00+05:30') or a JavaScript Date instance.
   */
  transactionTime: string | Date;
  /** Acquirer identifier governing both fee schedules and settlement calendars (e.g. 'ACQ_BOC') */
  acquirerId: string;
  /** Optional merchant identifier for merchant-specific agreement scopes */
  merchantId?: string;
  /** Optional POS / terminal identifier for terminal-specific agreement scopes */
  terminalId?: string;
  /** Optional payment card scheme (e.g. 'visa', 'mastercard', 'amex') */
  cardScheme?: CardScheme;
  /** Optional card funding mechanism (e.g. 'credit', 'debit', 'prepaid') */
  cardFundingType?: CardFundingType;
  /** Optional card geographic issuance region (e.g. 'domestic', 'international') */
  cardRegion?: CardRegion;
  /** Optional caller metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Grouped agreement configurations required for integrated payment estimation.
 */
export interface IntegratedSettlementConfig {
  /** Array of merchant fee agreement rules */
  feeRules: MerchantFeeRule[];
  /** Array of acquirer settlement agreement policies */
  settlementPolicies: SettlementPolicy[];
  /** Array of settlement working day and holiday calendars */
  calendars: SettlementCalendar[];
}

/**
 * Options for configuring integrated calculation execution.
 */
export interface IntegratedSettlementOptions {
  /** Permit calculated fees to exceed gross transaction amount without throwing NegativeNetSettlementError */
  allowNegativeNetSettlement?: boolean;
  /** Calculation engine version string */
  calculationVersion?: string;
  /** Specific rounding and financial policy identifier (defaults to 'trivio-mdr-v1-half-up') */
  feeCalculationPolicy?: string;
}

/**
 * Complete consolidated result containing exact merchant fee deductions, net proceeds,
 * and projected bank credit settlement date.
 */
export interface IntegratedSettlementEstimateResult {
  /** Original transaction identifier if supplied */
  readonly transactionId?: string;
  /** Canonical ISO 8601 transaction timestamp with explicit timezone offset */
  readonly transactionTime: string;
  /** Acquirer identifier governing settlement */
  readonly acquirerId: string;
  /** Merchant scope if applicable */
  readonly merchantId?: string;
  /** Terminal scope if applicable */
  readonly terminalId?: string;
  /** ISO 4217 currency code */
  readonly currency: string;

  // --- Financial Fee Breakdown ---
  /** Gross transaction amount in integer minor units */
  readonly grossMinor: number;
  /** Unadjusted percentage fee component in minor units (Round-Half-Up) */
  readonly percentageFeeMinor: number;
  /** Fixed transaction fee in minor units */
  readonly fixedFeeMinor: number;
  /** Upward adjustment if fee fell below contractual floor, or null */
  readonly minFeeAdjustmentMinor: number | null;
  /** Downward adjustment if fee exceeded contractual cap, or null */
  readonly maxFeeAdjustmentMinor: number | null;
  /** Total statutory tax or levy applied to merchant fee in minor units */
  readonly taxMinor: number;
  /** Total merchant fee deductions in minor units (percentage + fixed + tax ± min/max adjustments) */
  readonly totalFeeMinor: number;
  /** Estimated net merchant settlement proceeds in minor units (grossMinor - totalFeeMinor) */
  readonly netMinor: number;
  /** Applied MDR rate in basis points (1 bps = 0.01%) */
  readonly appliedRateBasisPoints: number;
  /** Immutable historical snapshot of the fee agreement rule applied */
  readonly appliedFeeRule: AppliedRuleSnapshot;
  /** Itemized ledger breakdown of the financial calculation */
  readonly feeBreakdown: FeeBreakdownDetails;
  /** Deterministic rounding policy used (e.g. 'trivio-mdr-v1-half-up') */
  readonly feeCalculationPolicy: string;

  // --- Settlement Date Projection ---
  /** IANA processing timezone applied (e.g. 'Asia/Colombo') */
  readonly timeZone: string;
  /** Local calendar date of the transaction in processing timezone ('YYYY-MM-DD') */
  readonly localTransactionDate: string;
  /** Local time of the transaction in processing timezone ('HH:mm:ss') */
  readonly localTransactionTime: string;
  /** Local ISO weekday number (1 = Monday ... 7 = Sunday) */
  readonly localWeekday: number;
  /** Whether transaction occurred on an active working day */
  readonly isLocalTransactionWorkingDay: boolean;
  /** Whether transaction authorized at or after daily batch cut-off */
  readonly isPastCutOff: boolean;
  /** Daily batch cut-off time used for evaluation ('HH:mm:ss') */
  readonly cutOffTime: string;
  /** Anchor business processing date ('YYYY-MM-DD') */
  readonly anchorProcessingDate: string;
  /** Expected bank credit deposit date ('YYYY-MM-DD') */
  readonly expectedSettlementDate: string;
  /** Canonical settlement cycle designation (e.g. 'T+0', 'T+1', 'T+2') */
  readonly settlementCycle: string;
  /** Settlement cycle duration in units */
  readonly cycleLength: number;
  /** Unit of the settlement cycle ('business_days' | 'calendar_days') */
  readonly cycleUnit: CycleUnit;
  /** Non-working day rollover convention applied */
  readonly nonWorkingDayConvention: NonWorkingDayHandlingConvention;
  /** Elapsed calendar days deferred from local transaction date to settlement date */
  readonly daysDeferred: number;
  /** Immutable historical snapshot of the settlement policy and calendar applied */
  readonly appliedSettlementPolicy: AppliedSettlementPolicySnapshot;
  /** Step-by-step audit explanations of settlement adjustments */
  readonly settlementAdjustments: readonly string[];
  /** Settlement calculation engine version */
  readonly settlementCalculationVersion: string;

  // --- Operational & Status Metadata ---
  /** Explicit indicator that this is an offline estimate, not a confirmed bank receipt */
  readonly isEstimated: true;
  /** Operational estimate status */
  readonly status: 'ESTIMATED';
  /** ISO timestamp when calculation was evaluated */
  readonly calculatedAt: string;
  /** Integrated calculation version */
  readonly calculationVersion: string;
}
