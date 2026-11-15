import { describe, it, expect } from 'vitest';
import {
  estimatePercentageFee,
  TrivioValidationError,
  TrivioRangeError,
  MIN_SUPPORTED_RATE_BPS,
  MAX_SUPPORTED_RATE_BPS,
} from '../src/index.js';

describe('estimatePercentageFee (Stage 1 Demonstration Primitive)', () => {
  describe('Standard calculations', () => {
    it('calculates the exact example from specification (1,000,000 minor units at 250 bps)', () => {
      // 10,000.00 currency units (1,000,000 minor units) with 2.50% MDR (250 bps)
      const result = estimatePercentageFee(1_000_000, 250);

      expect(result).toEqual({
        grossMinor: 1_000_000,
        feeMinor: 25_000,
        netMinor: 975_000,
        rateBasisPoints: 250,
      });
      expect(result.grossMinor).toBe(result.feeMinor + result.netMinor);
    });

    it('calculates 1.50% (150 bps) correctly on 50,000 minor units', () => {
      // 50,000 * 150 = 7,500,000 / 10,000 = 750
      const result = estimatePercentageFee(50_000, 150);
      expect(result.feeMinor).toBe(750);
      expect(result.netMinor).toBe(49_250);
    });

    it('calculates max supported rate (10,000 bps / 100.00%) correctly', () => {
      const gross = 500_000;
      const result = estimatePercentageFee(gross, MAX_SUPPORTED_RATE_BPS);
      expect(result.feeMinor).toBe(gross);
      expect(result.netMinor).toBe(0);
      expect(result.rateBasisPoints).toBe(10_000);
    });
  });

  describe('Boundary cases: Zero values', () => {
    it('handles zero percent rate (0 basis points)', () => {
      const result = estimatePercentageFee(1_000_000, MIN_SUPPORTED_RATE_BPS);
      expect(result.feeMinor).toBe(0);
      expect(result.netMinor).toBe(1_000_000);
      expect(result.rateBasisPoints).toBe(0);
    });

    it('handles zero gross amount (0 minor units)', () => {
      const result = estimatePercentageFee(0, 250);
      expect(result.grossMinor).toBe(0);
      expect(result.feeMinor).toBe(0);
      expect(result.netMinor).toBe(0);
      expect(result.rateBasisPoints).toBe(250);
    });

    it('handles both zero gross amount and zero rate', () => {
      const result = estimatePercentageFee(0, 0);
      expect(result.grossMinor).toBe(0);
      expect(result.feeMinor).toBe(0);
      expect(result.netMinor).toBe(0);
      expect(result.rateBasisPoints).toBe(0);
    });
  });

  describe('Rounding policy: Round-Half-Up', () => {
    it('rounds exact half (0.5 minor unit remainder) UP', () => {
      // Numerator: 10 * 500 = 5000. 5000 / 10000 = 0.5 -> rounds up to 1
      const result = estimatePercentageFee(10, 500);
      expect(result.feeMinor).toBe(1);
      expect(result.netMinor).toBe(9);
    });

    it('rounds strictly below half (0.45 minor unit remainder) DOWN', () => {
      // Numerator: 9 * 500 = 4500. 4500 / 10000 = 0.45 -> rounds down to 0
      const result = estimatePercentageFee(9, 500);
      expect(result.feeMinor).toBe(0);
      expect(result.netMinor).toBe(9);
    });

    it('rounds strictly above half (0.55 minor unit remainder) UP', () => {
      // Numerator: 11 * 500 = 5500. 5500 / 10000 = 0.55 -> rounds up to 1
      const result = estimatePercentageFee(11, 500);
      expect(result.feeMinor).toBe(1);
      expect(result.netMinor).toBe(10);
    });

    it('rounds 250 bps on 30 minor units (remainder 7500, which is 0.75) UP', () => {
      // 30 * 250 = 7500 / 10000 = 0.75 -> rounds up to 1
      const result = estimatePercentageFee(30, 250);
      expect(result.feeMinor).toBe(1);
      expect(result.netMinor).toBe(29);
    });

    it('rounds 250 bps on 15 minor units (remainder 3750, which is 0.375) DOWN', () => {
      // 15 * 250 = 3750 / 10000 = 0.375 -> rounds down to 0
      const result = estimatePercentageFee(15, 250);
      expect(result.feeMinor).toBe(0);
      expect(result.netMinor).toBe(15);
    });
  });

  describe('Invariant guarantees: fee does not exceed gross', () => {
    it('guarantees feeMinor <= grossMinor and grossMinor === feeMinor + netMinor across rate spectrum', () => {
      const gross = 10_000;
      const testRates = [0, 1, 50, 100, 250, 500, 1000, 2500, 5000, 7500, 9999, 10000];

      for (const rate of testRates) {
        const result = estimatePercentageFee(gross, rate);
        expect(result.feeMinor).toBeLessThanOrEqual(gross);
        expect(result.netMinor).toBeGreaterThanOrEqual(0);
        expect(result.feeMinor + result.netMinor).toBe(gross);
      }
    });
  });

  describe('Rejection of invalid, negative, non-integer or unsafe inputs', () => {
    it('rejects negative gross amounts', () => {
      expect(() => estimatePercentageFee(-1, 250)).toThrow(TrivioRangeError);
      expect(() => estimatePercentageFee(-1000, 250)).toThrow(
        /grossMinor must be a non-negative integer/
      );
    });

    it('rejects negative rates', () => {
      expect(() => estimatePercentageFee(1000, -1)).toThrow(TrivioRangeError);
      expect(() => estimatePercentageFee(1000, -250)).toThrow(
        /rateBasisPoints must be between 0 and 10000/
      );
    });

    it('rejects rates above maximum supported range (> 10000 bps)', () => {
      expect(() => estimatePercentageFee(1000, 10_001)).toThrow(TrivioRangeError);
      expect(() => estimatePercentageFee(1000, 20_000)).toThrow(
        /rateBasisPoints must be between 0 and 10000/
      );
    });

    it('rejects non-integer gross amounts', () => {
      expect(() => estimatePercentageFee(100.5, 250)).toThrow(TrivioValidationError);
      expect(() => estimatePercentageFee(1000.0001, 250)).toThrow(
        /grossMinor must be a safe integer/
      );
    });

    it('rejects non-integer rates', () => {
      expect(() => estimatePercentageFee(1000, 250.5)).toThrow(TrivioValidationError);
      expect(() => estimatePercentageFee(1000, 1.25)).toThrow(
        /rateBasisPoints must be a safe integer/
      );
    });

    it('rejects non-numeric gross inputs', () => {
      // @ts-expect-error testing runtime validation
      expect(() => estimatePercentageFee('1000', 250)).toThrow(TrivioValidationError);
      // @ts-expect-error testing runtime validation
      expect(() => estimatePercentageFee(null, 250)).toThrow(TrivioValidationError);
      // @ts-expect-error testing runtime validation
      expect(() => estimatePercentageFee(undefined, 250)).toThrow(TrivioValidationError);
      expect(() => estimatePercentageFee(NaN, 250)).toThrow(TrivioValidationError);
      expect(() => estimatePercentageFee(Infinity, 250)).toThrow(TrivioValidationError);
    });

    it('rejects non-numeric rate inputs', () => {
      // @ts-expect-error testing runtime validation
      expect(() => estimatePercentageFee(1000, '250')).toThrow(TrivioValidationError);
      // @ts-expect-error testing runtime validation
      expect(() => estimatePercentageFee(1000, null)).toThrow(TrivioValidationError);
      expect(() => estimatePercentageFee(1000, NaN)).toThrow(TrivioValidationError);
      expect(() => estimatePercentageFee(1000, Infinity)).toThrow(TrivioValidationError);
    });

    it('rejects unsafe integer inputs exceeding Number.MAX_SAFE_INTEGER', () => {
      const unsafeGross = Number.MAX_SAFE_INTEGER + 10;
      expect(() => estimatePercentageFee(unsafeGross, 250)).toThrow(TrivioValidationError);
    });
  });
});
