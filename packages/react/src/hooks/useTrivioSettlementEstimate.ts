/**
 * @file packages/react/src/hooks/useTrivioSettlementEstimate.ts
 * @description Client-side React hook for memoized, zero-network payment settlement calculations.
 */

import { useMemo } from 'react';
import {
  calculatePaymentSettlementEstimate,
  type IntegratedTransactionInput,
  type IntegratedSettlementConfig,
  type IntegratedSettlementOptions,
  type IntegratedSettlementEstimateResult,
} from '@trivio.ink/core';
import type { UseTrivioSettlementEstimateResult } from '../types.js';

/**
 * React hook that executes deterministic, offline payment settlement calculations.
 *
 * Computes fee deductions and settlement calendar forecasts locally inside developer
 * client applications using the Trivio core financial engine without network dependencies.
 *
 * @example
 * const { estimate, error, isLoading } = useTrivioSettlementEstimate(
 *   transaction,
 *   settlementConfig
 * );
 *
 * if (estimate) {
 *   return <TrivioSettlementSummary estimate={estimate} />;
 * }
 *
 * @param input - Transaction details (amount, currency, scheme, authorization timestamp).
 * @param config - Pre-configured merchant rules, settlement policies, and calendars.
 * @param options - Calculation overrides (e.g. calculation version).
 * @returns Result object containing memoized `estimate`, `error`, and `isLoading`.
 */
export function useTrivioSettlementEstimate(
  input: IntegratedTransactionInput | null | undefined,
  config: IntegratedSettlementConfig,
  options?: IntegratedSettlementOptions
): UseTrivioSettlementEstimateResult {
  return useMemo<UseTrivioSettlementEstimateResult>(() => {
    // If input is null or undefined, return idle state
    if (!input) {
      return {
        estimate: null,
        error: null,
        isLoading: false,
      };
    }

    try {
      const result: IntegratedSettlementEstimateResult = calculatePaymentSettlementEstimate(
        input,
        config,
        options
      );

      return {
        estimate: result,
        error: null,
        isLoading: false,
      };
    } catch (err) {
      return {
        estimate: null,
        error: err instanceof Error ? err : new Error(String(err)),
        isLoading: false,
      };
    }
  }, [
    input?.grossMinor,
    input?.currency,
    input?.cardScheme,
    input?.cardFundingType,
    input?.cardRegion,
    input?.transactionTime,
    input?.acquirerId,
    input?.merchantId,
    input?.terminalId,
    config,
    options?.calculationVersion,
  ]);
}
