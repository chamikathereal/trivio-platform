import { describe, it, expect } from 'vitest';
import {
  calculateFeeEstimate,
  findMatchingRule,
  calculatePercentageFee,
  type TransactionInput,
  type MerchantFeeRule,
  RuleNotFoundError,
  RuleConflictError,
  NegativeNetSettlementError,
  TrivioValidationError,
  TrivioRangeError,
} from '../src/index.js';

// Base sample transaction: LKR 10,000.00 (1,000,000 minor units) on 2026-06-15
const BASE_TRANSACTION: TransactionInput = {
  grossMinor: 1_000_000,
  currency: 'LKR',
  transactionDate: '2026-06-15T10:00:00Z',
  acquirerId: 'acq_boc',
  merchantId: 'mch_colombo_supermarket',
  terminalId: 'term_pos_01',
  cardScheme: 'visa',
  cardFundingType: 'debit',
  cardRegion: 'domestic',
};

// Standard reference rule: 2.50% (250 bps) MDR
const BASE_RULE: MerchantFeeRule = {
  id: 'rule_boc_retail_standard',
  version: '1.0.0',
  acquirerId: 'acq_boc',
  effectiveFrom: '2026-01-01T00:00:00Z',
  effectiveTo: '2026-12-31T23:59:59Z',
  feeStructure: {
    rateBasisPoints: 250, // 2.50%
  },
  rateSource: 'merchant_configured',
  description: 'Standard In-Store Acquirer MDR Agreement',
};

describe('Dynamic Fee Calculation Engine (@trivio.ink/core)', () => {
  describe('1. Reference Example & Pure Percentage MDR', () => {
    it('calculates the exact reference example: LKR 10,000.00 at 2.50% MDR', () => {
      // Gross: 1,000,000 cents -> Fee: 25,000 cents (LKR 250.00) -> Net: 975,000 cents (LKR 9,750.00)
      const result = calculateFeeEstimate(BASE_TRANSACTION, [BASE_RULE]);

      expect(result.grossMinor).toBe(1_000_000);
      expect(result.currency).toBe('LKR');
      expect(result.appliedRateBasisPoints).toBe(250);
      expect(result.percentageFeeMinor).toBe(25_000);
      expect(result.fixedFeeMinor).toBe(0);
      expect(result.totalFeeMinor).toBe(25_000);
      expect(result.netMinor).toBe(975_000);
      expect(result.isEstimate).toBe(true);
      expect(result.rateSource).toBe('merchant_configured');
      expect(result.appliedRule.id).toBe('rule_boc_retail_standard');
      expect(result.appliedRule.version).toBe('1.0.0');

      // Ledger breakdown verification
      expect(result.breakdown.grossMinor).toBe(1_000_000);
      expect(result.breakdown.baseFeeMinor).toBe(25_000);
      expect(result.breakdown.totalFeeMinor).toBe(25_000);
      expect(result.breakdown.netMinor).toBe(975_000);
      expect(result.breakdown.grossMinor).toBe(
        result.breakdown.totalFeeMinor + result.breakdown.netMinor
      );
    });

    it('calculates fees for small transactions with exact minor rounding', () => {
      const tx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 1_000, // LKR 10.00
      };
      const result = calculateFeeEstimate(tx, [BASE_RULE]);

      expect(result.grossMinor).toBe(1_000);
      expect(result.percentageFeeMinor).toBe(25); // 1000 * 250 / 10000 = 25
      expect(result.netMinor).toBe(975);
    });

    it('calculates fees for large transaction volumes safely within safe integer limits', () => {
      const tx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 500_000_000, // LKR 5,000,000.00
      };
      const result = calculateFeeEstimate(tx, [BASE_RULE]);

      expect(result.grossMinor).toBe(500_000_000);
      expect(result.percentageFeeMinor).toBe(12_500_000); // 2.5% of 500M = 12.5M
      expect(result.netMinor).toBe(487_500_000);
      expect(result.grossMinor).toBe(result.totalFeeMinor + result.netMinor);
    });
  });

  describe('2. Fixed Fee and Blended Models', () => {
    it('calculates pure fixed-fee structure (0% MDR + 50.00 fixed charge)', () => {
      const fixedRule: MerchantFeeRule = {
        id: 'rule_fixed_only',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 0,
          fixedFeeMinor: 5_000, // 50.00
        },
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [fixedRule]);

      expect(result.appliedRateBasisPoints).toBe(0);
      expect(result.percentageFeeMinor).toBe(0);
      expect(result.fixedFeeMinor).toBe(5_000);
      expect(result.totalFeeMinor).toBe(5_000);
      expect(result.netMinor).toBe(995_000);
    });

    it('calculates blended rate: percentage + fixed fee (2.50% + LKR 25.00)', () => {
      const blendedRule: MerchantFeeRule = {
        id: 'rule_blended',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 250, // 25,000 on 1M
          fixedFeeMinor: 2_500, // 25.00
        },
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [blendedRule]);

      expect(result.percentageFeeMinor).toBe(25_000);
      expect(result.fixedFeeMinor).toBe(2_500);
      expect(result.totalFeeMinor).toBe(27_500);
      expect(result.netMinor).toBe(972_500);
    });
  });

  describe('3. Minimum and Maximum Fee Limits', () => {
    it('applies minimum fee floor when calculated base fee is below threshold', () => {
      const minFeeRule: MerchantFeeRule = {
        id: 'rule_with_floor',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 100, // 1.00% -> on 10,000 cents = 100 cents
          minFeeMinor: 500,     // Minimum fee: 500 cents (LKR 5.00)
        },
      };

      const tx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 10_000, // LKR 100.00
      };

      const result = calculateFeeEstimate(tx, [minFeeRule]);

      expect(result.percentageFeeMinor).toBe(100);
      expect(result.breakdown.baseFeeMinor).toBe(100);
      expect(result.minFeeAdjustmentMinor).toBe(400); // 500 - 100 = 400 upward adjustment
      expect(result.totalFeeMinor).toBe(500);
      expect(result.netMinor).toBe(9_500);
    });

    it('does not adjust fee when base fee exceeds minimum threshold', () => {
      const minFeeRule: MerchantFeeRule = {
        id: 'rule_with_floor',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 250, // 25,000 cents
          minFeeMinor: 500,
        },
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [minFeeRule]);

      expect(result.percentageFeeMinor).toBe(25_000);
      expect(result.minFeeAdjustmentMinor).toBeNull();
      expect(result.totalFeeMinor).toBe(25_000);
    });

    it('applies maximum fee cap when calculated base fee exceeds ceiling', () => {
      const maxFeeRule: MerchantFeeRule = {
        id: 'rule_with_ceiling',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 300,  // 3.00% -> on 10,000,000 = 300,000 cents
          maxFeeMinor: 100_000,  // Cap at 100,000 cents (LKR 1,000.00)
        },
      };

      const tx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 10_000_000, // LKR 100,000.00
      };

      const result = calculateFeeEstimate(tx, [maxFeeRule]);

      expect(result.percentageFeeMinor).toBe(300_000);
      expect(result.breakdown.baseFeeMinor).toBe(300_000);
      expect(result.maxFeeAdjustmentMinor).toBe(200_000); // 300,000 - 100,000 = 200,000 downward adjustment
      expect(result.totalFeeMinor).toBe(100_000);
      expect(result.netMinor).toBe(9_900_000);
    });
  });

  describe('4. Caller-Configured Tax / Statutory Adjustment', () => {
    it('applies configured tax rate on merchant processing fee', () => {
      const taxRule: MerchantFeeRule = {
        id: 'rule_with_tax',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 250, // Base fee: 25,000 on 1M
          taxAdjustment: {
            rateBasisPoints: 1800, // 18.00% statutory levy on fee
            name: 'VAT',
            description: '18% Value Added Tax on financial processing services',
          },
        },
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [taxRule]);

      // Base fee = 25,000 cents
      // Tax = 25,000 * 18% = 4,500 cents
      // Total fee = 29,500 cents
      // Net = 970,500 cents
      expect(result.percentageFeeMinor).toBe(25_000);
      expect(result.taxMinor).toBe(4_500);
      expect(result.totalFeeMinor).toBe(29_500);
      expect(result.netMinor).toBe(970_500);
      expect(result.breakdown.taxDetails?.name).toBe('VAT');
      expect(result.breakdown.taxDetails?.calculatedMinor).toBe(4_500);
    });

    it('applies configured fixed tax levy on merchant fee', () => {
      const taxRule: MerchantFeeRule = {
        id: 'rule_with_fixed_tax',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 200,
          taxAdjustment: {
            fixedMinor: 150, // LKR 1.50 fixed levy
            name: 'STAMP_DUTY',
          },
        },
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [taxRule]);
      expect(result.percentageFeeMinor).toBe(20_000);
      expect(result.taxMinor).toBe(150);
      expect(result.totalFeeMinor).toBe(20_150);
      expect(result.netMinor).toBe(979_850);
    });
  });

  describe('5. Zero-Value and Boundary Cases', () => {
    it('handles zero gross transaction amount', () => {
      const tx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 0,
      };

      const result = calculateFeeEstimate(tx, [BASE_RULE]);
      expect(result.grossMinor).toBe(0);
      expect(result.totalFeeMinor).toBe(0);
      expect(result.netMinor).toBe(0);
    });

    it('handles zero fee rate (0 basis points)', () => {
      const zeroFeeRule: MerchantFeeRule = {
        id: 'rule_zero_rate',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 0,
        },
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [zeroFeeRule]);
      expect(result.appliedRateBasisPoints).toBe(0);
      expect(result.totalFeeMinor).toBe(0);
      expect(result.netMinor).toBe(1_000_000);
    });

    it('verifies exact half-up rounding boundary in calculatePercentageFee', () => {
      // 10 * 500 bps = 5000 / 10000 = 0.5 -> 1
      expect(calculatePercentageFee(10, 500)).toBe(1);
      // 9 * 500 bps = 4500 / 10000 = 0.45 -> 0
      expect(calculatePercentageFee(9, 500)).toBe(0);
      // 11 * 500 bps = 5500 / 10000 = 0.55 -> 1
      expect(calculatePercentageFee(11, 500)).toBe(1);
    });
  });

  describe('6. Negative Net Settlement Handling', () => {
    it('throws NegativeNetSettlementError by default when fees exceed gross amount', () => {
      const heavyFeeRule: MerchantFeeRule = {
        id: 'rule_heavy',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 0,
          fixedFeeMinor: 2_000, // Fixed fee 2,000 on gross 1,000
        },
      };

      const smallTx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 1_000,
      };

      expect(() => calculateFeeEstimate(smallTx, [heavyFeeRule])).toThrow(
        NegativeNetSettlementError
      );
    });

    it('allows negative net settlement when allowNegativeNetSettlement option is enabled', () => {
      const heavyFeeRule: MerchantFeeRule = {
        id: 'rule_heavy',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 0,
          fixedFeeMinor: 2_000,
        },
      };

      const smallTx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 1_000,
      };

      const result = calculateFeeEstimate(smallTx, [heavyFeeRule], {
        allowNegativeNetSettlement: true,
      });

      expect(result.grossMinor).toBe(1_000);
      expect(result.totalFeeMinor).toBe(2_000);
      expect(result.netMinor).toBe(-1_000);
    });
  });

  describe('7. Dynamic Rule Selection & Specificity Matching', () => {
    it('selects terminal-specific rule over generic merchant rule', () => {
      const genericMerchantRule: MerchantFeeRule = {
        id: 'rule_merchant_general',
        version: 1,
        acquirerId: 'acq_boc',
        merchantId: 'mch_colombo_supermarket',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 250 },
      };

      const specificTerminalRule: MerchantFeeRule = {
        id: 'rule_terminal_preferred',
        version: 1,
        acquirerId: 'acq_boc',
        merchantId: 'mch_colombo_supermarket',
        terminalId: 'term_pos_01',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 180 }, // Lower rate for primary terminal
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [
        genericMerchantRule,
        specificTerminalRule,
      ]);

      expect(result.appliedRule.id).toBe('rule_terminal_preferred');
      expect(result.appliedRateBasisPoints).toBe(180);
    });

    it('selects card-scheme specific rule when scheme matches transaction', () => {
      const defaultRule: MerchantFeeRule = {
        id: 'rule_default_any_card',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 250 },
      };

      const visaDebitRule: MerchantFeeRule = {
        id: 'rule_visa_debit',
        version: 1,
        acquirerId: 'acq_boc',
        cardScheme: 'visa',
        cardFundingType: 'debit',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 150 },
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [defaultRule, visaDebitRule]);
      expect(result.appliedRule.id).toBe('rule_visa_debit');
      expect(result.appliedRateBasisPoints).toBe(150);
    });

    it('selects higher-priority rule even if specificity is lower', () => {
      const specificLowPriority: MerchantFeeRule = {
        id: 'rule_specific_low_pri',
        version: 1,
        acquirerId: 'acq_boc',
        cardScheme: 'visa',
        priority: 0,
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 250 },
      };

      const promotionalHighPriority: MerchantFeeRule = {
        id: 'rule_promo_high_pri',
        version: 1,
        acquirerId: 'acq_boc',
        priority: 10, // Explicit high priority promotional campaign
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 100 },
      };

      const result = calculateFeeEstimate(BASE_TRANSACTION, [
        specificLowPriority,
        promotionalHighPriority,
      ]);

      expect(result.appliedRule.id).toBe('rule_promo_high_pri');
      expect(result.appliedRateBasisPoints).toBe(100);
    });

    it('respects effective date boundaries and ignores expired or future rules', () => {
      const expiredRule: MerchantFeeRule = {
        id: 'rule_expired_2025',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveTo: '2025-12-31T23:59:59Z',
        feeStructure: { rateBasisPoints: 100 },
      };

      const active2026Rule: MerchantFeeRule = {
        id: 'rule_active_2026',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        effectiveTo: '2026-12-31T23:59:59Z',
        feeStructure: { rateBasisPoints: 200 },
      };

      const future2027Rule: MerchantFeeRule = {
        id: 'rule_future_2027',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2027-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 300 },
      };

      // Transaction is in 2026-06-15
      const result = calculateFeeEstimate(BASE_TRANSACTION, [
        expiredRule,
        active2026Rule,
        future2027Rule,
      ]);

      expect(result.appliedRule.id).toBe('rule_active_2026');
      expect(result.appliedRateBasisPoints).toBe(200);
    });

    it('throws RuleNotFoundError when no rule matches the transaction acquirer', () => {
      const differentAcquirerRule: MerchantFeeRule = {
        id: 'rule_other_bank',
        version: 1,
        acquirerId: 'acq_sampath', // Different acquirer
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 200 },
      };

      expect(() => calculateFeeEstimate(BASE_TRANSACTION, [differentAcquirerRule])).toThrow(
        RuleNotFoundError
      );
    });

    it('throws RuleConflictError when two rules tie in priority and specificity with differing fee structures', () => {
      const ruleA: MerchantFeeRule = {
        id: 'rule_conflict_a',
        version: 1,
        acquirerId: 'acq_boc',
        cardScheme: 'visa',
        priority: 5,
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 200 },
      };

      const ruleB: MerchantFeeRule = {
        id: 'rule_conflict_b',
        version: 1,
        acquirerId: 'acq_boc',
        cardScheme: 'visa',
        priority: 5, // Equal priority and equal specificity
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 250 }, // Conflicting rate!
      };

      expect(() => calculateFeeEstimate(BASE_TRANSACTION, [ruleA, ruleB])).toThrow(
        RuleConflictError
      );
    });
  });

  describe('8. Input Validation & Error Handling', () => {
    it('rejects negative gross amounts', () => {
      const invalidTx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: -500,
      };
      expect(() => calculateFeeEstimate(invalidTx, [BASE_RULE])).toThrow(TrivioRangeError);
    });

    it('rejects fractional minor currency units', () => {
      const invalidTx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 1000.5,
      };
      expect(() => calculateFeeEstimate(invalidTx, [BASE_RULE])).toThrow(TrivioValidationError);
    });

    it('rejects invalid currency codes', () => {
      const invalidTx: TransactionInput = {
        ...BASE_TRANSACTION,
        currency: 'INVALID_LONG_CODE',
      };
      expect(() => calculateFeeEstimate(invalidTx, [BASE_RULE])).toThrow(TrivioValidationError);
    });

    it('rejects rule with rate exceeding 10,000 bps', () => {
      const invalidRule: MerchantFeeRule = {
        id: 'rule_invalid_rate',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 12_000 },
      };
      expect(() => calculateFeeEstimate(BASE_TRANSACTION, [invalidRule])).toThrow(
        TrivioRangeError
      );
    });

    it('rejects rule where minFeeMinor exceeds maxFeeMinor', () => {
      const invalidRule: MerchantFeeRule = {
        id: 'rule_inverted_bounds',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 200,
          minFeeMinor: 50_000,
          maxFeeMinor: 10_000, // min > max!
        },
      };
      expect(() => calculateFeeEstimate(BASE_TRANSACTION, [invalidRule])).toThrow(
        TrivioRangeError
      );
    });

    it('rejects empty rules array', () => {
      expect(() => calculateFeeEstimate(BASE_TRANSACTION, [])).toThrow(
        TrivioValidationError
      );
    });
  });

  describe('9. Financial Acceptance & Rigorous Invariant Audit', () => {
    it('guarantees terminal-specific rule cannot be outranked by accumulated lower-level criteria', () => {
      // Rule A: Terminal-specific ONLY (no merchant, scheme, funding, region, currency)
      const terminalOnlyRule: MerchantFeeRule = {
        id: 'rule_terminal_specific_contract',
        version: 1,
        acquirerId: 'acq_boc',
        terminalId: 'term_pos_01',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 175 }, // 1.75%
      };

      // Rule B: Merchant + Scheme + Funding + Region + Currency (accumulates all lower-tier criteria)
      const multiAttributeRule: MerchantFeeRule = {
        id: 'rule_broad_merchant_card_matrix',
        version: 1,
        acquirerId: 'acq_boc',
        merchantId: 'mch_colombo_supermarket',
        cardScheme: 'visa',
        cardFundingType: 'debit',
        cardRegion: 'domestic',
        currency: 'LKR',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 220 }, // 2.20%
      };

      // Both rules match the transaction context. Terminal-specific MUST WIN.
      const result = calculateFeeEstimate(BASE_TRANSACTION, [multiAttributeRule, terminalOnlyRule]);
      expect(result.appliedRule.id).toBe('rule_terminal_specific_contract');
      expect(result.appliedRateBasisPoints).toBe(175);
    });

    it('guarantees merchant-specific rule cannot be outranked by accumulated card/currency criteria', () => {
      // Transaction on another terminal
      const tx: TransactionInput = {
        ...BASE_TRANSACTION,
        terminalId: 'term_general_pos',
      };

      // Rule A: Merchant-specific ONLY
      const merchantOnlyRule: MerchantFeeRule = {
        id: 'rule_merchant_bespoke_agreement',
        version: 1,
        acquirerId: 'acq_boc',
        merchantId: 'mch_colombo_supermarket',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 190 },
      };

      // Rule B: Acquirer-wide card scheme + funding + region + currency
      const acquirerCardRule: MerchantFeeRule = {
        id: 'rule_acquirer_default_card_matrix',
        version: 1,
        acquirerId: 'acq_boc',
        cardScheme: 'visa',
        cardFundingType: 'debit',
        cardRegion: 'domestic',
        currency: 'LKR',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 260 },
      };

      const result = calculateFeeEstimate(tx, [acquirerCardRule, merchantOnlyRule]);
      expect(result.appliedRule.id).toBe('rule_merchant_bespoke_agreement');
      expect(result.appliedRateBasisPoints).toBe(190);
    });

    it('ensures rule selection is completely independent of input array ordering', () => {
      const ruleA: MerchantFeeRule = {
        id: 'rule_equivalent_a',
        version: 1,
        acquirerId: 'acq_boc',
        cardScheme: 'visa',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 200 },
      };

      const ruleB: MerchantFeeRule = {
        id: 'rule_equivalent_b',
        version: 1,
        acquirerId: 'acq_boc',
        cardScheme: 'visa',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: { rateBasisPoints: 200 }, // Identical rate
      };

      const resForward = calculateFeeEstimate(BASE_TRANSACTION, [ruleA, ruleB]);
      const resReverse = calculateFeeEstimate(BASE_TRANSACTION, [ruleB, ruleA]);

      // Both must pick the exact same rule ID deterministically
      expect(resForward.appliedRule.id).toBe(resReverse.appliedRule.id);
      expect(resForward.totalFeeMinor).toBe(resReverse.totalFeeMinor);
    });

    it('exposes an immutable snapshot of applied agreement for historical audit trails', () => {
      const result = calculateFeeEstimate(BASE_TRANSACTION, [BASE_RULE]);

      expect(result.appliedRule.snapshot).toBeDefined();
      expect(result.appliedRule.snapshot.id).toBe(BASE_RULE.id);
      expect(result.appliedRule.snapshot.version).toBe(BASE_RULE.version);
      expect(result.appliedRule.snapshot.acquirerId).toBe(BASE_RULE.acquirerId);
      expect(result.appliedRule.snapshot.rateBasisPoints).toBe(250);
      expect(result.appliedRule.snapshot.fixedFeeMinor).toBe(0);
      expect(result.appliedRule.snapshot.effectiveFrom).toBe('2026-01-01T00:00:00.000Z');
    });

    it('does not mutate input transaction or rules objects', () => {
      const txClone = JSON.parse(JSON.stringify(BASE_TRANSACTION));
      const ruleClone = JSON.parse(JSON.stringify(BASE_RULE));

      calculateFeeEstimate(BASE_TRANSACTION, [BASE_RULE]);

      expect(BASE_TRANSACTION).toEqual(txClone);
      expect(BASE_RULE).toEqual(ruleClone);
    });

    it('handles zero-value transaction consistently with fee configuration', () => {
      const zeroTx: TransactionInput = {
        ...BASE_TRANSACTION,
        grossMinor: 0,
      };

      // Zero-value with 0 fixed fee -> 0 fee, 0 net
      const zeroFeeRule: MerchantFeeRule = {
        ...BASE_RULE,
        feeStructure: { rateBasisPoints: 250, fixedFeeMinor: 0 },
      };
      const resZero = calculateFeeEstimate(zeroTx, [zeroFeeRule]);
      expect(resZero.grossMinor).toBe(0);
      expect(resZero.totalFeeMinor).toBe(0);
      expect(resZero.netMinor).toBe(0);

      // Zero-value with fixed fee of 50 minor and allowNegativeNetSettlement
      const fixedFeeRule: MerchantFeeRule = {
        ...BASE_RULE,
        feeStructure: { rateBasisPoints: 250, fixedFeeMinor: 50 },
      };
      const resNeg = calculateFeeEstimate(zeroTx, [fixedFeeRule], {
        allowNegativeNetSettlement: true,
      });
      expect(resNeg.grossMinor).toBe(0);
      expect(resNeg.totalFeeMinor).toBe(50);
      expect(resNeg.netMinor).toBe(-50);

      // Without allowNegativeNetSettlement -> throws
      expect(() => calculateFeeEstimate(zeroTx, [fixedFeeRule])).toThrow(
        NegativeNetSettlementError
      );
    });

    it('reconciles exact ledger balances across all boundary adjustments', () => {
      const complexRule: MerchantFeeRule = {
        id: 'rule_complex_reconciliation',
        version: 1,
        acquirerId: 'acq_boc',
        effectiveFrom: '2026-01-01T00:00:00Z',
        feeStructure: {
          rateBasisPoints: 275, // 2.75%
          fixedFeeMinor: 1_500, // LKR 15.00
          minFeeMinor: 5_000,   // LKR 50.00 floor
          maxFeeMinor: 50_000,  // LKR 500.00 ceiling
          taxAdjustment: {
            rateBasisPoints: 1800, // 18% VAT
            fixedMinor: 250,       // 2.50 stamp duty
            name: 'VAT + Stamp',
          },
        },
      };

      // Test multiple transaction sizes
      const grossAmounts = [10_000, 50_000, 1_000_000, 5_000_000];

      for (const gross of grossAmounts) {
        const tx: TransactionInput = { ...BASE_TRANSACTION, grossMinor: gross };
        const result = calculateFeeEstimate(tx, [complexRule]);

        // Invariant 1: Gross equals total deductions plus net
        expect(result.grossMinor).toBe(result.totalFeeMinor + result.netMinor);

        // Invariant 2: Total fee equals adjusted base fee plus tax
        expect(result.totalFeeMinor).toBe(
          result.breakdown.adjustedBaseFeeMinor + result.taxMinor
        );

        // Invariant 3: Net is exact subtraction
        expect(result.netMinor).toBe(result.grossMinor - result.totalFeeMinor);
      }
    });
  });
});
