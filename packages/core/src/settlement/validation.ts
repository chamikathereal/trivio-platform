/**
 * @file packages/core/src/settlement/validation.ts
 * @description Strict schema and domain validation for transactions, calendars, and settlement policies.
 */

import { parseISODate } from './calendar.js';
import {
  SettlementPolicyConflictError,
  SettlementRangeError,
  SettlementValidationError,
} from './errors.js';
import { parseIsoTimestamp, validateIanaTimeZone } from './timezone.js';
import type {
  CycleUnit,
  NonWorkingDayHandlingConvention,
  SettlementCalendar,
  SettlementPolicy,
  SettlementTransactionInput,
} from './types.js';

const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;
const CUT_OFF_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

export interface NormalizedSettlementTransaction {
  id?: string;
  transactionTime: string;
  instant: Date;
  acquirerId: string;
  merchantId?: string;
  terminalId?: string;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface NormalizedSettlementCalendar {
  id: string;
  version: string;
  timeZone: string;
  workingDays: number[];
  holidays: string[];
  holidayLabels?: Record<string, string>;
  description?: string;
  source?: string;
}

export interface NormalizedSettlementPolicy {
  id: string;
  version: string;
  acquirerId: string;
  merchantId?: string;
  terminalId?: string;
  currency?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priority: number;
  cycleLength: number;
  cycleUnit: CycleUnit;
  cutOffTime: string; // Normalized 'HH:mm:ss'
  timeZone: string;
  calendarId: string;
  nonWorkingDayConvention: NonWorkingDayHandlingConvention;
  description?: string;
}

/**
 * Validates and normalizes a settlement transaction input.
 */
export function validateAndNormalizeSettlementTransaction(
  tx: SettlementTransactionInput
): NormalizedSettlementTransaction {
  if (!tx || typeof tx !== 'object') {
    throw new SettlementValidationError(
      `Transaction must be a non-null object. Received: ${JSON.stringify(tx)}`
    );
  }

  const instant = parseIsoTimestamp(tx.transactionTime);

  if (typeof tx.acquirerId !== 'string' || !tx.acquirerId.trim()) {
    throw new SettlementValidationError(
      `Transaction acquirerId must be a non-empty string. Received: ${JSON.stringify(tx.acquirerId)}`
    );
  }

  if (typeof tx.currency !== 'string') {
    throw new SettlementValidationError(
      `Transaction currency must be a 3-letter ISO 4217 code. Received: ${JSON.stringify(tx.currency)}`
    );
  }

  const normalizedCurrency = tx.currency.trim().toUpperCase();
  if (!CURRENCY_CODE_REGEX.test(normalizedCurrency)) {
    throw new SettlementValidationError(
      `Invalid currency code "${tx.currency}". Must be a 3-letter uppercase ISO 4217 code (e.g. 'LKR', 'USD').`
    );
  }

  const merchantId =
    typeof tx.merchantId === 'string' && tx.merchantId.trim()
      ? tx.merchantId.trim()
      : undefined;

  const terminalId =
    typeof tx.terminalId === 'string' && tx.terminalId.trim()
      ? tx.terminalId.trim()
      : undefined;

  const id =
    typeof tx.id === 'string' && tx.id.trim() ? tx.id.trim() : undefined;

  return {
    id,
    transactionTime: tx.transactionTime.trim(),
    instant,
    acquirerId: tx.acquirerId.trim(),
    merchantId,
    terminalId,
    currency: normalizedCurrency,
    metadata: tx.metadata ? { ...tx.metadata } : undefined,
  };
}

/**
 * Validates and normalizes a settlement calendar definition.
 */
export function validateAndNormalizeSettlementCalendar(
  cal: SettlementCalendar
): NormalizedSettlementCalendar {
  if (!cal || typeof cal !== 'object') {
    throw new SettlementValidationError(
      `Calendar must be a non-null object. Received: ${JSON.stringify(cal)}`
    );
  }

  if (typeof cal.id !== 'string' || !cal.id.trim()) {
    throw new SettlementValidationError(
      `Calendar id must be a non-empty string. Received: ${JSON.stringify(cal.id)}`
    );
  }

  if (typeof cal.version !== 'string' || !cal.version.trim()) {
    throw new SettlementValidationError(
      `Calendar version must be a non-empty string. Received: ${JSON.stringify(cal.version)}`
    );
  }

  validateIanaTimeZone(cal.timeZone);

  if (!Array.isArray(cal.workingDays)) {
    throw new SettlementValidationError(
      `Calendar workingDays must be an array of ISO weekdays (1=Mon ... 7=Sun). Received: ${JSON.stringify(cal.workingDays)}`
    );
  }

  const uniqueWorkingDays = [...new Set(cal.workingDays)];
  for (const day of uniqueWorkingDays) {
    if (typeof day !== 'number' || !Number.isInteger(day) || day < 1 || day > 7) {
      throw new SettlementValidationError(
        `Calendar workingDays must contain integers between 1 (Monday) and 7 (Sunday). Received: ${day}`
      );
    }
  }

  if (uniqueWorkingDays.length === 0) {
    throw new SettlementValidationError(
      `Calendar "${cal.id}" defines zero working days. Settlement calculation requires at least one working day.`
    );
  }
  uniqueWorkingDays.sort((a, b) => a - b);

  if (!Array.isArray(cal.holidays)) {
    throw new SettlementValidationError(
      `Calendar holidays must be an array of ISO date strings ('YYYY-MM-DD'). Received: ${JSON.stringify(cal.holidays)}`
    );
  }

  const validatedHolidays: string[] = [];
  for (const h of cal.holidays) {
    if (typeof h !== 'string') {
      throw new SettlementValidationError(
        `Calendar holiday entries must be strings. Received: ${JSON.stringify(h)}`
      );
    }
    parseISODate(h); // Throws if invalid or impossible date
    validatedHolidays.push(h.trim());
  }

  const uniqueHolidays = [...new Set(validatedHolidays)].sort();

  return {
    id: cal.id.trim(),
    version: cal.version.trim(),
    timeZone: cal.timeZone.trim(),
    workingDays: uniqueWorkingDays,
    holidays: uniqueHolidays,
    holidayLabels: cal.holidayLabels ? { ...cal.holidayLabels } : undefined,
    description: cal.description?.trim(),
    source: cal.source?.trim(),
  };
}

/**
 * Normalizes an array of settlement calendars into a lookup map by calendar ID.
 */
export function validateAndNormalizeSettlementCalendars(
  calendars: SettlementCalendar[]
): Map<string, NormalizedSettlementCalendar> {
  if (!Array.isArray(calendars) || calendars.length === 0) {
    throw new SettlementValidationError(
      'At least one valid SettlementCalendar must be provided to evaluate settlement forecasts.'
    );
  }

  const map = new Map<string, NormalizedSettlementCalendar>();

  for (const cal of calendars) {
    const normalized = validateAndNormalizeSettlementCalendar(cal);
    const existing = map.get(normalized.id);

    if (existing) {
      // Check for conflicting calendar definitions with identical IDs
      if (
        existing.version !== normalized.version ||
        existing.timeZone !== normalized.timeZone ||
        existing.workingDays.join(',') !== normalized.workingDays.join(',') ||
        existing.holidays.join(',') !== normalized.holidays.join(',')
      ) {
        throw new SettlementValidationError(
          `Conflicting calendar definitions provided for calendar ID "${normalized.id}".`
        );
      }
    } else {
      map.set(normalized.id, normalized);
    }
  }

  return map;
}

/**
 * Normalizes a cut-off time string to 'HH:mm:ss'.
 */
export function normalizeCutOffTime(cutOff: string): string {
  if (typeof cutOff !== 'string' || !cutOff.trim()) {
    throw new SettlementValidationError(
      `cutOffTime must be a string formatted as 'HH:mm' or 'HH:mm:ss'. Received: ${JSON.stringify(cutOff)}`
    );
  }

  const match = CUT_OFF_REGEX.exec(cutOff.trim());
  if (!match) {
    throw new SettlementValidationError(
      `Invalid cutOffTime: "${cutOff}". Expected 24-hour format like "17:00" or "17:00:00".`
    );
  }

  const hours = match[1];
  const minutes = match[2];
  const seconds = match[3] ?? '00';

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Validates and normalizes a single settlement policy agreement.
 */
export function validateAndNormalizeSettlementPolicy(
  policy: SettlementPolicy
): NormalizedSettlementPolicy {
  if (!policy || typeof policy !== 'object') {
    throw new SettlementValidationError(
      `Policy must be a non-null object. Received: ${JSON.stringify(policy)}`
    );
  }

  if (typeof policy.id !== 'string' || !policy.id.trim()) {
    throw new SettlementValidationError(
      `Policy id must be a non-empty string. Received: ${JSON.stringify(policy.id)}`
    );
  }

  if (typeof policy.version !== 'string' || !policy.version.trim()) {
    throw new SettlementValidationError(
      `Policy version must be a non-empty string. Received: ${JSON.stringify(policy.version)}`
    );
  }

  if (typeof policy.acquirerId !== 'string' || !policy.acquirerId.trim()) {
    throw new SettlementValidationError(
      `Policy acquirerId must be a non-empty string. Received: ${JSON.stringify(policy.acquirerId)}`
    );
  }

  parseISODate(policy.effectiveFrom);
  if (policy.effectiveTo) {
    parseISODate(policy.effectiveTo);
    if (policy.effectiveTo < policy.effectiveFrom) {
      throw new SettlementValidationError(
        `Policy effectiveTo ("${policy.effectiveTo}") cannot precede effectiveFrom ("${policy.effectiveFrom}").`
      );
    }
  }

  if (
    typeof policy.cycleLength !== 'number' ||
    !Number.isInteger(policy.cycleLength) ||
    policy.cycleLength < 0
  ) {
    throw new SettlementRangeError(
      `Policy cycleLength must be a non-negative integer (e.g. 0 for T+0, 1 for T+1). Received: ${JSON.stringify(policy.cycleLength)}`
    );
  }

  if (
    policy.cycleUnit !== 'business_days' &&
    policy.cycleUnit !== 'calendar_days'
  ) {
    throw new SettlementValidationError(
      `Policy cycleUnit must be either 'business_days' or 'calendar_days'. Received: ${JSON.stringify(policy.cycleUnit)}`
    );
  }

  const cutOffTime = normalizeCutOffTime(policy.cutOffTime);
  validateIanaTimeZone(policy.timeZone);

  if (typeof policy.calendarId !== 'string' || !policy.calendarId.trim()) {
    throw new SettlementValidationError(
      `Policy calendarId must be a non-empty string. Received: ${JSON.stringify(policy.calendarId)}`
    );
  }

  const convention: NonWorkingDayHandlingConvention =
    policy.nonWorkingDayConvention ?? 'following_business_day';

  if (
    convention !== 'following_business_day' &&
    convention !== 'preceding_business_day' &&
    convention !== 'no_adjustment'
  ) {
    throw new SettlementValidationError(
      `Invalid nonWorkingDayConvention: "${convention as string}".`
    );
  }

  const priority =
    typeof policy.priority === 'number' && Number.isFinite(policy.priority)
      ? Math.trunc(policy.priority)
      : 0;

  const merchantId =
    typeof policy.merchantId === 'string' && policy.merchantId.trim()
      ? policy.merchantId.trim()
      : undefined;

  const terminalId =
    typeof policy.terminalId === 'string' && policy.terminalId.trim()
      ? policy.terminalId.trim()
      : undefined;

  let currency: string | undefined;
  if (typeof policy.currency === 'string' && policy.currency.trim()) {
    currency = policy.currency.trim().toUpperCase();
    if (!CURRENCY_CODE_REGEX.test(currency)) {
      throw new SettlementValidationError(
        `Invalid policy currency code "${policy.currency}". Must be a 3-letter ISO 4217 code.`
      );
    }
  }

  return {
    id: policy.id.trim(),
    version: policy.version.trim(),
    acquirerId: policy.acquirerId.trim(),
    merchantId,
    terminalId,
    currency,
    effectiveFrom: policy.effectiveFrom.trim(),
    effectiveTo: policy.effectiveTo ? policy.effectiveTo.trim() : undefined,
    priority,
    cycleLength: policy.cycleLength,
    cycleUnit: policy.cycleUnit,
    cutOffTime,
    timeZone: policy.timeZone.trim(),
    calendarId: policy.calendarId.trim(),
    nonWorkingDayConvention: convention,
    description: policy.description?.trim(),
  };
}

/**
 * Checks whether two normalized settlement policies have identical terms.
 */
export function arePoliciesIdentical(
  a: NormalizedSettlementPolicy,
  b: NormalizedSettlementPolicy
): boolean {
  return (
    a.id === b.id &&
    a.version === b.version &&
    a.acquirerId === b.acquirerId &&
    a.merchantId === b.merchantId &&
    a.terminalId === b.terminalId &&
    a.currency === b.currency &&
    a.effectiveFrom === b.effectiveFrom &&
    a.effectiveTo === b.effectiveTo &&
    a.priority === b.priority &&
    a.cycleLength === b.cycleLength &&
    a.cycleUnit === b.cycleUnit &&
    a.cutOffTime === b.cutOffTime &&
    a.timeZone === b.timeZone &&
    a.calendarId === b.calendarId &&
    a.nonWorkingDayConvention === b.nonWorkingDayConvention
  );
}

/**
 * Validates and normalizes an array of settlement policies, deduplicating identical policies
 * and rejecting conflicting definitions with identical IDs.
 */
export function validateAndNormalizeSettlementPolicies(
  policies: SettlementPolicy[]
): NormalizedSettlementPolicy[] {
  if (!Array.isArray(policies) || policies.length === 0) {
    throw new SettlementValidationError(
      'At least one valid SettlementPolicy must be provided to evaluate settlement forecasts.'
    );
  }

  const normalizedList: NormalizedSettlementPolicy[] = [];
  const byId = new Map<string, NormalizedSettlementPolicy>();

  for (const p of policies) {
    const normalized = validateAndNormalizeSettlementPolicy(p);
    const existing = byId.get(normalized.id);

    if (existing) {
      if (!arePoliciesIdentical(existing, normalized)) {
        throw new SettlementPolicyConflictError(
          `Conflicting policy terms detected for policy ID "${normalized.id}".`,
          [existing.id, normalized.id]
        );
      }
      // If identical, ignore duplicate
    } else {
      byId.set(normalized.id, normalized);
      normalizedList.push(normalized);
    }
  }

  return normalizedList;
}
