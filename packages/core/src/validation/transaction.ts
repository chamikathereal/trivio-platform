// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/validation/transaction.ts
 * @description Input validation and normalization for payment transactions.
 */

import { TrivioValidationError, TrivioRangeError } from '../types/errors.js';
import type { TransactionInput } from '../types/transaction.js';

export interface NormalizedTransaction extends Omit<TransactionInput, 'transactionDate'> {
  transactionDate: Date;
  currency: string;
}

/**
 * Validates and normalizes transaction input parameters.
 *
 * @param input - Raw transaction input.
 * @returns Normalized transaction with Date object and uppercase currency code.
 */
export function validateAndNormalizeTransaction(input: TransactionInput): NormalizedTransaction {
  if (!input || typeof input !== 'object') {
    throw new TrivioValidationError('Transaction input must be an object');
  }

  // 1. Validate grossMinor
  if (typeof input.grossMinor !== 'number' || !Number.isFinite(input.grossMinor)) {
    throw new TrivioValidationError(
      `grossMinor must be a finite number, received: ${String(input.grossMinor)}`
    );
  }

  if (!Number.isSafeInteger(input.grossMinor)) {
    throw new TrivioValidationError(
      `grossMinor must be a safe integer (no fractional minor units), received: ${input.grossMinor}`
    );
  }

  if (input.grossMinor < 0) {
    throw new TrivioRangeError(
      `grossMinor must be a non-negative integer, received: ${input.grossMinor}`
    );
  }

  // 2. Validate currency
  if (typeof input.currency !== 'string' || input.currency.trim().length !== 3) {
    throw new TrivioValidationError(
      `currency must be an ISO 4217 three-letter code (e.g. 'LKR', 'USD'), received: ${String(input.currency)}`
    );
  }
  const normalizedCurrency = input.currency.trim().toUpperCase();

  // 3. Validate acquirerId
  if (typeof input.acquirerId !== 'string' || input.acquirerId.trim().length === 0) {
    throw new TrivioValidationError('acquirerId must be a non-empty string');
  }

  // 4. Validate transactionDate
  let txDate: Date;
  if (input.transactionDate instanceof Date) {
    if (isNaN(input.transactionDate.getTime())) {
      throw new TrivioValidationError('transactionDate Date instance is invalid');
    }
    txDate = new Date(input.transactionDate.getTime());
  } else if (typeof input.transactionDate === 'string') {
    txDate = new Date(input.transactionDate);
    if (isNaN(txDate.getTime())) {
      throw new TrivioValidationError(
        `transactionDate string could not be parsed into a valid timestamp: ${input.transactionDate}`
      );
    }
  } else {
    throw new TrivioValidationError('transactionDate must be a Date object or valid ISO 8601 string');
  }

  // 5. Optional string field validations
  if (input.merchantId !== undefined && typeof input.merchantId !== 'string') {
    throw new TrivioValidationError('merchantId must be a string if provided');
  }

  if (input.terminalId !== undefined && typeof input.terminalId !== 'string') {
    throw new TrivioValidationError('terminalId must be a string if provided');
  }

  if (input.cardScheme !== undefined && typeof input.cardScheme !== 'string') {
    throw new TrivioValidationError('cardScheme must be a string if provided');
  }

  if (input.cardFundingType !== undefined && typeof input.cardFundingType !== 'string') {
    throw new TrivioValidationError('cardFundingType must be a string if provided');
  }

  if (input.cardRegion !== undefined && typeof input.cardRegion !== 'string') {
    throw new TrivioValidationError('cardRegion must be a string if provided');
  }

  return {
    ...input,
    grossMinor: input.grossMinor,
    currency: normalizedCurrency,
    acquirerId: input.acquirerId.trim(),
    transactionDate: txDate,
  };
}
