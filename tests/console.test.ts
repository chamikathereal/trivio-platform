/**
 * @file tests/console.test.ts
 * @description Comprehensive automated unit and integration tests for Stage 4B Trivio Developer Console.
 */

import { describe, expect, it } from "vitest";
import {
  INITIAL_MERCHANTS,
  INITIAL_FEE_AGREEMENTS,
  INITIAL_SETTLEMENT_POLICIES,
  INITIAL_WARNINGS,
} from "../apps/console/lib/mock-data";
import { formatMinorUnits, formatBps } from "../apps/console/lib/utils";
import { calculatePaymentSettlementEstimate } from "../packages/core/src/index";

describe("Stage 4B: Trivio Developer Console — Domain Models & Calculation Verification", () => {
  it("should contain valid initial merchant profiles with matching fee agreements and settlement policies", () => {
    expect(INITIAL_MERCHANTS.length).toBeGreaterThanOrEqual(4);

    for (const merchant of INITIAL_MERCHANTS) {
      expect(merchant.id).toMatch(/^mer_/);
      expect(merchant.name).toBeDefined();
      expect(merchant.currency).toMatch(/^[A-Z]{3}$/);
      expect(merchant.status).toMatch(/^(ACTIVE|PENDING_SETUP|FLAGGED)$/);

      // Verify that assigned fee agreement exists
      const fee = INITIAL_FEE_AGREEMENTS.find((f) => f.id === merchant.feeAgreementId);
      expect(fee).toBeDefined();

      // Verify that assigned settlement policy exists
      const policy = INITIAL_SETTLEMENT_POLICIES.find((p) => p.id === merchant.settlementPolicyId);
      expect(policy).toBeDefined();
    }
  });

  it("should contain properly formatted fee agreements with positive basis points", () => {
    for (const agreement of INITIAL_FEE_AGREEMENTS) {
      expect(agreement.id).toMatch(/^fee_/);
      expect(agreement.percentageBps).toBeGreaterThan(0);
      expect(agreement.percentageBps).toBeLessThanOrEqual(5000); // <= 50%
      expect(agreement.fixedFeeMinor).toBeGreaterThanOrEqual(0n);
      expect(agreement.priority).toBeGreaterThanOrEqual(0);
      expect(agreement.status).toMatch(/^(ACTIVE|DRAFT|DEPRECATED)$/);
    }
  });

  it("should contain holiday-aware settlement policies with valid ISO date strings", () => {
    for (const policy of INITIAL_SETTLEMENT_POLICIES) {
      expect(policy.id).toMatch(/^pol_/);
      expect(policy.cycleDays).toBeGreaterThanOrEqual(0);
      expect(policy.cutOffTimeUtc).toMatch(/^\d{2}:\d{2}$/);
      expect(policy.weekendHandling).toMatch(/^(following_business_day|preceding_business_day|no_adjustment)$/);

      for (const holiday of policy.holidays) {
        expect(holiday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should verify formatMinorUnits and formatBps utility functions without floating point errors", () => {
    expect(formatBps(250)).toBe("2.50%");
    expect(formatBps(220)).toBe("2.20%");
    expect(formatBps(180)).toBe("1.80%");

    expect(formatMinorUnits(1000000n, "USD")).toBe("$10,000.00");
    expect(formatMinorUnits(150n, "USD")).toBe("$1.50");
    expect(formatMinorUnits(30n, "USD")).toBe("$0.30");
  });

  it("should execute deterministic calculation using @trivio.ink/core within console simulation parameters", () => {
    const grossMinor = 1000000; // $10,000.00
    const feeRule = {
      id: "fee_test",
      version: "1.0.0",
      acquirerId: "ACQ_TEST",
      effectiveFrom: "2026-01-01T00:00:00Z",
      priority: 0,
      feeStructure: {
        rateBasisPoints: 220, // 2.20%
        fixedFeeMinor: 30,    // $0.30
      },
      rateSource: "merchant_configured" as const,
    };

    const settlementPolicy = {
      id: "pol_test",
      version: "1.0.0",
      acquirerId: "ACQ_TEST",
      effectiveFrom: "2026-01-01",
      priority: 0,
      cycleLength: 2,
      cycleUnit: "business_days" as const,
      cutOffTime: "16:00",
      timeZone: "America/New_York",
      calendarId: "cal_test",
      nonWorkingDayConvention: "following_business_day" as const,
    };

    const calendar = {
      id: "cal_test",
      version: "1.0.0",
      timeZone: "America/New_York",
      workingDays: [1, 2, 3, 4, 5],
      holidays: ["2026-12-25"],
    };

    const result = calculatePaymentSettlementEstimate(
      {
        grossMinor,
        currency: "USD",
        // In America/New_York (EST, UTC-5), 21:30:00Z is 16:30:00 local time, which is past the 16:00 cut-off window.
        transactionTime: "2026-11-20T21:30:00Z",
        acquirerId: "ACQ_TEST",
      },
      {
        feeRules: [feeRule],
        settlementPolicies: [settlementPolicy],
        calendars: [calendar],
      }
    );

    // 2.20% of $10,000.00 is $220.00 (22000 minor units).
    // Fixed fee is $0.30 (30 minor units).
    // Total fee = 22030 minor units ($220.30).
    // Net settlement = 1000000 - 22030 = 977970 minor units ($9,779.70).
    expect(result.grossMinor).toBe(1000000);
    expect(result.percentageFeeMinor).toBe(22000);
    expect(result.fixedFeeMinor).toBe(30);
    expect(result.totalFeeMinor).toBe(22030);
    expect(result.netMinor).toBe(977970);

    // Because Friday 16:30 local time is past 16:00 cut-off, it shifts +1 business day to Monday (Nov 23).
    // Plus T+2 business days clearance = Wednesday Nov 25.
    expect(result.isPastCutOff).toBe(true);
    expect(result.expectedSettlementDate).toBe("2026-11-25");
  });

  it("should verify that configuration warnings contain valid non-empty recommendations", () => {
    expect(INITIAL_WARNINGS.length).toBeGreaterThan(0);
    for (const warning of INITIAL_WARNINGS) {
      expect(warning.id).toBeDefined();
      expect(warning.title.length).toBeGreaterThan(5);
      expect(warning.message.length).toBeGreaterThan(10);
      expect(warning.recommendation.length).toBeGreaterThan(10);
      expect(warning.severity).toMatch(/^(high|medium|low)$/);
    }
  });
});
