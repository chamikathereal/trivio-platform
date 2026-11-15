/**
 * @file packages/node/src/index.ts
 * @description Server-side Node.js SDK foundation for Trivio.
 */

import {
  estimatePercentageFee,
  type FeeEstimateResult,
  calculateFeeEstimate,
  findMatchingRule,
  type TransactionInput,
  type MerchantFeeRule,
  type DynamicFeeEstimateResult,
  type FeeCalculationOptions,
  TrivioValidationError,
  TrivioRangeError,
  RuleNotFoundError,
  RuleConflictError,
  NegativeNetSettlementError,
} from '@trivio.ink/core';

export {
  estimatePercentageFee,
  type FeeEstimateResult,
  calculateFeeEstimate,
  findMatchingRule,
  type TransactionInput,
  type MerchantFeeRule,
  type DynamicFeeEstimateResult,
  type FeeCalculationOptions,
  TrivioValidationError,
  TrivioRangeError,
  RuleNotFoundError,
  RuleConflictError,
  NegativeNetSettlementError,
};

/**
 * Configuration options for initializing the Trivio Node.js client.
 */
export interface TrivioClientOptions {
  /**
   * Trivio Cloud API key (for future hosted cloud services).
   * Optional in Stage 1 & 2A; offline calculations do not require credentials.
   */
  apiKey?: string;

  /**
   * Base endpoint URL for Trivio Cloud API.
   * Defaults to production endpoint `https://api.trivio.ink`.
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * Defaults to 10,000 ms.
   */
  timeoutMs?: number;
}

/**
 * Default production API base URL.
 */
export const DEFAULT_BASE_URL = 'https://api.trivio.ink';

/**
 * Default request timeout in milliseconds.
 */
export const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Server-side SDK Client for Trivio payment settlement intelligence.
 */
export class TrivioClient {
  public readonly apiKey?: string;
  public readonly baseUrl: string;
  public readonly timeoutMs: number;
  public readonly version: string = '0.2.0';

  constructor(options: TrivioClientOptions = {}) {
    if (options.apiKey !== undefined && typeof options.apiKey !== 'string') {
      throw new TrivioValidationError('apiKey must be a string if provided');
    }

    if (options.baseUrl !== undefined) {
      if (typeof options.baseUrl !== 'string' || options.baseUrl.trim() === '') {
        throw new TrivioValidationError('baseUrl must be a non-empty string if provided');
      }
    }

    if (options.timeoutMs !== undefined) {
      if (
        typeof options.timeoutMs !== 'number' ||
        !Number.isSafeInteger(options.timeoutMs) ||
        options.timeoutMs <= 0
      ) {
        throw new TrivioValidationError('timeoutMs must be a positive safe integer if provided');
      }
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Whether client credentials have been supplied for future Trivio Cloud connectivity.
   */
  public get isCloudConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  /**
   * Deterministic local fee calculation without network requests.
   *
   * @param grossMinor - Non-negative integer transaction amount in minor currency units.
   * @param rateBasisPoints - Non-negative integer rate in basis points (0 to 10,000).
   * @returns Calculated fee estimate and settlement net minor.
   */
  public calculateFee(grossMinor: number, rateBasisPoints: number): FeeEstimateResult {
    return estimatePercentageFee(grossMinor, rateBasisPoints);
  }

  /**
   * Deterministic dynamic fee estimation evaluated against merchant agreement rules.
   *
   * @param transaction - Transaction details.
   * @param rules - Configured merchant fee agreement rules.
   * @param options - Calculation options.
   * @returns Detailed calculation estimate and breakdown.
   */
  public calculateDynamicFee(
    transaction: TransactionInput,
    rules: MerchantFeeRule[],
    options?: FeeCalculationOptions
  ): DynamicFeeEstimateResult {
    return calculateFeeEstimate(transaction, rules, options);
  }
}
