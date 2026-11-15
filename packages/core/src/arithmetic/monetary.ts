/**
 * @file packages/core/src/arithmetic/monetary.ts
 * @description Zero-float financial arithmetic primitives using integer minor units and BigInt.
 */

import { TrivioRangeError, TrivioValidationError } from '../types/errors.js';

/**
 * Standard divisor for basis point conversions (10,000 bps = 100.00%).
 */
export const BASIS_POINTS_DIVISOR = 10_000n;

/**
 * Minimum permissible rate in basis points (0.00%).
 */
export const MIN_SUPPORTED_RATE_BPS = 0;

/**
 * Maximum permissible rate in basis points (100.00% = 10,000 bps).
 */
export const MAX_SUPPORTED_RATE_BPS = 10_000;

/**
 * Default calculation policy identifier.
 */
export const DEFAULT_CALCULATION_POLICY = 'trivio-mdr-v1-half-up';

/**
 * Performs deterministic integer division with Round-Half-Up rounding on positive values.
 *
 * For non-negative numerator and positive denominator:
 * Formula: `(2 * numerator + denominator) / (2 * denominator)`
 * In integer arithmetic with divisor 10,000: `(numerator + 5,000) / 10,000`
 *
 * @param numerator - BigInt dividend.
 * @param denominator - BigInt positive divisor.
 * @returns Rounded BigInt quotient.
 */
export function roundHalfUpDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) {
    throw new TrivioRangeError(`Denominator must be positive, received: ${denominator}`);
  }
  if (numerator < 0n) {
    throw new TrivioRangeError(`Numerator must be non-negative, received: ${numerator}`);
  }

  const half = denominator / 2n;
  return (numerator + half) / denominator;
}

/**
 * Computes percentage fee in minor currency units using BigInt intermediate precision
 * and round-half-up rounding.
 *
 * @param grossMinor - Non-negative integer gross amount in minor units.
 * @param rateBasisPoints - Non-negative rate in basis points (0 to 10,000).
 * @returns Calculated fee in integer minor units.
 */
export function calculatePercentageFee(
  grossMinor: number,
  rateBasisPoints: number
): number {
  if (!Number.isSafeInteger(grossMinor) || grossMinor < 0) {
    throw new TrivioValidationError(
      `grossMinor must be a non-negative safe integer, received: ${grossMinor}`
    );
  }

  if (
    !Number.isSafeInteger(rateBasisPoints) ||
    rateBasisPoints < MIN_SUPPORTED_RATE_BPS ||
    rateBasisPoints > MAX_SUPPORTED_RATE_BPS
  ) {
    throw new TrivioRangeError(
      `rateBasisPoints must be an integer between ${MIN_SUPPORTED_RATE_BPS} and ${MAX_SUPPORTED_RATE_BPS}, received: ${rateBasisPoints}`
    );
  }

  const grossBig = BigInt(grossMinor);
  const rateBig = BigInt(rateBasisPoints);
  const numerator = grossBig * rateBig;

  const feeBig = roundHalfUpDiv(numerator, BASIS_POINTS_DIVISOR);
  if (feeBig > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new TrivioRangeError(`Calculated percentage fee exceeds Number.MAX_SAFE_INTEGER: ${feeBig}`);
  }
  return Number(feeBig);
}
