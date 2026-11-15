// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/node/src/types.ts
 * @description Type definitions for the Trivio Node.js SDK client.
 */

import type {
  IntegratedSettlementEstimateResult,
  MerchantFeeRule,
  SettlementCalendar,
  SettlementPolicy,
} from '@trivio.ink/core';

/**
 * Configuration options for initializing the Trivio Node.js client.
 */
export interface TrivioClientOptions {
  /**
   * Optional Trivio Cloud API key (for future hosted cloud services).
   * Offline calculations operate deterministically without credentials.
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

  /**
   * Optional default merchant identifier attached to calculations when omitted per call.
   */
  defaultMerchantId?: string;

  /**
   * Optional default POS terminal identifier attached to calculations when omitted per call.
   */
  defaultTerminalId?: string;

  /**
   * Optional default ISO 4217 currency code attached to calculations when omitted per call.
   */
  defaultCurrency?: string;

  /**
   * Pre-configured merchant fee agreement rules.
   * Registered rules are used by default if per-call rules are omitted.
   */
  feeRules?: MerchantFeeRule[];

  /**
   * Pre-configured acquirer settlement policies.
   * Registered policies are used by default if per-call policies are omitted.
   */
  settlementPolicies?: SettlementPolicy[];

  /**
   * Pre-configured working day and holiday calendars.
   * Registered calendars are used by default if per-call calendars are omitted.
   */
  calendars?: SettlementCalendar[];
}

/**
 * Standardized persistent ledger record model for developer-owned transactional storage.
 */
export interface TrivioLedgerRecord {
  /** Unique transaction identifier if available */
  transactionId?: string;
  /** Gross transaction amount in integer minor units */
  grossMinor: number;
  /** Total calculated merchant processing fee deduction in minor units */
  totalFeeMinor: number;
  /** Net merchant settlement amount in minor units */
  netMinor: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Expected bank credit deposit date ('YYYY-MM-DD') */
  expectedSettlementDate: string;
  /** Canonical settlement cycle designation (e.g. 'T+0', 'T+1', 'T+2') */
  settlementCycle: string;
  /** ID of the applied fee agreement rule */
  appliedFeeRuleId: string;
  /** ID of the applied settlement policy */
  appliedSettlementPolicyId: string;
  /** ISO timestamp when calculation was generated */
  calculatedAt: string;
  /** Explicit estimate status */
  isEstimated: true;
  /** Settlement status indicator */
  status: 'ESTIMATED';
  /** Caller-supplied metadata */
  metadata: Record<string, unknown>;
  /** Complete immutable calculation snapshot */
  snapshot: IntegratedSettlementEstimateResult;
}
