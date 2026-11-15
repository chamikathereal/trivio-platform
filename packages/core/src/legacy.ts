// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/legacy.ts
 * @description Backward-compatible Stage 1 percentage fee calculation primitive.
 */

import {
  BASIS_POINTS_DIVISOR,
  calculatePercentageFee,
  MAX_SUPPORTED_RATE_BPS,
  MIN_SUPPORTED_RATE_BPS,
} from './arithmetic/monetary.js';
import { TrivioRangeError, TrivioValidationError } from './types/errors.js';

export {
  BASIS_POINTS_DIVISOR,
  MAX_SUPPORTED_RATE_BPS,
  MIN_SUPPORTED_RATE_BPS,
  TrivioRangeError,
  TrivioValidationError,
};

/**
 * Result structure returned by Stage 1 percentage fee estimation.
 */
export interface FeeEstimateResult {
  /** Gross transaction amount in minor currency units. */
  grossMinor: number;
  /** Calculated fee in minor currency units, rounded using round-half-up policy. */
  feeMinor: number;
  /** Net settlement amount in minor currency units (grossMinor - feeMinor). */
  netMinor: number;
  /** Applied fee rate in integer basis points (1 bps = 0.01%). */
  rateBasisPoints: number;
}

/**
 * Estimates percentage fee and net settlement amount for a given gross minor amount and basis-point rate.
 *
 * @param grossMinor - Non-negative integer transaction amount in minor units.
 * @param rateBasisPoints - Non-negative integer rate in basis points (0 to 10,000).
 * @returns Result object containing grossMinor, feeMinor, netMinor, and rateBasisPoints.
 * @throws {TrivioValidationError} If any parameter is not a safe integer or is non-numeric.
 * @throws {TrivioRangeError} If any parameter is negative or rateBasisPoints exceeds 10,000.
 */
export function estimatePercentageFee(
  grossMinor: number,
  rateBasisPoints: number
): FeeEstimateResult {
  // 1. Validate grossMinor type and safe integer bounds
  if (typeof grossMinor !== 'number' || !Number.isFinite(grossMinor)) {
    throw new TrivioValidationError(
      `grossMinor must be a finite number, received: ${String(grossMinor)}`
    );
  }

  if (!Number.isSafeInteger(grossMinor)) {
    throw new TrivioValidationError(
      `grossMinor must be a safe integer (between 0 and ${Number.MAX_SAFE_INTEGER}), received: ${grossMinor}`
    );
  }

  if (grossMinor < 0) {
    throw new TrivioRangeError(
      `grossMinor must be a non-negative integer, received: ${grossMinor}`
    );
  }

  // 2. Validate rateBasisPoints type and safe integer bounds
  if (typeof rateBasisPoints !== 'number' || !Number.isFinite(rateBasisPoints)) {
    throw new TrivioValidationError(
      `rateBasisPoints must be a finite number, received: ${String(rateBasisPoints)}`
    );
  }

  if (!Number.isSafeInteger(rateBasisPoints)) {
    throw new TrivioValidationError(
      `rateBasisPoints must be a safe integer, received: ${rateBasisPoints}`
    );
  }

  if (rateBasisPoints < MIN_SUPPORTED_RATE_BPS || rateBasisPoints > MAX_SUPPORTED_RATE_BPS) {
    throw new TrivioRangeError(
      `rateBasisPoints must be between ${MIN_SUPPORTED_RATE_BPS} and ${MAX_SUPPORTED_RATE_BPS} (0% to 100%), received: ${rateBasisPoints}`
    );
  }

  // 3. Compute fee
  const feeMinor = calculatePercentageFee(grossMinor, rateBasisPoints);
  const netMinor = grossMinor - feeMinor;

  return {
    grossMinor,
    feeMinor,
    netMinor,
    rateBasisPoints,
  };
}
