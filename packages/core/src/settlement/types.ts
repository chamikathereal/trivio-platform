/**
 * @file packages/core/src/settlement/types.ts
 * @description Type definitions for Trivio dynamic settlement calendar and forecasting engine.
 */

/**
 * Unit of measurement for the settlement cycle advancement.
 * - `business_days`: Advances strictly across eligible working days, skipping weekends and configured holidays.
 * - `calendar_days`: Advances across sequential calendar days, applying the policy's non-working day convention to the target date.
 */
export type CycleUnit = 'business_days' | 'calendar_days';

/**
 * Convention for adjusting a calculated settlement date that lands on a non-working day.
 * - `following_business_day`: Roll forward to the next eligible working day (standard banking convention).
 * - `preceding_business_day`: Roll backward to the preceding eligible working day.
 * - `no_adjustment`: Retain the target calendar date even if it is a non-working day (e.g. for crypto or internal ledger transfers).
 */
export type NonWorkingDayHandlingConvention =
  | 'following_business_day'
  | 'preceding_business_day'
  | 'no_adjustment';

/**
 * Input criteria for a card transaction requiring a settlement forecast.
 */
export interface SettlementTransactionInput {
  /** Optional transaction identifier for tracing and ledger tracking */
  id?: string;
  /** Explicit ISO 8601 timestamp with UTC 'Z' or numeric offset (e.g. '2026-11-13T10:00:00+05:30') */
  transactionTime: string;
  /** Acquirer identifier governing settlement processing (e.g. 'ACQ_BOC', 'ACQ_COMMERCIAL') */
  acquirerId: string;
  /** Optional merchant identifier for merchant-specific agreements */
  merchantId?: string;
  /** Optional terminal / POS identifier for terminal-specific agreements */
  terminalId?: string;
  /** Three-letter ISO 4217 currency code (e.g. 'LKR', 'USD', 'EUR') */
  currency: string;
  /** Optional caller metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agreement policy defining settlement terms, cut-off windows, and calendar linkages.
 */
export interface SettlementPolicy {
  /** Unique identifier for the settlement agreement policy */
  id: string;
  /** Policy version string for historical tracking (e.g. '1.0.0') */
  version: string;
  /** Target acquirer identifier */
  acquirerId: string;
  /** Optional merchant scope override */
  merchantId?: string;
  /** Optional terminal scope override */
  terminalId?: string;
  /** Optional currency scope override (ISO 4217) */
  currency?: string;
  /** Inclusive effective start date (ISO date 'YYYY-MM-DD') */
  effectiveFrom: string;
  /** Optional inclusive effective end date (ISO date 'YYYY-MM-DD') */
  effectiveTo?: string;
  /** Explicit priority weight for conflict resolution (higher wins; default 0) */
  priority?: number;
  /** Settlement cycle duration (e.g. 0 for T+0, 1 for T+1, 2 for T+2) */
  cycleLength: number;
  /** Measurement unit for cycle advancement */
  cycleUnit: CycleUnit;
  /** Batch cut-off time in 24-hour format ('HH:mm' or 'HH:mm:ss', e.g. '17:00') */
  cutOffTime: string;
  /** Processing timezone as an official IANA identifier (e.g. 'Asia/Colombo', 'America/New_York') */
  timeZone: string;
  /** Reference identifier of the working and holiday calendar to apply */
  calendarId: string;
  /** Non-working-day adjustment convention (defaults to 'following_business_day') */
  nonWorkingDayConvention?: NonWorkingDayHandlingConvention;
  /** Optional human-readable description of the agreement */
  description?: string;
}

/**
 * Calendar definition containing working days and configured holiday datasets.
 */
export interface SettlementCalendar {
  /** Unique identifier for the calendar (referenced by SettlementPolicy.calendarId) */
  id: string;
  /** Calendar version string for auditability (e.g. '2026.1') */
  version: string;
  /** Official IANA timezone identifier for calendar interpretation */
  timeZone: string;
  /** ISO weekday numbers considered working days (1 = Monday, 2 = Tuesday, ..., 7 = Sunday) */
  workingDays: number[];
  /** Configured non-working holiday dates in ISO format ('YYYY-MM-DD') */
  holidays: string[];
  /** Optional descriptive labels for configured holidays (e.g. { '2026-11-16': 'Fictional Bank Holiday' }) */
  holidayLabels?: Record<string, string>;
  /** Optional descriptive text */
  description?: string;
  /** Origin or authority of the calendar configuration */
  source?: 'merchant' | 'developer' | 'acquirer' | string;
}

/**
 * Immutable historical snapshot of the exact settlement policy and calendar terms applied.
 */
export interface AppliedSettlementPolicySnapshot {
  readonly policyId: string;
  readonly policyVersion: string;
  readonly acquirerId: string;
  readonly merchantId?: string;
  readonly terminalId?: string;
  readonly currency?: string;
  readonly cycleLength: number;
  readonly cycleUnit: CycleUnit;
  readonly cutOffTime: string;
  readonly timeZone: string;
  readonly calendarId: string;
  readonly calendarVersion: string;
  readonly workingDays: readonly number[];
  readonly holidays: readonly string[];
  readonly nonWorkingDayConvention: NonWorkingDayHandlingConvention;
  readonly calculationVersion: string;
}

/**
 * Options for configuring settlement estimation execution.
 */
export interface SettlementCalculationOptions {
  /** Specific calculation engine version tag to stamp on the result */
  calculationVersion?: string;
}

/**
 * Comprehensive settlement forecast result and reconciliation breakdown.
 */
export interface SettlementEstimateResult {
  /** Original transaction identifier if supplied */
  readonly transactionId?: string;
  /** Original transaction timestamp input */
  readonly transactionTime: string;
  /** Acquirer governing settlement */
  readonly acquirerId: string;
  /** Merchant scope if applicable */
  readonly merchantId?: string;
  /** Terminal scope if applicable */
  readonly terminalId?: string;
  /** Currency code */
  readonly currency: string;
  /** IANA processing timezone applied */
  readonly timeZone: string;
  /** Local date of the transaction in the processing timezone ('YYYY-MM-DD') */
  readonly localTransactionDate: string;
  /** Local time of the transaction in the processing timezone ('HH:mm:ss') */
  readonly localTransactionTime: string;
  /** Local ISO weekday number (1 = Monday, ..., 7 = Sunday) */
  readonly localWeekday: number;
  /** Whether the transaction occurred on an eligible working day */
  readonly isLocalTransactionWorkingDay: boolean;
  /** Whether the transaction was authorized at or after the batch cut-off time */
  readonly isPastCutOff: boolean;
  /** Effective cut-off time used for evaluation ('HH:mm:ss') */
  readonly cutOffTime: string;
  /** The anchor processing date from which the T+N cycle begins ('YYYY-MM-DD') */
  readonly anchorProcessingDate: string;
  /** The projected bank settlement credit date ('YYYY-MM-DD') */
  readonly expectedSettlementDate: string;
  /** Canonical cycle designation (e.g. 'T+0', 'T+1', 'T+2', 'T+N') */
  readonly settlementCycle: string;
  /** Cycle duration in units */
  readonly cycleLength: number;
  /** Unit of the settlement cycle */
  readonly cycleUnit: CycleUnit;
  /** Adjustment convention applied */
  readonly nonWorkingDayConvention: NonWorkingDayHandlingConvention;
  /** Total calendar days deferred from local transaction date to settlement date */
  readonly daysDeferred: number;
  /** Explicit indicator that this date is an offline estimate, not a confirmed bank credit */
  readonly isEstimated: true;
  /** Settlement status indicator */
  readonly status: 'ESTIMATED';
  /** Deep-frozen snapshot of the policy and calendar applied */
  readonly appliedPolicy: AppliedSettlementPolicySnapshot;
  /** Step-by-step audit explanations of all adjustments */
  readonly adjustments: readonly string[];
  /** Calculation engine version */
  readonly calculationVersion: string;
}
