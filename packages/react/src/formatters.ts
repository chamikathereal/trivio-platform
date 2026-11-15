// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/react/src/formatters.ts
 * @description Zero-float currency, rate, and calendar date formatting utilities.
 * Enforces Trivio Engineering Policy: Zero IEEE-754 floating-point operations.
 */

/**
 * ISO 4217 currencies with zero minor unit decimals.
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF',
  'KRW', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF',
  'XOF', 'XPF',
]);

/**
 * ISO 4217 currencies with three minor unit decimals.
 */
const THREE_DECIMAL_CURRENCIES = new Set([
  'BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND',
]);

/**
 * Returns the minor unit decimal exponent for a given ISO 4217 currency code.
 *
 * @param currencyCode - Three-letter ISO 4217 currency code.
 * @returns Number of decimal places (0, 2, or 3). Defaults to 2.
 */
export function getCurrencyDecimals(currencyCode?: string): number {
  if (!currencyCode || typeof currencyCode !== 'string') {
    return 2;
  }
  const normalized = currencyCode.trim().toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(normalized)) {
    return 0;
  }
  if (THREE_DECIMAL_CURRENCIES.has(normalized)) {
    return 3;
  }
  return 2;
}

/**
 * Formats an integer minor currency amount into a decimal string representation
 * using exact integer string manipulation without floating-point arithmetic.
 *
 * @example
 * formatMinorAmount(1000000, 2) // "10000.00"
 * formatMinorAmount(25000, 2)   // "250.00"
 * formatMinorAmount(50, 2)      // "0.50"
 * formatMinorAmount(1000, 0)    // "1000"
 * formatMinorAmount(1500, 3)    // "1.500"
 * formatMinorAmount(-5000, 2)   // "-50.00"
 *
 * @param minor - Minor unit integer amount (number or bigint).
 * @param decimals - Decimal places (defaults to 2).
 * @returns Deterministic exact decimal string.
 */
export function formatMinorAmount(
  minor: number | bigint,
  decimals: number = 2
): string {
  const isNegative = typeof minor === 'bigint' ? minor < 0n : minor < 0;
  const absBigInt = typeof minor === 'bigint'
    ? (isNegative ? -minor : minor)
    : BigInt(Math.abs(Math.trunc(minor)));

  if (decimals <= 0) {
    return `${isNegative ? '-' : ''}${absBigInt.toString()}`;
  }

  const str = absBigInt.toString().padStart(decimals + 1, '0');
  const integerPart = str.slice(0, str.length - decimals);
  const decimalPart = str.slice(str.length - decimals);

  return `${isNegative ? '-' : ''}${integerPart}.${decimalPart}`;
}

/**
 * Formats an integer minor currency amount with thousands separators and optional currency symbol/code.
 * Operates purely on strings to preserve zero-float financial integrity.
 *
 * @example
 * formatCurrency(1000000, 'USD') // "USD 10,000.00"
 * formatCurrency(25000, 'LKR')   // "LKR 250.00"
 * formatCurrency(1500, 'JPY')    // "JPY 1,500"
 *
 * @param minor - Minor unit integer amount.
 * @param currencyCode - ISO 4217 currency code.
 * @param options - Formatting configuration options.
 * @returns Formatted currency string with thousands separators.
 */
export function formatCurrency(
  minor: number | bigint,
  currencyCode: string = 'USD',
  options: {
    showCurrency?: boolean;
    useGrouping?: boolean;
  } = {}
): string {
  const { showCurrency = true, useGrouping = true } = options;
  const decimals = getCurrencyDecimals(currencyCode);
  const raw = formatMinorAmount(minor, decimals);

  const isNegative = raw.startsWith('-');
  const clean = isNegative ? raw.slice(1) : raw;
  const parts = clean.split('.');
  const integerPart = parts[0] ?? '0';
  const decimalPart = parts[1];

  const grouped = useGrouping
    ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : integerPart;

  const numericFormatted = decimalPart !== undefined ? `${grouped}.${decimalPart}` : grouped;
  const signed = isNegative ? `-${numericFormatted}` : numericFormatted;

  return showCurrency ? `${currencyCode.toUpperCase()} ${signed}` : signed;
}

/**
 * Formats fee rate basis points into a percentage string representation
 * using exact string manipulation without IEEE-754 division.
 *
 * @example
 * formatRateBps(250)    // "2.50%"
 * formatRateBps(150)    // "1.50%"
 * formatRateBps(10000)  // "100.00%"
 * formatRateBps(0)      // "0.00%"
 *
 * @param rateBps - Rate in basis points (1 bp = 0.01%).
 * @returns Percentage string with two decimal places.
 */
export function formatRateBps(rateBps: number): string {
  const isNegative = rateBps < 0;
  const absBps = Math.abs(Math.trunc(rateBps));
  const s = absBps.toString().padStart(3, '0');
  const integerPart = s.slice(0, s.length - 2);
  const decimalPart = s.slice(s.length - 2);

  return `${isNegative ? '-' : ''}${integerPart}.${decimalPart}%`;
}

/**
 * Formats an ISO 8601 date string (YYYY-MM-DD) into a human-friendly format.
 *
 * @example
 * formatDisplayDate('2026-11-18') // "Wed, Nov 18, 2026"
 *
 * @param isoDate - ISO date string (YYYY-MM-DD).
 * @param locale - Optional BCP 47 locale tag (defaults to 'en-US').
 * @returns Formatted date string or raw string if parsing fails.
 */
export function formatDisplayDate(isoDate?: string, locale: string = 'en-US'): string {
  if (!isoDate || typeof isoDate !== 'string') {
    return 'Pending';
  }

  // Parse YYYY-MM-DD components directly to avoid UTC timezone day-shifting
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match || !match[1] || !match[2] || !match[3]) {
    return isoDate;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // 0-indexed month
  const day = parseInt(match[3], 10);

  // Use UTC date constructor to maintain stable cross-platform rendering
  const date = new Date(Date.UTC(year, month, day, 12, 0, 0));

  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoDate;
  }
}
