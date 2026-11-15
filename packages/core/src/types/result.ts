/**
 * @file packages/core/src/types/result.ts
 * @description Result structures and breakdown models for dynamic fee estimation.
 */

import type { RateSource } from './rule.js';

/**
 * Granular breakdown of intermediate fee calculation components for ERP/POS ledger accounting.
 */
export interface FeeBreakdownDetails {
  /** Gross transaction amount in minor currency units. */
  grossMinor: number;

  /** Applied MDR rate in basis points (1 bps = 0.01%). */
  rateBasisPoints: number;

  /** Unadjusted percentage fee component in minor units (Round-Half-Up). */
  percentageFeeMinor: number;

  /** Fixed per-transaction fee component in minor units. */
  fixedFeeMinor: number;

  /** Base fee before minimum/maximum boundary adjustments (percentageFeeMinor + fixedFeeMinor). */
  baseFeeMinor: number;

  /** Contractual minimum fee threshold, if configured. */
  minFeeMinor: number | null;

  /** Upward adjustment added if base fee was below contractual floor. */
  minAdjustmentMinor: number | null;

  /** Contractual maximum fee cap, if configured. */
  maxFeeMinor: number | null;

  /** Downward adjustment deducted if base fee exceeded contractual ceiling. */
  maxAdjustmentMinor: number | null;

  /** Fee amount after applying minimum/maximum adjustments. */
  adjustedBaseFeeMinor: number;

  /** Total tax or statutory levy on merchant fee in minor units. */
  taxMinor: number;

  /** Itemized tax breakdown if tax adjustment was configured. */
  taxDetails: {
    rateBasisPoints?: number;
    fixedMinor?: number;
    name?: string;
    calculatedMinor: number;
  } | null;

  /** Total fee deductions in minor units (adjustedBaseFeeMinor + taxMinor). */
  totalFeeMinor: number;

  /** Final net merchant settlement amount in minor units (grossMinor - totalFeeMinor). */
  netMinor: number;
}

/**
 * Self-contained immutable snapshot of the matched rule parameters at evaluation time.
 * Protected at runtime via recursive Object.freeze() to prevent in-memory tampering.
 * Enables developers to persist and verify historical calculation fidelity in their own
 * database ledgers even if fee rules are modified, replaced, or deleted in the future.
 *
 * NOTE: In-memory runtime freezing ensures process execution safety, but does not provide
 * permanent persistence or database immutability. Developers and system architects must store
 * these snapshots in their own immutable database ledgers (e.g. PostgreSQL audit tables with
 * append-only permissions) to guarantee historical audit fidelity across system lifecycles.
 */
export interface AppliedRuleSnapshot {
  id: string;
  version: string | number;
  priority: number;
  acquirerId: string;
  currency?: string;
  merchantId?: string;
  terminalId?: string;
  cardScheme?: string;
  cardFundingType?: string;
  cardRegion?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  rateBasisPoints: number;
  fixedFeeMinor: number;
  minFeeMinor?: number;
  maxFeeMinor?: number;
  taxAdjustment?: {
    rateBasisPoints?: number;
    fixedMinor?: number;
    name?: string;
  };
  /**
   * Deterministic rounding and calculation policy used during execution
   * (e.g. 'trivio-mdr-v1-half-up').
   */
  calculationPolicy: string;
}

/**
 * Complete result output for a dynamic fee calculation evaluation.
 */
export interface DynamicFeeEstimateResult {
  /** Gross transaction amount in minor currency units. */
  grossMinor: number;

  /** ISO 4217 three-letter currency code (e.g. 'LKR'). */
  currency: string;

  /** Total calculated merchant fee deduction in minor units. */
  totalFeeMinor: number;

  /** Estimated net settlement credited to merchant ledger (grossMinor - totalFeeMinor). */
  netMinor: number;

  /** Applied MDR fee rate in basis points. */
  appliedRateBasisPoints: number;

  /** Applied fixed fee component in minor units. */
  fixedFeeMinor: number;

  /** Unadjusted percentage fee component in minor units. */
  percentageFeeMinor: number;

  /** Min fee upward adjustment, if applied. */
  minFeeAdjustmentMinor: number | null;

  /** Max fee downward adjustment, if applied. */
  maxFeeAdjustmentMinor: number | null;

  /** Total tax or levy added to merchant fee in minor units. */
  taxMinor: number;

  /** Identification metadata and immutable snapshot of the matched agreement rule. */
  appliedRule: {
    id: string;
    version: string | number;
    priority: number;
    description?: string;
    snapshot: AppliedRuleSnapshot;
  };

  /** Detailed arithmetic reconciliation breakdown. */
  breakdown: FeeBreakdownDetails;

  /**
   * Explicit status boolean confirming this value is an authorization-time estimate,
   * NOT a bank-confirmed settlement credit.
   */
  isEstimate: true;

  /** Categorization of the rate agreement source. */
  rateSource: RateSource;

  /** Unique identifier for the calculation mathematical standard and rounding policy. */
  calculationPolicy: string;

  /** UTC ISO 8601 timestamp when this calculation was generated. */
  calculatedAt: string;
}

/**
 * Execution options passed to the calculation engine.
 */
export interface FeeCalculationOptions {
  /**
   * Whether to allow fee deductions that exceed gross amount (resulting in negative net settlement).
   * Defaults to false (throws NegativeNetSettlementError).
   */
  allowNegativeNetSettlement?: boolean;

  /**
   * Custom policy identifier label for audit logging.
   */
  calculationPolicy?: string;
}
