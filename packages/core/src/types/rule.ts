// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/types/rule.ts
 * @description Types defining merchant fee agreements, rate structures, and rule models.
 */

import type { CardScheme, CardFundingType, CardRegion } from './transaction.js';

/**
 * Classification of the rate authority or origin source.
 */
export type RateSource =
  | 'merchant_configured'
  | 'published_schedule'
  | 'contract_tier';

/**
 * Extensible configuration for tax or regulatory levies applied on merchant processing fees.
 * All tax calculations in Trivio are strictly caller-configured and never hardcoded.
 */
export interface TaxAdjustmentConfig {
  /**
   * Percentage tax/levy rate in integer basis points applied on the base processing fee
   * (e.g. 1800 for 18.00% VAT).
   */
  rateBasisPoints?: number;

  /**
   * Fixed fee tax/levy in minor currency units (e.g. 50 for 0.50 stamp duty).
   */
  fixedMinor?: number;

  /**
   * Formal name or code of the tax/levy (e.g. 'VAT', 'SSCL', 'GST').
   */
  name?: string;

  /**
   * Description or regulatory citation for audit trails.
   */
  description?: string;
}

/**
 * Mathematical fee composition for an eligible transaction.
 */
export interface FeeStructure {
  /**
   * Merchant Discount Rate (MDR) in integer basis points (0 to 10,000, where 100 bps = 1.00%).
   */
  rateBasisPoints: number;

  /**
   * Fixed processing fee per transaction in minor units (e.g. 2,500 for 25.00).
   * Defaults to 0 if omitted.
   */
  fixedFeeMinor?: number;

  /**
   * Minimum fee threshold (floor) in minor units applied to base fee before taxes.
   */
  minFeeMinor?: number;

  /**
   * Maximum fee cap (ceiling) in minor units applied to base fee before taxes.
   */
  maxFeeMinor?: number;

  /**
   * Optional configuration-driven tax or statutory levy on the merchant fee.
   */
  taxAdjustment?: TaxAdjustmentConfig;
}

/**
 * A declarative merchant fee agreement rule against which transactions are evaluated.
 */
export interface MerchantFeeRule {
  /**
   * Unique identifier for the fee rule (e.g. 'rule_boc_pos_visa_debit_v1').
   */
  id: string;

  /**
   * Version identifier for historical reproducibility and audit trails (e.g. 1 or '1.0.0').
   */
  version: string | number;

  /**
   * Acquirer or payment gateway identifier this rule applies to (e.g. 'acq_boc', 'stripe').
   */
  acquirerId: string;

  /**
   * Optional currency constraint (e.g. 'LKR'). If omitted, matches any currency supported by acquirer.
   */
  currency?: string;

  /**
   * Optional merchant scope. If omitted or '*', rule matches any merchant under the acquirer.
   */
  merchantId?: string;

  /**
   * Optional terminal scope for in-store POS machines with specific contractual rates.
   */
  terminalId?: string;

  /**
   * Card scheme criteria (e.g. 'visa', 'mastercard'). If omitted, matches all schemes.
   */
  cardScheme?: CardScheme;

  /**
   * Card funding criteria (e.g. 'credit', 'debit'). If omitted, matches all funding types.
   */
  cardFundingType?: CardFundingType;

  /**
   * Geographical origin criteria (e.g. 'domestic', 'international'). If omitted, matches both.
   */
  cardRegion?: CardRegion;

  /**
   * Start timestamp of rule validity (inclusive UTC comparison).
   */
  effectiveFrom: Date | string;

  /**
   * End timestamp of rule validity (exclusive UTC comparison).
   * If omitted, rule remains active indefinitely.
   */
  effectiveTo?: Date | string;

  /**
   * Explicit priority rank for conflict resolution. Higher values take precedence. Defaults to 0.
   */
  priority?: number;

  /**
   * Fee calculation parameters to apply when rule is selected.
   */
  feeStructure: FeeStructure;

  /**
   * Rate source classification. Defaults to 'merchant_configured'.
   */
  rateSource?: RateSource;

  /**
   * Human-readable description (e.g. '2026 Commercial Bank Merchant Agreement — Retail POS').
   */
  description?: string;
}
