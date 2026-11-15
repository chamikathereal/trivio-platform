/**
 * @file packages/core/src/settlement/calculation.ts
 * @description Master settlement date estimation engine.
 * Computes deterministic, timezone-safe bank credit date projections with comprehensive audit explanations.
 */

import {
  addBusinessDays,
  addCalendarDays,
  adjustNonWorkingDay,
  daysBetween,
  findEligibleWorkingDay,
  getNextWorkingDay,
  isWorkingDay,
} from './calendar.js';
import { SettlementCalendarNotFoundError } from './errors.js';
import { findMatchingSettlementPolicy } from './policy-matcher.js';
import { getZonedDateTimeParts } from './timezone.js';
import type {
  AppliedSettlementPolicySnapshot,
  SettlementCalculationOptions,
  SettlementCalendar,
  SettlementEstimateResult,
  SettlementPolicy,
  SettlementTransactionInput,
} from './types.js';
import {
  validateAndNormalizeSettlementCalendars,
  validateAndNormalizeSettlementPolicies,
  validateAndNormalizeSettlementTransaction,
} from './validation.js';

export const DEFAULT_SETTLEMENT_CALCULATION_VERSION = '2.2.0-core';

/**
 * Deep freezes an object and its nested properties to guarantee runtime immutability.
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
 * Estimates the bank deposit settlement date for a card transaction based on
 * caller-configured settlement policies and working/holiday calendars.
 *
 * ### Guarantees
 * - **Deterministic & Offline:** Pure calculation with zero network, cloud, or database calls.
 * - **Timezone Safe:** Decomposes transactions strictly within the policy's configured IANA timezone.
 * - **Exact Calendar Math:** Operates on ISO calendar dates to avoid 24-hr millisecond drift across DST or leap-year boundaries.
 * - **Genuine Immutability:** Freezes the returned result and applied policy snapshot at runtime.
 * - **Auditable:** Produces an explicit list of human-readable adjustment steps.
 *
 * @param transaction - Transaction criteria (timestamp, acquirer, currency, optional merchant/terminal).
 * @param policies - Array of settlement policies to match against.
 * @param calendars - Array of settlement calendars defining working days and holidays.
 * @param options - Optional calculation options (e.g. calculation version override).
 * @returns Complete deterministic settlement forecast result.
 * @throws {SettlementValidationError} If any input structure is malformed.
 * @throws {SettlementRangeError} If dates or numerical bounds are invalid.
 * @throws {SettlementPolicyNotFoundError} If no policy matches the transaction context.
 * @throws {SettlementPolicyConflictError} If multiple distinct policies tie at highest priority and specificity.
 * @throws {SettlementCalendarNotFoundError} If the matched policy references an unknown calendar ID.
 */
export function estimateSettlementDate(
  transaction: SettlementTransactionInput,
  policies: SettlementPolicy[],
  calendars: SettlementCalendar[],
  options?: SettlementCalculationOptions
): SettlementEstimateResult {
  // 1. Validate and normalize inputs
  const normTx = validateAndNormalizeSettlementTransaction(transaction);
  const normPolicies = validateAndNormalizeSettlementPolicies(policies);
  const calendarMap = validateAndNormalizeSettlementCalendars(calendars);

  // 2. Deterministically select the highest-priority, most-specific settlement policy
  const { policy: matchedPolicy } = findMatchingSettlementPolicy(normPolicies, normTx);

  // 3. Retrieve the referenced calendar
  const calendar = calendarMap.get(matchedPolicy.calendarId);
  if (!calendar) {
    throw new SettlementCalendarNotFoundError(
      matchedPolicy.calendarId,
      matchedPolicy.id
    );
  }

  // 4. Decompose transaction timestamp into the policy's processing timezone
  const zdt = getZonedDateTimeParts(normTx.instant, matchedPolicy.timeZone);
  const { localDate, localTime, localWeekday } = zdt;

  const isLocalWorkingDay = isWorkingDay(localDate, calendar);
  const isPastCutOff = localTime >= matchedPolicy.cutOffTime;

  const adjustments: string[] = [];
  adjustments.push(
    `Transaction authorized at ${localDate} ${localTime} in timezone "${matchedPolicy.timeZone}" (ISO weekday ${localWeekday}).`
  );

  // 5. Determine the anchor processing date
  let anchorProcessingDate: string;

  if (!isLocalWorkingDay) {
    // Transaction occurred on a non-working day (weekend or bank holiday)
    anchorProcessingDate = findEligibleWorkingDay(localDate, calendar);
    adjustments.push(
      `Transaction occurred on a non-working calendar date (${localDate}). Anchor processing date shifted forward to earliest business day: ${anchorProcessingDate}.`
    );
  } else if (isPastCutOff) {
    // Transaction occurred on a working day, but at or past the daily batch cut-off time
    anchorProcessingDate = getNextWorkingDay(localDate, calendar);
    adjustments.push(
      `Transaction time (${localTime}) is at or past daily batch cut-off (${matchedPolicy.cutOffTime}). Anchor processing date rolled to next business day: ${anchorProcessingDate}.`
    );
  } else {
    // Transaction occurred on a working day before the cut-off
    anchorProcessingDate = localDate;
    adjustments.push(
      `Transaction time (${localTime}) is before daily batch cut-off (${matchedPolicy.cutOffTime}). Eligible for same-day processing anchor: ${anchorProcessingDate}.`
    );
  }

  // 6. Calculate expected settlement date from the anchor processing date
  let expectedSettlementDate: string;

  if (matchedPolicy.cycleUnit === 'business_days') {
    expectedSettlementDate = addBusinessDays(
      anchorProcessingDate,
      matchedPolicy.cycleLength,
      calendar
    );
    adjustments.push(
      `Applied T+${matchedPolicy.cycleLength} business day(s) from anchor ${anchorProcessingDate} -> target settlement date ${expectedSettlementDate}.`
    );
  } else {
    // calendar_days
    const rawTargetDate = addCalendarDays(
      anchorProcessingDate,
      matchedPolicy.cycleLength
    );
    expectedSettlementDate = adjustNonWorkingDay(
      rawTargetDate,
      calendar,
      matchedPolicy.nonWorkingDayConvention
    );

    if (rawTargetDate === expectedSettlementDate) {
      adjustments.push(
        `Applied T+${matchedPolicy.cycleLength} calendar day(s) from anchor ${anchorProcessingDate} -> settlement date ${expectedSettlementDate}.`
      );
    } else {
      adjustments.push(
        `Applied T+${matchedPolicy.cycleLength} calendar day(s) from anchor ${anchorProcessingDate} -> raw date ${rawTargetDate}. ` +
        `Candidate date is non-working; adjusted to ${expectedSettlementDate} via '${matchedPolicy.nonWorkingDayConvention}' convention.`
      );
    }
  }

  // 7. Calculate elapsed calendar days
  const daysDeferred = daysBetween(localDate, expectedSettlementDate);

  // 8. Construct immutable applied policy snapshot
  const calcVersion =
    options?.calculationVersion ?? DEFAULT_SETTLEMENT_CALCULATION_VERSION;

  const appliedPolicy: AppliedSettlementPolicySnapshot = {
    policyId: matchedPolicy.id,
    policyVersion: matchedPolicy.version,
    acquirerId: matchedPolicy.acquirerId,
    merchantId: matchedPolicy.merchantId,
    terminalId: matchedPolicy.terminalId,
    currency: matchedPolicy.currency,
    cycleLength: matchedPolicy.cycleLength,
    cycleUnit: matchedPolicy.cycleUnit,
    cutOffTime: matchedPolicy.cutOffTime,
    timeZone: matchedPolicy.timeZone,
    calendarId: calendar.id,
    calendarVersion: calendar.version,
    workingDays: Object.freeze([...calendar.workingDays]),
    holidays: Object.freeze([...calendar.holidays]),
    nonWorkingDayConvention: matchedPolicy.nonWorkingDayConvention,
    calculationVersion: calcVersion,
  };

  const settlementCycle = `T+${matchedPolicy.cycleLength}`;

  const result: SettlementEstimateResult = {
    transactionId: normTx.id,
    transactionTime: normTx.transactionTime,
    acquirerId: matchedPolicy.acquirerId,
    merchantId: matchedPolicy.merchantId,
    terminalId: matchedPolicy.terminalId,
    currency: normTx.currency,
    timeZone: matchedPolicy.timeZone,
    localTransactionDate: localDate,
    localTransactionTime: localTime,
    localWeekday,
    isLocalTransactionWorkingDay: isLocalWorkingDay,
    isPastCutOff,
    cutOffTime: matchedPolicy.cutOffTime,
    anchorProcessingDate,
    expectedSettlementDate,
    settlementCycle,
    cycleLength: matchedPolicy.cycleLength,
    cycleUnit: matchedPolicy.cycleUnit,
    nonWorkingDayConvention: matchedPolicy.nonWorkingDayConvention,
    daysDeferred,
    isEstimated: true,
    status: 'ESTIMATED',
    appliedPolicy: Object.freeze(appliedPolicy),
    adjustments: Object.freeze(adjustments),
    calculationVersion: calcVersion,
  };

  return deepFreeze(result);
}
