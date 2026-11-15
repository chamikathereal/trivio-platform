// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/node/src/client.ts
 * @description Main server-side TrivioClient for backend and ERP payment settlement integrations.
 */

import {
  calculateFeeEstimate,
  calculatePaymentSettlementEstimate,
  estimatePercentageFee,
  estimateSettlementDate,
  TrivioValidationError,
  type DynamicFeeEstimateResult,
  type FeeCalculationOptions,
  type FeeEstimateResult,
  type IntegratedSettlementConfig,
  type IntegratedSettlementEstimateResult,
  type IntegratedSettlementOptions,
  type IntegratedTransactionInput,
  type MerchantFeeRule,
  type SettlementCalculationOptions,
  type SettlementCalendar,
  type SettlementEstimateResult,
  type SettlementPolicy,
  type SettlementTransactionInput,
  type TransactionInput,
} from '@trivio.ink/core';
import type { TrivioClientOptions, TrivioLedgerRecord } from './types.js';

export const DEFAULT_BASE_URL = 'https://api.trivio.ink';
export const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Deep freezes an object and its nested properties to guarantee runtime immutability.
 */
function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === 'object') {
    Object.freeze(obj);
    for (const key of Object.keys(obj) as Array<keyof T>) {
      const val = obj[key];
      if (val && typeof val === 'object' && !Object.isFrozen(val)) {
        deepFreeze(val);
      }
    }
  }
  return obj;
}

/**
 * Production-ready server-side Node.js SDK client for Trivio Payment Settlement Intelligence.
 * Operates offline inside developer infrastructure without requiring cloud connectivity.
 */
export class TrivioClient {
  public readonly apiKey?: string;
  public readonly baseUrl: string;
  public readonly timeoutMs: number;
  public readonly version: string = '0.3.0';

  public readonly defaultMerchantId?: string;
  public readonly defaultTerminalId?: string;
  public readonly defaultCurrency?: string;

  private readonly _feeRules: ReadonlyArray<MerchantFeeRule>;
  private readonly _settlementPolicies: ReadonlyArray<SettlementPolicy>;
  private readonly _calendars: ReadonlyArray<SettlementCalendar>;

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

    this.defaultMerchantId = options.defaultMerchantId?.trim();
    this.defaultTerminalId = options.defaultTerminalId?.trim();
    this.defaultCurrency = options.defaultCurrency?.trim().toUpperCase();

    // Deep clone and freeze initial configuration sets to guarantee isolation and immutability
    this._feeRules = options.feeRules
      ? deepFreeze<MerchantFeeRule[]>(JSON.parse(JSON.stringify(options.feeRules)))
      : Object.freeze([]);

    this._settlementPolicies = options.settlementPolicies
      ? deepFreeze<SettlementPolicy[]>(JSON.parse(JSON.stringify(options.settlementPolicies)))
      : Object.freeze([]);

    this._calendars = options.calendars
      ? deepFreeze<SettlementCalendar[]>(JSON.parse(JSON.stringify(options.calendars)))
      : Object.freeze([]);
  }

  /**
   * Whether client credentials have been supplied for future Trivio Cloud connectivity.
   */
  public get isCloudConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  /**
   * Pre-configured merchant fee agreement rules registered on this client instance.
   */
  public get feeRules(): ReadonlyArray<MerchantFeeRule> {
    return this._feeRules;
  }

  /**
   * Pre-configured acquirer settlement policies registered on this client instance.
   */
  public get settlementPolicies(): ReadonlyArray<SettlementPolicy> {
    return this._settlementPolicies;
  }

  /**
   * Pre-configured working day and holiday calendars registered on this client instance.
   */
  public get calendars(): ReadonlyArray<SettlementCalendar> {
    return this._calendars;
  }

  /**
   * Backward-compatible basic percentage fee calculation primitive.
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
   * Uses client pre-configured rules if per-call rules are omitted.
   *
   * @param transaction - Transaction criteria.
   * @param rules - Optional per-call merchant fee agreement rules (overrides client defaults).
   * @param options - Optional calculation overrides.
   * @returns Detailed calculation estimate and ledger breakdown.
   */
  public calculateDynamicFee(
    transaction: TransactionInput,
    rules?: MerchantFeeRule[],
    options?: FeeCalculationOptions
  ): DynamicFeeEstimateResult {
    const effectiveRules = rules && rules.length > 0 ? rules : [...this._feeRules];

    const effectiveTx: TransactionInput = {
      ...transaction,
      merchantId: transaction.merchantId ?? this.defaultMerchantId,
      terminalId: transaction.terminalId ?? this.defaultTerminalId,
      currency: transaction.currency ?? this.defaultCurrency ?? transaction.currency,
    };

    return calculateFeeEstimate(effectiveTx, effectiveRules, options);
  }

  /**
   * Projects expected bank credit settlement date based on acquirer policies, cut-offs, and calendars.
   * Uses client pre-configured policies and calendars if omitted per call.
   *
   * @param transaction - Settlement transaction criteria.
   * @param policies - Optional per-call settlement policies (overrides client defaults).
   * @param calendars - Optional per-call calendars (overrides client defaults).
   * @param options - Optional settlement calculation overrides.
   * @returns Detailed settlement date projection and audit adjustment steps.
   */
  public estimateSettlementDate(
    transaction: SettlementTransactionInput,
    policies?: SettlementPolicy[],
    calendars?: SettlementCalendar[],
    options?: SettlementCalculationOptions
  ): SettlementEstimateResult {
    const effectivePolicies =
      policies && policies.length > 0 ? policies : [...this._settlementPolicies];
    const effectiveCalendars =
      calendars && calendars.length > 0 ? calendars : [...this._calendars];

    const effectiveTx: SettlementTransactionInput = {
      ...transaction,
      merchantId: transaction.merchantId ?? this.defaultMerchantId,
      terminalId: transaction.terminalId ?? this.defaultTerminalId,
      currency: transaction.currency ?? this.defaultCurrency ?? transaction.currency,
    };

    return estimateSettlementDate(
      effectiveTx,
      effectivePolicies,
      effectiveCalendars,
      options
    );
  }

  /**
   * Consolidated payment settlement estimate combining exact MDR fee deductions,
   * net settlement proceeds, and projected bank deposit date in a single call.
   *
   * @param transaction - Unified transaction criteria.
   * @param config - Optional agreement rules, policies, and calendars (overrides client defaults).
   * @param options - Optional calculation overrides.
   * @returns Fully reconciled financial breakdown and deposit date forecast.
   */
  public calculatePaymentSettlementEstimate(
    transaction: IntegratedTransactionInput,
    config?: Partial<IntegratedSettlementConfig>,
    options?: IntegratedSettlementOptions
  ): IntegratedSettlementEstimateResult {
    const effectiveFeeRules =
      config?.feeRules && config.feeRules.length > 0
        ? config.feeRules
        : [...this._feeRules];

    const effectivePolicies =
      config?.settlementPolicies && config.settlementPolicies.length > 0
        ? config.settlementPolicies
        : [...this._settlementPolicies];

    const effectiveCalendars =
      config?.calendars && config.calendars.length > 0
        ? config.calendars
        : [...this._calendars];

    const effectiveTx: IntegratedTransactionInput = {
      ...transaction,
      merchantId: transaction.merchantId ?? this.defaultMerchantId,
      terminalId: transaction.terminalId ?? this.defaultTerminalId,
      currency: transaction.currency ?? this.defaultCurrency ?? transaction.currency,
    };

    return calculatePaymentSettlementEstimate(
      effectiveTx,
      {
        feeRules: effectiveFeeRules,
        settlementPolicies: effectivePolicies,
        calendars: effectiveCalendars,
      },
      options
    );
  }

  /**
   * Convenience alias for calculatePaymentSettlementEstimate.
   */
  public calculateSettlement(
    transaction: IntegratedTransactionInput,
    config?: Partial<IntegratedSettlementConfig>,
    options?: IntegratedSettlementOptions
  ): IntegratedSettlementEstimateResult {
    return this.calculatePaymentSettlementEstimate(transaction, config, options);
  }

  /**
   * Formats an integrated settlement estimate into a standardized, developer-friendly
   * ledger record ready to be saved into developer-owned relational databases or ledgers.
   *
   * @param estimate - Calculated integrated settlement estimate.
   * @param metadata - Optional application metadata to associate with the record.
   * @returns Immutable persistent ledger record.
   */
  public createLedgerRecord(
    estimate: IntegratedSettlementEstimateResult,
    metadata?: Record<string, unknown>
  ): TrivioLedgerRecord {
    const record: TrivioLedgerRecord = {
      transactionId: estimate.transactionId,
      grossMinor: estimate.grossMinor,
      totalFeeMinor: estimate.totalFeeMinor,
      netMinor: estimate.netMinor,
      currency: estimate.currency,
      expectedSettlementDate: estimate.expectedSettlementDate,
      settlementCycle: estimate.settlementCycle,
      appliedFeeRuleId: estimate.appliedFeeRule.id,
      appliedSettlementPolicyId: estimate.appliedSettlementPolicy.policyId,
      calculatedAt: estimate.calculatedAt,
      isEstimated: true,
      status: 'ESTIMATED',
      metadata: metadata ? { ...metadata } : {},
      snapshot: estimate,
    };

    return deepFreeze(record);
  }

  /**
   * Formats a human-readable one-line reconciliation summary of an estimate for logs or consoles.
   */
  public formatLedgerSummary(estimate: IntegratedSettlementEstimateResult): string {
    const txId = estimate.transactionId ? `[Tx: ${estimate.transactionId}] ` : '';
    return (
      `${txId}Gross: ${estimate.currency} ${(estimate.grossMinor / 100).toFixed(2)} | ` +
      `Fee: ${(estimate.totalFeeMinor / 100).toFixed(2)} | ` +
      `Net: ${(estimate.netMinor / 100).toFixed(2)} | ` +
      `Deposit: ${estimate.expectedSettlementDate} (${estimate.settlementCycle})`
    );
  }
}
