// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  calculatePaymentSettlementEstimate,
  roundHalfUpDiv,
  type MerchantFeeRule,
  type SettlementCalendar,
  type SettlementPolicy,
} from '@trivio.ink/core';
import { TrivioClient } from '@trivio.ink/node';
import {
  formatCurrency,
  formatMinorAmount,
  getCurrencyDecimals,
} from '@trivio.ink/react';

describe('Developer Documentation Code Snippet Verification', () => {
  it('compiles and executes the Core SDK Quick Start example accurately', () => {
    const estimate = calculatePaymentSettlementEstimate(
      {
        grossMinor: 1000000, // $10,000.00
        currency: 'USD',
        transactionTime: '2026-11-16T17:30:00Z', // Monday after 16:00 cut-off
        acquirerId: 'ACQ_PRIMARY',
      },
      {
        feeRules: [
          {
            id: 'RULE_VISA_CREDIT',
            version: '1.0.0',
            priority: 10,
            acquirerId: 'ACQ_PRIMARY',
            currency: 'USD',
            effectiveFrom: '2026-01-01',
            rateSource: 'merchant_configured',
            feeStructure: {
              rateBasisPoints: 250, // 2.50% MDR
              fixedFeeMinor: 1500,  // $15.00 fixed
            },
          },
        ],
        settlementPolicies: [
          {
            id: 'POLICY_T_PLUS_1',
            version: '1.0.0',
            acquirerId: 'ACQ_PRIMARY',
            currency: 'USD',
            effectiveFrom: '2026-01-01',
            cycleLength: 1,
            cycleUnit: 'business_days',
            cutOffTime: '16:00:00',
            timeZone: 'UTC',
            calendarId: 'CAL_US',
          },
        ],
        calendars: [
          {
            id: 'CAL_US',
            version: '2026.1',
            timeZone: 'UTC',
            workingDays: [1, 2, 3, 4, 5],
            holidays: ['2026-12-25', '2027-01-01'],
          },
        ],
      }
    );

    expect(estimate.grossMinor).toBe(1000000);
    expect(estimate.percentageFeeMinor).toBe(25000); // 2.5% of 1,000,000
    expect(estimate.fixedFeeMinor).toBe(1500);
    expect(estimate.totalFeeMinor).toBe(26500);
    expect(estimate.netMinor).toBe(973500);
    expect(estimate.isPastCutOff).toBe(true);
    expect(estimate.expectedSettlementDate).toBe('2026-11-18');
    expect(estimate.feeCalculationPolicy).toBe('trivio-mdr-v1-half-up');
  });

  it('compiles and executes the Node.js SDK Quick Start client example', () => {
    const client = new TrivioClient({
      feeRules: [
        {
          id: 'RULE_MERCHANT_PRIMARY',
          version: '1.0.0',
          priority: 10,
          acquirerId: 'ACQ_STRIPE',
          currency: 'USD',
          effectiveFrom: '2026-01-01',
          rateSource: 'merchant_configured',
          feeStructure: {
            rateBasisPoints: 290, // 2.90%
            fixedFeeMinor: 30,    // $0.30
          },
        },
      ],
      settlementPolicies: [
        {
          id: 'POL_STANDARD_T2',
          version: '1.0.0',
          acquirerId: 'ACQ_STRIPE',
          currency: 'USD',
          effectiveFrom: '2026-01-01',
          cycleLength: 2,
          cycleUnit: 'business_days',
          cutOffTime: '17:00:00',
          timeZone: 'America/New_York',
          calendarId: 'CAL_US_FED',
        },
      ],
      calendars: [
        {
          id: 'CAL_US_FED',
          version: '2026.1',
          timeZone: 'America/New_York',
          workingDays: [1, 2, 3, 4, 5],
          holidays: ['2026-12-25', '2027-01-01'],
        },
      ],
    });

    const estimate = client.calculatePaymentSettlementEstimate({
      grossMinor: 10000, // $100.00
      currency: 'USD',
      transactionTime: '2026-11-16T12:00:00Z',
      acquirerId: 'ACQ_STRIPE',
    });

    // 10000 * 290 / 10000 = 290 percentage fee. Fixed fee = 30. Total fee = 320.
    expect(estimate.percentageFeeMinor).toBe(290);
    expect(estimate.fixedFeeMinor).toBe(30);
    expect(estimate.netMinor).toBe(9680);
    expect(estimate.feeCalculationPolicy).toBe('trivio-mdr-v1-half-up');
  });

  it('verifies roundHalfUpDiv deterministic arithmetic matches documented behavior', () => {
    const grossMinor = 1000000n; // 10,000.00
    const rateBps = 290n;        // 2.90%
    const formulaResult = (grossMinor * rateBps + 5000n) / 10000n;
    const fnResult = roundHalfUpDiv(grossMinor * rateBps, 10000n);

    expect(formulaResult).toBe(29000n);
    expect(fnResult).toBe(29000n);

    // Half-up boundary test (100 * 25 bps = 2500 / 10000 = 0.25 -> 0)
    expect(roundHalfUpDiv(2500n, 10000n)).toBe(0n);
    // Half-up boundary test (200 * 25 bps = 5000 / 10000 = 0.50 -> 1)
    expect(roundHalfUpDiv(5000n, 10000n)).toBe(1n);
  });

  it('verifies React SDK formatters and currency decimals matching documentation', () => {
    expect(formatCurrency(973500, 'USD')).toBe('USD 9,735.00');
    expect(formatMinorAmount(973500, 2)).toBe('9735.00');
    expect(formatMinorAmount(1500, 0)).toBe('1500');
    expect(formatMinorAmount(1500, 3)).toBe('1.500');

    expect(getCurrencyDecimals('USD')).toBe(2);
    expect(getCurrencyDecimals('JPY')).toBe(0);
    expect(getCurrencyDecimals('BHD')).toBe(3);
  });
});
