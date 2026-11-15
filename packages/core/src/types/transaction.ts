/**
 * @file packages/core/src/types/transaction.ts
 * @description Type definitions for payment transaction inputs.
 */

/**
 * Recognized major card payment schemes.
 * Supports string literals for extension without breaking union semantics.
 */
export type CardScheme =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'jcb'
  | 'unionpay'
  | 'diners'
  | (string & {});

/**
 * Funding classification of the payment card.
 */
export type CardFundingType = 'credit' | 'debit' | 'prepaid' | (string & {});

/**
 * Geographical classification relative to the merchant acquirer jurisdiction.
 */
export type CardRegion = 'domestic' | 'international' | (string & {});

/**
 * Merchant transaction context required for dynamic fee calculation.
 * Sensitive payment credentials (PAN, CVV, PIN) MUST NEVER be passed into Trivio.
 */
export interface TransactionInput {
  /**
   * Gross transaction amount in integer minor currency units (e.g. 1,000,000 for 10,000.00).
   * Must be a non-negative safe integer.
   */
  grossMinor: number;

  /**
   * ISO 4217 three-letter currency code (e.g. 'LKR', 'USD', 'EUR').
   * Case-insensitive in input, normalized to uppercase.
   */
  currency: string;

  /**
   * Timestamp of transaction authorization (Date object or ISO 8601 string).
   */
  transactionDate: Date | string;

  /**
   * Identifier of the acquiring bank or payment gateway provider (e.g. 'acq_boc', 'acq_hnb', 'stripe').
   */
  acquirerId: string;

  /**
   * Optional merchant identifier for multi-tenant ERP or merchant-specific rate agreements.
   */
  merchantId?: string;

  /**
   * Optional POS terminal identifier for terminal-specific rate rules.
   */
  terminalId?: string;

  /**
   * Card payment network/scheme, if identified.
   */
  cardScheme?: CardScheme;

  /**
   * Card funding mechanism (credit, debit, prepaid), if identified.
   */
  cardFundingType?: CardFundingType;

  /**
   * Geographical origin classification (domestic, international), if identified.
   */
  cardRegion?: CardRegion;

  /**
   * Optional arbitrary caller metadata for tracking or transaction reconciliation.
   */
  metadata?: Record<string, unknown>;
}
