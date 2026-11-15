/**
 * @file packages/node/tests/index.test.ts
 * @description Comprehensive automated tests for Trivio Node.js SDK (@trivio.ink/node).
 */

import { describe, expect, it } from 'vitest';
import { runErpIntegrationExample } from '../examples/erp-settlement.js';
import {
  calculateFeeEstimate,
  calculatePaymentSettlementEstimate,
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  estimatePercentageFee,
  estimateSettlementDate,
  RuleNotFoundError,
  SettlementCalendarNotFoundError,
  SettlementPolicyNotFoundError,
  TrivioClient,
  TrivioValidationError,
  type IntegratedTransactionInput,
  type MerchantFeeRule,
  type SettlementCalendar,
  type SettlementPolicy,
  type SettlementTransactionInput,
  type TransactionInput,
} from '../src/index.js';

describe('TrivioClient (@trivio.ink/node)', () => {
  const standardFeeRule: MerchantFeeRule = {
    id: 'rule_boc_250',
    version: '1.0.0',
    acquirerId: 'ACQ_BOC',
    effectiveFrom: '2026-01-01T00:00:00Z',
    priority: 0,
    feeStructure: { rateBasisPoints: 250, fixedFeeMinor: 0 },
    rateSource: 'merchant_configured',
  };

  const standardSettlementPolicy: SettlementPolicy = {
    id: 'pol_boc_t1',
    version: '1.0.0',
    acquirerId: 'ACQ_BOC',
    effectiveFrom: '2026-01-01',
    priority: 0,
    cycleLength: 1,
    cycleUnit: 'business_days',
    cutOffTime: '17:00',
    timeZone: 'Asia/Colombo',
    calendarId: 'cal_colombo',
    nonWorkingDayConvention: 'following_business_day',
  };

  const standardCalendar: SettlementCalendar = {
    id: 'cal_colombo',
    version: '2026.1',
    timeZone: 'Asia/Colombo',
    workingDays: [1, 2, 3, 4, 5],
    holidays: [],
  };

  // -------------------------------------------------------------------------
  // 1. Initialization & Configuration
  // -------------------------------------------------------------------------
  describe('Initialization and Configuration', () => {
    it('initializes with default options in offline mode', () => {
      const client = new TrivioClient();

      expect(client.apiKey).toBeUndefined();
      expect(client.baseUrl).toBe(DEFAULT_BASE_URL);
      expect(client.timeoutMs).toBe(DEFAULT_TIMEOUT_MS);
      expect(client.isCloudConfigured).toBe(false);
      expect(client.version).toBe('0.3.0');
      expect(client.feeRules.length).toBe(0);
      expect(client.settlementPolicies.length).toBe(0);
      expect(client.calendars.length).toBe(0);
    });

    it('initializes with pre-configured rules, policies, and defaults', () => {
      const client = new TrivioClient({
        defaultMerchantId: 'MCH_RETAIL',
        defaultTerminalId: 'POS_01',
        defaultCurrency: 'LKR',
        feeRules: [standardFeeRule],
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });

      expect(client.defaultMerchantId).toBe('MCH_RETAIL');
      expect(client.defaultTerminalId).toBe('POS_01');
      expect(client.defaultCurrency).toBe('LKR');
      expect(client.feeRules.length).toBe(1);
      expect(client.settlementPolicies.length).toBe(1);
      expect(client.calendars.length).toBe(1);
    });

    it('guarantees immutability of client-registered configuration (caller mutation protection)', () => {
      const mutableRules = [{ ...standardFeeRule }];
      const client = new TrivioClient({ feeRules: mutableRules });

      // Mutate original array and object
      mutableRules.push({
        ...standardFeeRule,
        id: 'rule_mutated',
      });
      // Client configuration remains unchanged
      expect(client.feeRules.length).toBe(1);
      expect(client.feeRules[0]?.id).toBe('rule_boc_250');
      expect(Object.isFrozen(client.feeRules)).toBe(true);
    });

    it('validates options strictly', () => {
      expect(() => new TrivioClient({ timeoutMs: -100 })).toThrow(TrivioValidationError);
      expect(() => new TrivioClient({ timeoutMs: 0 })).toThrow(TrivioValidationError);
      // @ts-expect-error testing runtime validation
      expect(() => new TrivioClient({ timeoutMs: '5000' })).toThrow(TrivioValidationError);
      expect(() => new TrivioClient({ baseUrl: '   ' })).toThrow(TrivioValidationError);
      // @ts-expect-error testing runtime validation
      expect(() => new TrivioClient({ baseUrl: 12345 })).toThrow(TrivioValidationError);
      // @ts-expect-error testing runtime validation
      expect(() => new TrivioClient({ apiKey: 12345 })).toThrow(TrivioValidationError);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Calculation Delegation & Default Resolution
  // -------------------------------------------------------------------------
  describe('Calculation Delegations', () => {
    it('executes calculateFee (Stage 1 primitive)', () => {
      const client = new TrivioClient();
      const res = client.calculateFee(1_000_000, 250);
      expect(res).toEqual({
        grossMinor: 1_000_000,
        feeMinor: 25_000,
        netMinor: 975_000,
        rateBasisPoints: 250,
      });
    });

    it('executes calculateDynamicFee using client pre-configured rules', () => {
      const client = new TrivioClient({
        feeRules: [standardFeeRule],
      });

      const tx: TransactionInput = {
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionDate: '2026-11-13T10:00:00Z',
        acquirerId: 'ACQ_BOC',
      };

      const result = client.calculateDynamicFee(tx);
      expect(result.grossMinor).toBe(1_000_000);
      expect(result.totalFeeMinor).toBe(25_000);
      expect(result.netMinor).toBe(975_000);
    });

    it('allows per-call rules to override client pre-configured rules in calculateDynamicFee', () => {
      const client = new TrivioClient({
        feeRules: [standardFeeRule], // 2.50%
      });

      const customRule: MerchantFeeRule = {
        ...standardFeeRule,
        id: 'rule_custom_100',
        feeStructure: { rateBasisPoints: 100, fixedFeeMinor: 0 }, // 1.00%
      };

      const tx: TransactionInput = {
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionDate: '2026-11-13T10:00:00Z',
        acquirerId: 'ACQ_BOC',
      };

      const result = client.calculateDynamicFee(tx, [customRule]);
      expect(result.appliedRateBasisPoints).toBe(100);
      expect(result.totalFeeMinor).toBe(10_000);
    });

    it('executes estimateSettlementDate using client pre-configured policies and calendars', () => {
      const client = new TrivioClient({
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30', // Friday before cut-off
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = client.estimateSettlementDate(tx);
      expect(result.anchorProcessingDate).toBe('2026-11-13');
      expect(result.expectedSettlementDate).toBe('2026-11-16'); // Monday
      expect(result.settlementCycle).toBe('T+1');
    });

    it('executes calculateSettlement / calculatePaymentSettlementEstimate consolidating fees and dates', () => {
      const client = new TrivioClient({
        feeRules: [standardFeeRule],
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });

      const tx: IntegratedTransactionInput = {
        id: 'tx_node_001',
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const result = client.calculateSettlement(tx);
      expect(result.grossMinor).toBe(1_000_000);
      expect(result.totalFeeMinor).toBe(25_000);
      expect(result.netMinor).toBe(975_000);
      expect(result.expectedSettlementDate).toBe('2026-11-16');
      expect(result.settlementCycle).toBe('T+1');
      expect(result.status).toBe('ESTIMATED');
    });

    it('applies client default merchantId, terminalId, and currency when omitted on transaction', () => {
      const client = new TrivioClient({
        defaultMerchantId: 'MCH_DEFAULT',
        defaultTerminalId: 'POS_DEFAULT',
        defaultCurrency: 'LKR',
        feeRules: [standardFeeRule],
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });

      const tx: IntegratedTransactionInput = {
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const result = client.calculateSettlement(tx);
      expect(result.merchantId).toBe('MCH_DEFAULT');
      expect(result.terminalId).toBe('POS_DEFAULT');
      expect(result.currency).toBe('LKR');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Multi-Merchant Isolation
  // -------------------------------------------------------------------------
  describe('Multi-Merchant Isolation', () => {
    it('maintains strict isolation between multiple client instances with different merchant rates', () => {
      const clientStoreA = new TrivioClient({
        defaultMerchantId: 'STORE_A',
        feeRules: [
          {
            ...standardFeeRule,
            feeStructure: { rateBasisPoints: 200, fixedFeeMinor: 0 }, // 2.00%
          },
        ],
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });

      const clientStoreB = new TrivioClient({
        defaultMerchantId: 'STORE_B',
        feeRules: [
          {
            ...standardFeeRule,
            feeStructure: { rateBasisPoints: 300, fixedFeeMinor: 0 }, // 3.00%
          },
        ],
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });

      const txA: IntegratedTransactionInput = {
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const txB: IntegratedTransactionInput = {
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const resA = clientStoreA.calculateSettlement(txA);
      const resB = clientStoreB.calculateSettlement(txB);

      expect(resA.appliedRateBasisPoints).toBe(200);
      expect(resA.totalFeeMinor).toBe(20_000);
      expect(resA.merchantId).toBe('STORE_A');

      expect(resB.appliedRateBasisPoints).toBe(300);
      expect(resB.totalFeeMinor).toBe(30_000);
      expect(resB.merchantId).toBe('STORE_B');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Ledger Formatting & Persistence Helpers
  // -------------------------------------------------------------------------
  describe('Ledger Formatting & Persistence Helpers', () => {
    it('creates standardized, deep-frozen persistent ledger records', () => {
      const client = new TrivioClient({
        feeRules: [standardFeeRule],
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });

      const tx: IntegratedTransactionInput = {
        id: 'tx_rec_101',
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const estimate = client.calculateSettlement(tx);
      const record = client.createLedgerRecord(estimate, { orderId: 'ORD-999' });

      expect(record.transactionId).toBe('tx_rec_101');
      expect(record.grossMinor).toBe(1_000_000);
      expect(record.totalFeeMinor).toBe(25_000);
      expect(record.netMinor).toBe(975_000);
      expect(record.expectedSettlementDate).toBe('2026-11-16');
      expect(record.metadata.orderId).toBe('ORD-999');
      expect(Object.isFrozen(record)).toBe(true);

      // JSON serializable
      const jsonStr = JSON.stringify(record);
      expect(JSON.parse(jsonStr).grossMinor).toBe(1_000_000);
    });

    it('formats human-readable ledger summary string', () => {
      const client = new TrivioClient({
        feeRules: [standardFeeRule],
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });

      const tx: IntegratedTransactionInput = {
        id: 'tx_log_101',
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const estimate = client.calculateSettlement(tx);
      const summary = client.formatLedgerSummary(estimate);

      expect(summary).toContain('Tx: tx_log_101');
      expect(summary).toContain('LKR 10000.00');
      expect(summary).toContain('250.00');
      expect(summary).toContain('9750.00');
      expect(summary).toContain('2026-11-16 (T+1)');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Error Propagation
  // -------------------------------------------------------------------------
  describe('Error Propagation', () => {
    it('propagates RuleNotFoundError when no matching fee rule is found', () => {
      const client = new TrivioClient({
        feeRules: [standardFeeRule],
      });
      const tx: TransactionInput = {
        grossMinor: 100_000,
        currency: 'LKR',
        transactionDate: '2026-11-13T10:00:00Z',
        acquirerId: 'ACQ_UNKNOWN',
      };

      expect(() => client.calculateDynamicFee(tx)).toThrow(RuleNotFoundError);
    });

    it('propagates SettlementPolicyNotFoundError when no settlement policy matches', () => {
      const client = new TrivioClient({
        settlementPolicies: [standardSettlementPolicy],
        calendars: [standardCalendar],
      });
      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_UNKNOWN',
        currency: 'LKR',
      };

      expect(() => client.estimateSettlementDate(tx)).toThrow(
        SettlementPolicyNotFoundError
      );
    });

    it('propagates SettlementCalendarNotFoundError when policy references missing calendar', () => {
      const client = new TrivioClient({
        settlementPolicies: [
          { ...standardSettlementPolicy, calendarId: 'missing-calendar' },
        ],
        calendars: [standardCalendar],
      });

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      expect(() => client.estimateSettlementDate(tx)).toThrow(
        SettlementCalendarNotFoundError
      );
    });
  });

  // -------------------------------------------------------------------------
  // 6. Direct Re-Exports from Core
  // -------------------------------------------------------------------------
  describe('Core Primitives Direct Re-Exports', () => {
    it('re-exports calculation functions and types directly from core', () => {
      expect(typeof estimatePercentageFee).toBe('function');
      expect(typeof calculateFeeEstimate).toBe('function');
      expect(typeof estimateSettlementDate).toBe('function');
      expect(typeof calculatePaymentSettlementEstimate).toBe('function');
    });
  });

  // -------------------------------------------------------------------------
  // 7. Practical ERP Integration Example Execution
  // -------------------------------------------------------------------------
  describe('Practical ERP Integration Example', () => {
    it('executes the practical ERP integration example workflow with exact reference numbers', () => {
      const output = runErpIntegrationExample();

      expect(output.grossMinor).toBe(1_000_000);
      expect(output.totalFeeMinor).toBe(25_000);
      expect(output.netMinor).toBe(975_000);
      expect(output.expectedSettlementDate).toBe('2026-11-16');
    });
  });
});
