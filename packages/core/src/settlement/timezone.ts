// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/settlement/timezone.ts
 * @description Timezone-aware date and time parsing primitives using ECMAScript Intl.
 */

import {
  SettlementRangeError,
  SettlementValidationError,
} from './errors.js';

/**
 * Validates that a string is a recognized IANA timezone identifier.
 *
 * @param timeZone - Candidate IANA timezone string (e.g. 'Asia/Colombo', 'UTC').
 * @throws {SettlementValidationError} If the timezone is not a valid string.
 * @throws {SettlementRangeError} If the runtime does not recognize the IANA timezone.
 */
export function validateIanaTimeZone(timeZone: string): void {
  if (typeof timeZone !== 'string' || timeZone.trim().length === 0) {
    throw new SettlementValidationError(
      `Timezone must be a non-empty string. Received: ${JSON.stringify(timeZone)}`
    );
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone.trim() });
  } catch {
    throw new SettlementRangeError(
      `Invalid or unsupported IANA timezone identifier: "${timeZone}". Expected a valid IANA identifier like "Asia/Colombo", "UTC", or "America/New_York".`
    );
  }
}

/**
 * Regular expression strictly enforcing ISO 8601 timestamps with an explicit UTC 'Z' or numeric offset.
 * Rejects bare local timestamps lacking explicit timezone context.
 */
const ISO_TIMESTAMP_WITH_OFFSET_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|[+-]\d{2}(?::?\d{2})?)$/i;

/**
 * Parses and strictly validates an ISO 8601 transaction timestamp.
 *
 * @param isoString - ISO 8601 formatted timestamp string.
 * @returns Parsed native JavaScript Date object representing the UTC instant.
 * @throws {SettlementValidationError} If timestamp is invalid or lacks an explicit timezone offset.
 */
export function parseIsoTimestamp(isoString: string): Date {
  if (typeof isoString !== 'string' || !isoString.trim()) {
    throw new SettlementValidationError(
      `Transaction timestamp must be a non-empty ISO 8601 string. Received: ${JSON.stringify(isoString)}`
    );
  }

  const trimmed = isoString.trim();

  if (!ISO_TIMESTAMP_WITH_OFFSET_REGEX.test(trimmed)) {
    throw new SettlementValidationError(
      `Transaction timestamp must be an explicit ISO 8601 string with UTC 'Z' or a numeric offset (+/-HH:mm). Bare local timestamps without offset are prohibited to prevent computer-timezone dependency. Received: "${trimmed}"`
    );
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new SettlementValidationError(
      `Transaction timestamp could not be parsed as a valid calendar instant: "${trimmed}"`
    );
  }

  return date;
}

export interface ZonedDateTimeParts {
  localDate: string; // 'YYYY-MM-DD'
  localTime: string; // 'HH:mm:ss'
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  isoWeekday: number; // 1 = Monday, ..., 7 = Sunday
  localWeekday: number; // 1 = Monday, ..., 7 = Sunday (alias for isoWeekday)
}

/**
 * Extracts local date, time, and weekday components for a given instant in a target IANA timezone.
 * Uses native Intl.DateTimeFormat without external dependencies.
 *
 * @param instant - Date object or ISO 8601 timestamp string.
 * @param timeZone - Target IANA timezone identifier.
 * @returns Decomposed local date and time parts in the target timezone.
 */
export function getZonedDateTimeParts(
  instant: Date | string,
  timeZone: string
): ZonedDateTimeParts {
  validateIanaTimeZone(timeZone);

  const date = typeof instant === 'string' ? parseIsoTimestamp(instant) : instant;
  if (Number.isNaN(date.getTime())) {
    throw new SettlementValidationError('Invalid Date instance provided to getZonedDateTimeParts.');
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone.trim(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  let yearStr = '';
  let monthStr = '';
  let dayStr = '';
  let hourStr = '';
  let minuteStr = '';
  let secondStr = '';

  for (const part of parts) {
    switch (part.type) {
      case 'year':
        yearStr = part.value;
        break;
      case 'month':
        monthStr = part.value;
        break;
      case 'day':
        dayStr = part.value;
        break;
      case 'hour':
        hourStr = part.value;
        break;
      case 'minute':
        minuteStr = part.value;
        break;
      case 'second':
        secondStr = part.value;
        break;
    }
  }

  // Normalize midnight representation (some runtimes output '24' for 24:00)
  if (hourStr === '24') {
    hourStr = '00';
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  const seconds = parseInt(secondStr, 10);

  const localDate = `${yearStr.padStart(4, '0')}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
  const localTime = `${hourStr.padStart(2, '0')}:${minuteStr.padStart(2, '0')}:${secondStr.padStart(2, '0')}`;

  // Compute ISO weekday (1 = Monday, 7 = Sunday) based on local calendar date using UTC coordinates
  const utcAnchor = new Date(Date.UTC(year, month - 1, day));
  const rawDay = utcAnchor.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const isoWeekday = rawDay === 0 ? 7 : rawDay;

  return {
    localDate,
    localTime,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    isoWeekday,
    localWeekday: isoWeekday,
  };
}
