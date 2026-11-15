// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/settlement/calendar.ts
 * @description Calendar calculation primitives for working days, holidays, and T+N advancement.
 */

import { SettlementRangeError, SettlementValidationError } from './errors.js';
import type {
  NonWorkingDayHandlingConvention,
  SettlementCalendar,
} from './types.js';

/** Maximum lookahead days to prevent infinite loops on calendars with no working days */
export const MAX_CALENDAR_SEARCH_DAYS = 366;

/**
 * Regular expression strictly enforcing ISO date strings in 'YYYY-MM-DD' format.
 */
const ISO_DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Parsed components of an ISO calendar date.
 */
export interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Parses and verifies an ISO 8601 calendar date ('YYYY-MM-DD').
 * Validates actual calendar boundaries (e.g. leap years, days per month).
 *
 * @param dateStr - ISO date string.
 * @returns Parsed year, month, and day.
 * @throws {SettlementValidationError} If the format or calendar date is invalid.
 */
export function parseISODate(dateStr: string): ParsedDate {
  if (typeof dateStr !== 'string' || !ISO_DATE_REGEX.test(dateStr.trim())) {
    throw new SettlementValidationError(
      `Date must be a valid ISO 8601 calendar string in 'YYYY-MM-DD' format. Received: ${JSON.stringify(dateStr)}`
    );
  }

  const parts = dateStr.trim().split('-');
  const yearStr = parts[0];
  const monthStr = parts[1];
  const dayStr = parts[2];

  if (!yearStr || !monthStr || !dayStr) {
    throw new SettlementValidationError(
      `Date must be a valid ISO 8601 calendar string in 'YYYY-MM-DD' format. Received: ${JSON.stringify(dateStr)}`
    );
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() + 1 !== month ||
    utcDate.getUTCDate() !== day
  ) {
    throw new SettlementValidationError(
      `Impossible calendar date: "${dateStr}". Check month lengths and leap years.`
    );
  }

  return { year, month, day };
}

/**
 * Formats year, month, and day numbers into a canonical 'YYYY-MM-DD' string.
 */
export function formatISODate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Computes the ISO weekday number for a calendar date (1 = Monday, ..., 7 = Sunday).
 *
 * @param dateStr - ISO date string ('YYYY-MM-DD').
 * @returns ISO weekday number (1 to 7).
 */
export function getISOWeekday(dateStr: string): number {
  const { year, month, day } = parseISODate(dateStr);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = utcDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return dayOfWeek === 0 ? 7 : dayOfWeek;
}

/**
 * Adds a signed number of calendar days to an ISO date string.
 * Preserves exact calendar progression across month, year, and leap-year boundaries.
 *
 * @param dateStr - Base ISO date string ('YYYY-MM-DD').
 * @param days - Number of days to add (positive or negative).
 * @returns Resulting ISO date string ('YYYY-MM-DD').
 */
export function addCalendarDays(dateStr: string, days: number): string {
  const { year, month, day } = parseISODate(dateStr);
  const target = new Date(Date.UTC(year, month - 1, day + days));
  return formatISODate(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    target.getUTCDate()
  );
}

/**
 * Calculates the number of calendar days between two ISO dates (endDate - startDate).
 *
 * @param startDateStr - Start ISO date ('YYYY-MM-DD').
 * @param endDateStr - End ISO date ('YYYY-MM-DD').
 * @returns Number of calendar days elapsed.
 */
export function daysBetween(startDateStr: string, endDateStr: string): number {
  const start = parseISODate(startDateStr);
  const end = parseISODate(endDateStr);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  return Math.round((endUtc - startUtc) / 86_400_000);
}

/**
 * Checks whether a calendar date is recorded as a non-working holiday in the calendar.
 *
 * @param dateStr - ISO date string ('YYYY-MM-DD').
 * @param calendar - Settlement calendar containing holiday definitions.
 * @returns True if the date is in the calendar's holiday list.
 */
export function isHoliday(dateStr: string, calendar: SettlementCalendar): boolean {
  const normalized = dateStr.trim();
  return calendar.holidays.includes(normalized);
}

/**
 * Determines whether a given date is an active working day under the specified calendar.
 * A date is a working day if its ISO weekday is in `workingDays` AND it is not a holiday.
 *
 * @param dateStr - ISO date string ('YYYY-MM-DD').
 * @param calendar - Settlement calendar.
 * @returns True if the date is an eligible working day.
 */
export function isWorkingDay(dateStr: string, calendar: SettlementCalendar): boolean {
  const weekday = getISOWeekday(dateStr);
  if (!calendar.workingDays.includes(weekday)) {
    return false;
  }
  return !isHoliday(dateStr, calendar);
}

/**
 * Returns the candidate date if it is already an eligible working day,
 * or advances day-by-day to the earliest subsequent working day.
 *
 * @param dateStr - Base ISO date ('YYYY-MM-DD').
 * @param calendar - Settlement calendar.
 * @returns The earliest eligible working day on or after dateStr.
 * @throws {SettlementRangeError} If no working day is found within MAX_CALENDAR_SEARCH_DAYS.
 */
export function findEligibleWorkingDay(
  dateStr: string,
  calendar: SettlementCalendar
): string {
  let current = dateStr;
  let iterations = 0;

  while (!isWorkingDay(current, calendar)) {
    current = addCalendarDays(current, 1);
    iterations++;
    if (iterations > MAX_CALENDAR_SEARCH_DAYS) {
      throw new SettlementRangeError(
        `Exceeded calendar search threshold (${MAX_CALENDAR_SEARCH_DAYS} days) while looking for an eligible working day starting from "${dateStr}". Ensure the calendar defines valid working days.`
      );
    }
  }

  return current;
}

/**
 * Finds the first eligible working day strictly AFTER the specified date.
 *
 * @param dateStr - Base ISO date ('YYYY-MM-DD').
 * @param calendar - Settlement calendar.
 * @returns The next working day strictly after dateStr.
 * @throws {SettlementRangeError} If no working day is found within MAX_CALENDAR_SEARCH_DAYS.
 */
export function getNextWorkingDay(
  dateStr: string,
  calendar: SettlementCalendar
): string {
  const nextDay = addCalendarDays(dateStr, 1);
  return findEligibleWorkingDay(nextDay, calendar);
}

/**
 * Advances a start date by N eligible business days according to the settlement calendar.
 * If N is 0, returns the start date (or the earliest eligible working day if startDate is non-working).
 *
 * @param startDateStr - Anchor working date ('YYYY-MM-DD').
 * @param n - Number of business days to advance (>= 0).
 * @param calendar - Settlement calendar.
 * @returns Final settlement date landing on an eligible working day.
 * @throws {SettlementRangeError} If n < 0 or search threshold is exceeded.
 */
export function addBusinessDays(
  startDateStr: string,
  n: number,
  calendar: SettlementCalendar
): string {
  if (n < 0 || !Number.isInteger(n)) {
    throw new SettlementRangeError(
      `Business day advancement count must be a non-negative integer. Received: ${n}`
    );
  }

  let current = findEligibleWorkingDay(startDateStr, calendar);
  let remaining = n;
  let totalSteps = 0;
  const maxAllowedSteps = MAX_CALENDAR_SEARCH_DAYS * Math.max(1, n);

  while (remaining > 0) {
    current = addCalendarDays(current, 1);
    totalSteps++;

    if (totalSteps > maxAllowedSteps) {
      throw new SettlementRangeError(
        `Exceeded maximum calendar advancement threshold (${maxAllowedSteps} steps) while adding ${n} business days to "${startDateStr}".`
      );
    }

    if (isWorkingDay(current, calendar)) {
      remaining--;
    }
  }

  return current;
}

/**
 * Adjusts a candidate settlement date if it falls on a non-working day,
 * according to the specified policy convention.
 *
 * @param dateStr - Candidate settlement date ('YYYY-MM-DD').
 * @param calendar - Settlement calendar.
 * @param convention - Adjustment convention ('following_business_day' | 'preceding_business_day' | 'no_adjustment').
 * @returns Adjusted settlement date.
 * @throws {SettlementRangeError} If search threshold is exceeded.
 */
export function adjustNonWorkingDay(
  dateStr: string,
  calendar: SettlementCalendar,
  convention: NonWorkingDayHandlingConvention = 'following_business_day'
): string {
  if (convention === 'no_adjustment' || isWorkingDay(dateStr, calendar)) {
    return dateStr;
  }

  if (convention === 'following_business_day') {
    return findEligibleWorkingDay(dateStr, calendar);
  }

  if (convention === 'preceding_business_day') {
    let current = dateStr;
    let iterations = 0;
    while (!isWorkingDay(current, calendar)) {
      current = addCalendarDays(current, -1);
      iterations++;
      if (iterations > MAX_CALENDAR_SEARCH_DAYS) {
        throw new SettlementRangeError(
          `Exceeded calendar search threshold (${MAX_CALENDAR_SEARCH_DAYS} days) looking backwards for a working day from "${dateStr}".`
        );
      }
    }
    return current;
  }

  throw new SettlementValidationError(
    `Unsupported non-working day convention: "${convention as string}".`
  );
}
