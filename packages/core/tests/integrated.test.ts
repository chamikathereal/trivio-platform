/**
 * @file packages/core/tests/integrated.test.ts
 * @description Comprehensive automated tests for Stage 2C Integrated Merchant Fee & Settlement Engine.
 */

import { describe, expect, it } from 'vitest';
import {
  calculatePaymentSettlementEstimate,
  DEFAULT_INTEGRATED_CALCULATION_VERSION,
  NegativeNetSettlementError,
  RuleConflictError,
  RuleNotFoundError,
  SettlementCalendarNotFoundError,
  SettlementPolicyConflictError,
  SettlementPolicyNotFoundError,
  SettlementValidationError,
  TrivioValidationError,
  type IntegratedSettlementConfig,
  type IntegratedTransactionInput,
  type MerchantFeeRule,
  type SettlementCalendar,
  type SettlementPolicy,
} from '../src/index.js';

describe('Stage 2C: Integrated Merchant Fee & Settlement Intelligence Engine', () => {
  // Reference Calendar: Monday to Friday in Asia/Colombo
  const colomboCalendar: SettlementCalendar = {
    id: 'cal-colombo-retail',
    version: '1.0.0',
    timeZone: 'Asia/Colombo',
    workingDays: [1, 2, 3, 4, 5],
    holidays: [],
  };

  // Reference Fee Rule: 2.50% MDR (250 bps)
  const standardFeeRule: MerchantFeeRule = {
    id: 'rule-boc-mdr-250',
    version: '1.0.0',
    acquirerId: 'ACQ_BOC',
    effectiveFrom: '2026-01-01T00:00:00Z',
    priority: 0,
    feeStructure: {
      rateBasisPoints: 250, // 2.50%
      fixedFeeMinor: 0,
    },
    rateSource: 'merchant_configured',
  };

  // Reference Settlement Policy: T+1 business days, 17:00 cut-off
  const standardSettlementPolicy: SettlementPolicy = {
    id: 'pol-boc-t1',
    version: '1.0.0',
    acquirerId: 'ACQ_BOC',
    effectiveFrom: '2026-01-01',
    priority: 0,
    cycleLength: 1,
    cycleUnit: 'business_days',
    cutOffTime: '17:00',
    timeZone: 'Asia/Colombo',
    calendarId: 'cal-colombo-retail',
    nonWorkingDayConvention: 'following_business_day',
  };

  const standardConfig: IntegratedSettlementConfig = {
    feeRules: [standardFeeRule],
    settlementPolicies: [standardSettlementPolicy],
    calendars: [colomboCalendar],
  };

  // -------------------------------------------------------------------------
  // 1. Reference Integration Example (Prompt Section 6)
  // -------------------------------------------------------------------------
  describe('Prompt Reference Integration Scenario (Section 6)', () => {
    it('calculates exact LKR 10,000.00 sale at 10:00 (before cut-off) -> 250 fee, 9,750 net, settles Monday', () => {
      const tx: IntegratedTransactionInput = {
        id: 'tx-ref-001',
        grossMinor: 1_000_000, // LKR 10,000.00
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30', // Friday 10:00 local
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(tx, standardConfig);

      // Financial reconciliation
      expect(result.grossMinor).toBe(1_000_000);
      expect(result.percentageFeeMinor).toBe(25_000); // LKR 250.00
      expect(result.fixedFeeMinor).toBe(0);
      expect(result.totalFeeMinor).toBe(25_000);
      expect(result.netMinor).toBe(975_000); // LKR 9,750.00
      expect(result.appliedRateBasisPoints).toBe(250);
      expect(result.grossMinor).toBe(result.totalFeeMinor + result.netMinor);

      // Settlement date projection
      expect(result.localTransactionDate).toBe('2026-11-13');
      expect(result.localTransactionTime).toBe('10:00:00');
      expect(result.isPastCutOff).toBe(false);
      expect(result.anchorProcessingDate).toBe('2026-11-13'); // Friday
      expect(result.expectedSettlementDate).toBe('2026-11-16'); // Monday (T+1 business day)
      expect(result.settlementCycle).toBe('T+1');
      expect(result.daysDeferred).toBe(3);

      // Status and metadata
      expect(result.isEstimated).toBe(true);
      expect(result.status).toBe('ESTIMATED');
      expect(result.calculationVersion).toBe(DEFAULT_INTEGRATED_CALCULATION_VERSION);
    });

    it('calculates the same transaction at 18:00 (after cut-off) -> rolls anchor to Monday, settles Tuesday', () => {
      const tx: IntegratedTransactionInput = {
        id: 'tx-ref-002',
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T18:00:00+05:30', // Friday 18:00 local
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(tx, standardConfig);

      // Financial breakdown remains identical
      expect(result.grossMinor).toBe(1_000_000);
      expect(result.totalFeeMinor).toBe(25_000);
      expect(result.netMinor).toBe(975_000);

      // Settlement date rolls forward
      expect(result.isPastCutOff).toBe(true);
      expect(result.anchorProcessingDate).toBe('2026-11-16'); // Monday
      expect(result.expectedSettlementDate).toBe('2026-11-17'); // Tuesday
      expect(result.daysDeferred).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Both Calling Signatures (Object vs Positional Array)
  // -------------------------------------------------------------------------
  describe('Calling Signatures', () => {
    const tx: IntegratedTransactionInput = {
      id: 'tx-sig-test',
      grossMinor: 500_000,
      currency: 'LKR',
      transactionTime: '2026-11-13T10:00:00+05:30',
      acquirerId: 'ACQ_BOC',
    };

    it('accepts config object signature: (tx, config, options)', () => {
      const res = calculatePaymentSettlementEstimate(tx, standardConfig, {
        calculationVersion: 'custom-v1',
      });
      expect(res.grossMinor).toBe(500_000);
      expect(res.calculationVersion).toBe('custom-v1');
    });

    it('accepts positional arguments signature: (tx, feeRules, settlementPolicies, calendars, options)', () => {
      const res = calculatePaymentSettlementEstimate(
        tx,
        [standardFeeRule],
        [standardSettlementPolicy],
        [colomboCalendar],
        { calculationVersion: 'custom-v2' }
      );
      expect(res.grossMinor).toBe(500_000);
      expect(res.calculationVersion).toBe('custom-v2');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Diverse Commercial Fee Structures + Settlement Cycles
  // -------------------------------------------------------------------------
  describe('Commercial Scenarios & Reconciliation Invariants', () => {
    it('models fixed transaction fee + T+2 business days', () => {
      const fixedFeeRule: MerchantFeeRule = {
        ...standardFeeRule,
        id: 'rule-fixed-fee',
        feeStructure: {
          rateBasisPoints: 0,
          fixedFeeMinor: 3_500, // LKR 35.00 fixed
        },
      };

      const policyT2: SettlementPolicy = {
        ...standardSettlementPolicy,
        id: 'pol-t2',
        cycleLength: 2,
      };

      const tx: IntegratedTransactionInput = {
        grossMinor: 200_000, // LKR 2,000.00
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30', // Friday before cut-off
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(
        tx,
        [fixedFeeRule],
        [policyT2],
        [colomboCalendar]
      );

      expect(result.fixedFeeMinor).toBe(3_500);
      expect(result.percentageFeeMinor).toBe(0);
      expect(result.totalFeeMinor).toBe(3_500);
      expect(result.netMinor).toBe(196_500);
      expect(result.grossMinor).toBe(result.totalFeeMinor + result.netMinor);

      // Friday + 2 business days -> Tuesday 17 Nov
      expect(result.expectedSettlementDate).toBe('2026-11-17');
    });

    it('models blended fee (percentage + fixed) + holiday rollover', () => {
      const blendedFeeRule: MerchantFeeRule = {
        ...standardFeeRule,
        id: 'rule-blended',
        feeStructure: {
          rateBasisPoints: 200, // 2.00%
          fixedFeeMinor: 1_000, // LKR 10.00
        },
      };

      const holidayCalendar: SettlementCalendar = {
        ...colomboCalendar,
        id: 'cal-with-holiday',
        holidays: ['2026-11-16'], // Monday is holiday
      };

      const policyWithHoliday: SettlementPolicy = {
        ...standardSettlementPolicy,
        calendarId: 'cal-with-holiday',
      };

      const tx: IntegratedTransactionInput = {
        grossMinor: 1_000_000, // LKR 10,000.00
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30', // Friday
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(
        tx,
        [blendedFeeRule],
        [policyWithHoliday],
        [holidayCalendar]
      );

      // 2% of 10,000 = 200.00 + 10.00 fixed = 210.00
      expect(result.percentageFeeMinor).toBe(20_000);
      expect(result.fixedFeeMinor).toBe(1_000);
      expect(result.totalFeeMinor).toBe(21_000);
      expect(result.netMinor).toBe(979_000);
      expect(result.grossMinor).toBe(result.totalFeeMinor + result.netMinor);

      // Friday + 1 business day skipping Monday holiday -> Tuesday 17 Nov
      expect(result.expectedSettlementDate).toBe('2026-11-17');
    });

    it('models contractual minFee floor and maxFee ceiling', () => {
      const minFeeRule: MerchantFeeRule = {
        ...standardFeeRule,
        id: 'rule-min-fee',
        feeStructure: {
          rateBasisPoints: 100, // 1%
          fixedFeeMinor: 0,
          minFeeMinor: 5_000, // minimum LKR 50.00
        },
      };

      // 1% of LKR 1,000 (100,000) is LKR 10.00 (1,000), but floor is LKR 50.00 (5,000)
      const tx: IntegratedTransactionInput = {
        grossMinor: 100_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(
        tx,
        [minFeeRule],
        [standardSettlementPolicy],
        [colomboCalendar]
      );

      expect(result.percentageFeeMinor).toBe(1_000);
      expect(result.minFeeAdjustmentMinor).toBe(4_000);
      expect(result.totalFeeMinor).toBe(5_000);
      expect(result.netMinor).toBe(95_000);
      expect(result.grossMinor).toBe(result.totalFeeMinor + result.netMinor);
    });

    it('models calendar-day settlement with weekend rollover', () => {
      const calendarDayPolicy: SettlementPolicy = {
        ...standardSettlementPolicy,
        id: 'pol-calendar-days',
        cycleLength: 2,
        cycleUnit: 'calendar_days',
        nonWorkingDayConvention: 'following_business_day',
      };

      const tx: IntegratedTransactionInput = {
        grossMinor: 100_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30', // Friday
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(
        tx,
        [standardFeeRule],
        [calendarDayPolicy],
        [colomboCalendar]
      );

      // Friday + 2 calendar days = Sunday 15 Nov -> adjusted to Monday 16 Nov
      expect(result.expectedSettlementDate).toBe('2026-11-16');
      expect(result.cycleUnit).toBe('calendar_days');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Scoping & Specificity Matching
  // -------------------------------------------------------------------------
  describe('Scoping & Specificity Alignment', () => {
    it('applies terminal-specific fee rule and terminal-specific settlement policy simultaneously', () => {
      const genericFee: MerchantFeeRule = {
        ...standardFeeRule,
        id: 'fee-generic',
        feeStructure: { rateBasisPoints: 300, fixedFeeMinor: 0 },
      };

      const terminalFee: MerchantFeeRule = {
        ...standardFeeRule,
        id: 'fee-terminal',
        terminalId: 'POS_TERMINAL_99',
        feeStructure: { rateBasisPoints: 150, fixedFeeMinor: 0 },
      };

      const genericPolicy: SettlementPolicy = {
        ...standardSettlementPolicy,
        id: 'pol-generic',
        cycleLength: 3,
      };

      const terminalPolicy: SettlementPolicy = {
        ...standardSettlementPolicy,
        id: 'pol-terminal',
        terminalId: 'POS_TERMINAL_99',
        cycleLength: 0, // T+0 for this terminal
      };

      const tx: IntegratedTransactionInput = {
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        terminalId: 'POS_TERMINAL_99',
      };

      const result = calculatePaymentSettlementEstimate(
        tx,
        [genericFee, terminalFee],
        [genericPolicy, terminalPolicy],
        [colomboCalendar]
      );

      // Successfully resolved terminal-specific rules on both sides
      expect(result.appliedFeeRule.id).toBe('fee-terminal');
      expect(result.appliedRateBasisPoints).toBe(150);
      expect(result.appliedSettlementPolicy.policyId).toBe('pol-terminal');
      expect(result.settlementCycle).toBe('T+0');
      expect(result.expectedSettlementDate).toBe('2026-11-13'); // Friday same day
    });
  });

  // -------------------------------------------------------------------------
  // 5. Error Handling & Validation
  // -------------------------------------------------------------------------
  describe('Error Handling & Boundary Protection', () => {
    it('throws RuleNotFoundError when no matching fee rule exists', () => {
      const tx: IntegratedTransactionInput = {
        grossMinor: 100_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_NON_EXISTENT',
      };

      expect(() =>
        calculatePaymentSettlementEstimate(tx, standardConfig)
      ).toThrow(RuleNotFoundError);
    });

    it('throws SettlementPolicyNotFoundError when no matching settlement policy exists', () => {
      const feeRuleOther: MerchantFeeRule = {
        ...standardFeeRule,
        acquirerId: 'ACQ_FOREIGN',
      };

      const tx: IntegratedTransactionInput = {
        grossMinor: 100_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_FOREIGN',
      };

      expect(() =>
        calculatePaymentSettlementEstimate(
          tx,
          [feeRuleOther],
          [standardSettlementPolicy],
          [colomboCalendar]
        )
      ).toThrow(SettlementPolicyNotFoundError);
    });

    it('throws SettlementCalendarNotFoundError when matched policy references missing calendar', () => {
      const brokenPolicy: SettlementPolicy = {
        ...standardSettlementPolicy,
        calendarId: 'non-existent-calendar-id',
      };

      const tx: IntegratedTransactionInput = {
        grossMinor: 100_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      expect(() =>
        calculatePaymentSettlementEstimate(
          tx,
          [standardFeeRule],
          [brokenPolicy],
          [colomboCalendar]
        )
      ).toThrow(SettlementCalendarNotFoundError);
    });

    it('throws NegativeNetSettlementError when fee exceeds gross without override', () => {
      const expensiveRule: MerchantFeeRule = {
        ...standardFeeRule,
        feeStructure: {
          rateBasisPoints: 0,
          fixedFeeMinor: 20_000, // LKR 200.00
        },
      };

      const tx: IntegratedTransactionInput = {
        grossMinor: 10_000, // LKR 100.00
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      expect(() =>
        calculatePaymentSettlementEstimate(
          tx,
          [expensiveRule],
          [standardSettlementPolicy],
          [colomboCalendar]
        )
      ).toThrow(NegativeNetSettlementError);
    });

    it('permits negative net settlement when explicitly allowed in options', () => {
      const expensiveRule: MerchantFeeRule = {
        ...standardFeeRule,
        feeStructure: {
          rateBasisPoints: 0,
          fixedFeeMinor: 20_000, // LKR 200.00
        },
      };

      const tx: IntegratedTransactionInput = {
        grossMinor: 10_000, // LKR 100.00
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(
        tx,
        [expensiveRule],
        [standardSettlementPolicy],
        [colomboCalendar],
        { allowNegativeNetSettlement: true }
      );

      expect(result.grossMinor).toBe(10_000);
      expect(result.totalFeeMinor).toBe(20_000);
      expect(result.netMinor).toBe(-10_000);
      expect(result.grossMinor).toBe(result.totalFeeMinor + result.netMinor);
    });

    it('rejects bare timestamps without explicit timezone offset', () => {
      const tx: IntegratedTransactionInput = {
        grossMinor: 100_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00', // Missing Z or offset
        acquirerId: 'ACQ_BOC',
      };

      expect(() =>
        calculatePaymentSettlementEstimate(tx, standardConfig)
      ).toThrow(SettlementValidationError);
    });

    it('accepts Date objects and converts them safely to canonical ISO timestamp', () => {
      const tx: IntegratedTransactionInput = {
        grossMinor: 100_000,
        currency: 'LKR',
        transactionTime: new Date('2026-11-13T04:30:00Z'),
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(tx, standardConfig);
      expect(result.transactionTime).toBe('2026-11-13T04:30:00.000Z');
      expect(result.localTransactionDate).toBe('2026-11-13');
    });
  });

  // -------------------------------------------------------------------------
  // 6. Immutability, Serialization & Persistence
  // -------------------------------------------------------------------------
  describe('Immutability & Serialization', () => {
    it('guarantees runtime immutability on returned consolidated result', () => {
      const tx: IntegratedTransactionInput = {
        id: 'tx-freeze-test',
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(tx, standardConfig);

      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.feeBreakdown)).toBe(true);
      expect(Object.isFrozen(result.appliedFeeRule)).toBe(true);
      expect(Object.isFrozen(result.appliedSettlementPolicy)).toBe(true);
      expect(Object.isFrozen(result.settlementAdjustments)).toBe(true);

      // Mutation attempt throws in strict mode
      expect(() => {
        // @ts-expect-error mutating frozen property
        result.netMinor = 999;
      }).toThrow();
    });

    it('safely serializes to JSON and round-trips without loss', () => {
      const tx: IntegratedTransactionInput = {
        id: 'tx-json-integrated',
        grossMinor: 1_000_000,
        currency: 'LKR',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      };

      const result = calculatePaymentSettlementEstimate(tx, standardConfig);
      const json = JSON.stringify(result);
      const parsed = JSON.parse(json);

      expect(parsed.grossMinor).toBe(1_000_000);
      expect(parsed.totalFeeMinor).toBe(25_000);
      expect(parsed.netMinor).toBe(975_000);
      expect(parsed.expectedSettlementDate).toBe('2026-11-16');
      expect(parsed.status).toBe('ESTIMATED');
      expect(parsed.isEstimated).toBe(true);
    });
  });
});
