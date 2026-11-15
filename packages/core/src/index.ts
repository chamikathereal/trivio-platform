/**
 * @file packages/core/src/index.ts
 * @description Core deterministic payment calculation engine for Trivio.
 * Stage 1 demonstration primitive: percentage fee calculation.
 */

/**
 * Supported basis points divisor: 10,000 basis points equals 100.00% (or 1.0).
 */
export const BASIS_POINTS_DIVISOR = 10_000n;

/**
 * Minimum supported rate in basis points (0%).
 */
export const MIN_SUPPORTED_RATE_BPS = 0;

/**
 * Maximum supported rate in basis points (10,000 bps = 100.00%).
 */
export const MAX_SUPPORTED_RATE_BPS = 10_000;

/**
 * Error thrown when an input value fails type or structure validation.
 */
export class TrivioValidationError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = 'TrivioValidationError';
    Object.setPrototypeOf(this, TrivioValidationError.prototype);
  }
}

/**
 * Error thrown when an input value is outside supported mathematical or business boundaries.
 */
export class TrivioRangeError extends RangeError {
  constructor(message: string) {
    super(message);
    this.name = 'TrivioRangeError';
    Object.setPrototypeOf(this, TrivioRangeError.prototype);
  }
}

/**
 * Result structure returned by percentage fee estimation.
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
 * ### Arithmetic and Rounding Policy
 * Arithmetic is evaluated strictly using `BigInt` intermediate values to prevent IEEE-754
 * binary floating-point rounding errors.
 *
 * A **Round-Half-Up** policy is applied to determine the minor unit fee:
 * - If the remainder upon integer division by 10,000 is greater than or equal to 5,000,
 *   the minor fee rounds up towards positive infinity.
 * - Otherwise, it rounds down (truncates).
 * Formula: `feeMinor = (grossMinor * rateBasisPoints + 5000) / 10000` (integer division).
 *
 * ### Supported Ranges
 * - `grossMinor`: `0 <= grossMinor <= Number.MAX_SAFE_INTEGER`
 * - `rateBasisPoints`: `0 <= rateBasisPoints <= 10000` (representing 0.00% to 100.00%)
 *
 * > **Disclaimer:** This function is a Stage 1 demonstration primitive for arithmetic verification.
 * > It is NOT a bank-certified calculator and does not represent live acquirer settlement advice.
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

  // 3. Deterministic BigInt arithmetic with Round-Half-Up policy
  const grossBig = BigInt(grossMinor);
  const rateBig = BigInt(rateBasisPoints);

  // Round-half-up addition: (N + 5000) / 10000
  const halfUpOffset = BASIS_POINTS_DIVISOR / 2n; // 5000n
  const numerator = grossBig * rateBig;
  const feeBig = (numerator + halfUpOffset) / BASIS_POINTS_DIVISOR;

  const netBig = grossBig - feeBig;

  const feeMinor = Number(feeBig);
  const netMinor = Number(netBig);

  return {
    grossMinor,
    feeMinor,
    netMinor,
    rateBasisPoints,
  };
}
