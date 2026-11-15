/**
 * @file packages/core/src/engine/calculate.ts
 * @description Master calculation engine for dynamic merchant fee and net settlement estimation.
 */

import {
  calculatePercentageFee,
  DEFAULT_CALCULATION_POLICY,
} from '../arithmetic/monetary.js';
import { findMatchingRule } from '../rules/matcher.js';
import { NegativeNetSettlementError, TrivioValidationError } from '../types/errors.js';
import type {
  DynamicFeeEstimateResult,
  FeeBreakdownDetails,
  FeeCalculationOptions,
} from '../types/result.js';
import type { MerchantFeeRule } from '../types/rule.js';
import type { TransactionInput } from '../types/transaction.js';
import { validateAndNormalizeRules } from '../validation/rule.js';
import { validateAndNormalizeTransaction } from '../validation/transaction.js';

/**
 * Calculates a deterministic fee and net settlement estimate for a payment transaction
 * using caller-supplied merchant agreement rules.
 *
 * ### Guarantees
 * - **Zero-Float Precision:** All calculations use integer minor units and BigInt intermediate precision.
 * - **Deterministic Specificity:** Resolves rules by explicit priority followed by criteria specificity.
 * - **Conflict Rejection:** Explicitly rejects ambiguous configurations where two rules tie in priority and specificity.
 * - **Safe Serialization:** Returns standard JSON-serializable numbers and ISO date strings.
 *
 * @param transaction - Transaction details including gross minor amount, currency, and authorization context.
 * @param rules - Array of configured merchant fee agreement rules.
 * @param options - Optional calculation options (e.g. policy overrides, negative net settlement permission).
 * @returns Complete dynamic fee estimate and ledger reconciliation breakdown.
 * @throws {TrivioValidationError} If transaction or rule format is invalid.
 * @throws {TrivioRangeError} If amounts, rates, or bounds violate numerical constraints.
 * @throws {RuleNotFoundError} If no eligible agreement rule matches the transaction.
 * @throws {RuleConflictError} If multiple conflicting rules tie in priority and specificity.
 * @throws {NegativeNetSettlementError} If total fees exceed gross amount and negative net is not permitted.
 */
export function calculateFeeEstimate(
  transaction: TransactionInput,
  rules: MerchantFeeRule[],
  options: FeeCalculationOptions = {}
): DynamicFeeEstimateResult {
  // 1. Validate inputs
  const normalizedTx = validateAndNormalizeTransaction(transaction);
  const normalizedRules = validateAndNormalizeRules(rules);

  if (normalizedRules.length === 0) {
    throw new TrivioValidationError('Cannot calculate fee estimate: rules array is empty');
  }

  // 2. Select matching rule
  const matchedRule = findMatchingRule(normalizedRules, normalizedTx);
  const fs = matchedRule.feeStructure;

  // 3. Compute percentage fee component (Round-Half-Up on minor units)
  const percentageFeeMinor = calculatePercentageFee(
    normalizedTx.grossMinor,
    fs.rateBasisPoints
  );

  // 4. Fixed fee component
  const fixedFeeMinor = fs.fixedFeeMinor ?? 0;

  // 5. Unadjusted base fee
  const baseFeeMinor = percentageFeeMinor + fixedFeeMinor;

  // 6. Apply Minimum / Maximum bounds
  const minFeeMinor = fs.minFeeMinor ?? null;
  const maxFeeMinor = fs.maxFeeMinor ?? null;

  let minAdjustmentMinor: number | null = null;
  let maxAdjustmentMinor: number | null = null;
  let adjustedBaseFeeMinor = baseFeeMinor;

  if (minFeeMinor !== null && adjustedBaseFeeMinor < minFeeMinor) {
    minAdjustmentMinor = minFeeMinor - adjustedBaseFeeMinor;
    adjustedBaseFeeMinor = minFeeMinor;
  }

  if (maxFeeMinor !== null && adjustedBaseFeeMinor > maxFeeMinor) {
    maxAdjustmentMinor = adjustedBaseFeeMinor - maxFeeMinor;
    adjustedBaseFeeMinor = maxFeeMinor;
  }

  // 7. Apply optional configuration-driven taxes or levies
  let taxMinor = 0;
  let taxDetails: FeeBreakdownDetails['taxDetails'] = null;

  if (fs.taxAdjustment) {
    const taxRateBps = fs.taxAdjustment.rateBasisPoints ?? 0;
    const taxFixedMinor = fs.taxAdjustment.fixedMinor ?? 0;

    const taxPercentageMinor = taxRateBps > 0
      ? calculatePercentageFee(adjustedBaseFeeMinor, taxRateBps)
      : 0;

    taxMinor = taxPercentageMinor + taxFixedMinor;
    taxDetails = {
      rateBasisPoints: taxRateBps,
      fixedMinor: taxFixedMinor,
      name: fs.taxAdjustment.name,
      calculatedMinor: taxMinor,
    };
  }

  // 8. Total fee & Net settlement
  const totalFeeMinor = adjustedBaseFeeMinor + taxMinor;
  const netMinor = normalizedTx.grossMinor - totalFeeMinor;

  // 9. Negative Net Check
  if (netMinor < 0 && !options.allowNegativeNetSettlement) {
    throw new NegativeNetSettlementError(
      normalizedTx.grossMinor,
      totalFeeMinor,
      netMinor
    );
  }

  // 10. Assemble complete breakdown
  const breakdown: FeeBreakdownDetails = {
    grossMinor: normalizedTx.grossMinor,
    rateBasisPoints: fs.rateBasisPoints,
    percentageFeeMinor,
    fixedFeeMinor,
    baseFeeMinor,
    minFeeMinor,
    minAdjustmentMinor,
    maxFeeMinor,
    maxAdjustmentMinor,
    adjustedBaseFeeMinor,
    taxMinor,
    taxDetails,
    totalFeeMinor,
    netMinor,
  };

  const calculationPolicy = options.calculationPolicy ?? DEFAULT_CALCULATION_POLICY;

  return {
    grossMinor: normalizedTx.grossMinor,
    currency: normalizedTx.currency,
    totalFeeMinor,
    netMinor,
    appliedRateBasisPoints: fs.rateBasisPoints,
    fixedFeeMinor,
    percentageFeeMinor,
    minFeeAdjustmentMinor: minAdjustmentMinor,
    maxFeeAdjustmentMinor: maxAdjustmentMinor,
    taxMinor,
    appliedRule: {
      id: matchedRule.id,
      version: matchedRule.version,
      priority: matchedRule.priority,
      description: matchedRule.description,
    },
    breakdown,
    isEstimate: true,
    rateSource: matchedRule.rateSource ?? 'merchant_configured',
    calculationPolicy,
    calculatedAt: new Date().toISOString(),
  };
}
