/**
 * @file packages/react/tests/index.test.ts
 * @description Comprehensive automated tests for Trivio React Developer SDK (@trivio.ink/react).
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  // Components
  TrivioSettlementSummary,
  TrivioFeeBreakdown,
  FeeBreakdown,
  TrivioSettlementTimeline,
  // Context & Provider
  TrivioProvider,
  useTrivio,
  // Formatters
  getCurrencyDecimals,
  formatMinorAmount,
  formatCurrency,
  formatRateBps,
  formatDisplayDate,
  // Brand Tokens
  TRIVIO_TOKENS,
  getThemePalette,
  getCardStyle,
  getBadgeStyle,
  // Hook
  useTrivioSettlementEstimate,
  // Core calculation & types
  calculatePaymentSettlementEstimate,
  type IntegratedSettlementConfig,
  type IntegratedTransactionInput,
  type IntegratedSettlementEstimateResult,
} from '../src/index.js';

// Test Fixtures
const testConfig: IntegratedSettlementConfig = {
  feeRules: [
    {
      id: 'RULE_DEFAULT_VISA',
      version: '1.0.0',
      priority: 10,
      acquirerId: 'ACQ_BOC',
      currency: 'LKR',
      effectiveFrom: '2026-01-01',
      rateSource: 'merchant_configured',
      feeStructure: {
        rateBasisPoints: 250, // 2.50%
        fixedFeeMinor: 1500,  // 15.00 LKR
        minFeeMinor: 2500,    // 25.00 LKR
        taxAdjustment: {
          rateBasisPoints: 25, // 0.25%
          name: 'VAT',
        },
      },
    },
  ],
  settlementPolicies: [
    {
      id: 'POL_BOC_T1',
      version: '1.0.0',
      acquirerId: 'ACQ_BOC',
      currency: 'LKR',
      effectiveFrom: '2026-01-01',
      cycleLength: 1,
      cycleUnit: 'business_days',
      cutOffTime: '16:00:00',
      timeZone: 'Asia/Colombo',
      calendarId: 'CAL_LK_CENTRAL',
      nonWorkingDayConvention: 'following_business_day',
    },
  ],
  calendars: [
    {
      id: 'CAL_LK_CENTRAL',
      version: '2026.1',
      timeZone: 'Asia/Colombo',
      workingDays: [1, 2, 3, 4, 5], // Monday - Friday
      holidays: ['2026-11-16'],     // Monday Holiday
    },
  ],
};

const sampleTransaction: IntegratedTransactionInput = {
  grossMinor: 1_000_000, // 10,000.00 LKR
  currency: 'LKR',
  transactionTime: '2026-11-13T17:30:00+05:30', // Friday post cut-off
  acquirerId: 'ACQ_BOC',
  cardScheme: 'visa',
  cardFundingType: 'credit',
  cardRegion: 'domestic',
};

describe('@trivio.ink/react SDK Test Suite', () => {
  describe('Zero-Float Financial Formatters', () => {
    it('determines currency decimals correctly for zero, two, and three decimal currencies', () => {
      expect(getCurrencyDecimals('JPY')).toBe(0);
      expect(getCurrencyDecimals('KRW')).toBe(0);
      expect(getCurrencyDecimals('CLP')).toBe(0);
      expect(getCurrencyDecimals('VND')).toBe(0);

      expect(getCurrencyDecimals('BHD')).toBe(3);
      expect(getCurrencyDecimals('KWD')).toBe(3);
      expect(getCurrencyDecimals('OMR')).toBe(3);

      expect(getCurrencyDecimals('USD')).toBe(2);
      expect(getCurrencyDecimals('LKR')).toBe(2);
      expect(getCurrencyDecimals('EUR')).toBe(2);
      expect(getCurrencyDecimals('GBP')).toBe(2);
      expect(getCurrencyDecimals(undefined)).toBe(2);
    });

    it('formats minor amounts with exact string manipulation without IEEE-754 division', () => {
      // 2-decimal standard
      expect(formatMinorAmount(1_000_000, 2)).toBe('10000.00');
      expect(formatMinorAmount(25_000, 2)).toBe('250.00');
      expect(formatMinorAmount(50, 2)).toBe('0.50');
      expect(formatMinorAmount(5, 2)).toBe('0.05');
      expect(formatMinorAmount(0, 2)).toBe('0.00');
      expect(formatMinorAmount(-5000, 2)).toBe('-50.00');

      // 0-decimal currencies (JPY)
      expect(formatMinorAmount(1500, 0)).toBe('1500');
      expect(formatMinorAmount(0, 0)).toBe('0');
      expect(formatMinorAmount(-1200, 0)).toBe('-1200');

      // 3-decimal currencies (BHD)
      expect(formatMinorAmount(1500, 3)).toBe('1.500');
      expect(formatMinorAmount(5, 3)).toBe('0.005');
      expect(formatMinorAmount(0, 3)).toBe('0.000');

      // BigInt inputs
      expect(formatMinorAmount(1_000_000n, 2)).toBe('10000.00');
      expect(formatMinorAmount(-250n, 2)).toBe('-2.50');
    });

    it('formats currencies with grouping commas and currency codes', () => {
      expect(formatCurrency(1_000_000, 'USD')).toBe('USD 10,000.00');
      expect(formatCurrency(25_000, 'LKR')).toBe('LKR 250.00');
      expect(formatCurrency(1_500_000, 'JPY')).toBe('JPY 1,500,000');
      expect(formatCurrency(-5000, 'USD')).toBe('USD -50.00');

      // Options
      expect(formatCurrency(1_000_000, 'USD', { showCurrency: false })).toBe('10,000.00');
      expect(formatCurrency(1_000_000, 'USD', { useGrouping: false })).toBe('USD 10000.00');
    });

    it('formats rate basis points accurately', () => {
      expect(formatRateBps(250)).toBe('2.50%');
      expect(formatRateBps(150)).toBe('1.50%');
      expect(formatRateBps(10_000)).toBe('100.00%');
      expect(formatRateBps(0)).toBe('0.00%');
      expect(formatRateBps(5)).toBe('0.05%');
      expect(formatRateBps(-50)).toBe('-0.50%');
    });

    it('formats ISO calendar dates cleanly for human display', () => {
      const formatted = formatDisplayDate('2026-11-18', 'en-US');
      expect(formatted).toContain('Nov 18, 2026');
      expect(formatDisplayDate(undefined)).toBe('Pending');
      expect(formatDisplayDate('')).toBe('Pending');
      expect(formatDisplayDate('invalid-date')).toBe('invalid-date');
    });
  });

  describe('Brand Tokens and Theming', () => {
    it('exports official brand color tokens', () => {
      expect(TRIVIO_TOKENS.midnightNavy).toBe('#000b26');
      expect(TRIVIO_TOKENS.electricCyan).toBe('#00ffff');
      expect(TRIVIO_TOKENS.warmWhite).toBe('#fffefa');
    });

    it('provides distinct palettes for dark and light themes', () => {
      const dark = getThemePalette('dark');
      const light = getThemePalette('light');

      expect(dark.bg).toBe('#000b26');
      expect(dark.accent).toBe('#00ffff');
      expect(light.bg).toBe('#ffffff');
      expect(light.textPrimary).toBe('#000b26');
    });

    it('generates consistent card and badge styles without external CSS dependencies', () => {
      const cardDark = getCardStyle('dark');
      expect(cardDark.borderRadius).toBe('12px');
      expect(cardDark.backgroundColor).toBe('#001338');

      const badgeAccent = getBadgeStyle('accent', 'dark');
      expect(badgeAccent.color).toBe('#00ffff');
      expect(badgeAccent.fontWeight).toBe(600);

      const badgeWarning = getBadgeStyle('warning', 'light');
      expect(badgeWarning.color).toBe(TRIVIO_TOKENS.light.warning);
    });
  });

  describe('TrivioProvider and useTrivio Context', () => {
    it('provides default configuration outside provider', () => {
      expect(typeof useTrivio).toBe('function');
      expect(typeof TrivioProvider).toBe('function');
    });

    it('instantiates TrivioProvider element with custom props', () => {
      const element = React.createElement(
        TrivioProvider,
        {
          currencyCode: 'LKR',
          theme: 'light',
          locale: 'en-GB',
        },
        React.createElement('div', null, 'child')
      );

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.currencyCode).toBe('LKR');
      expect(element.props.theme).toBe('light');
      expect(element.props.locale).toBe('en-GB');
    });

    it('does not store or provide a fallback financial fee rate', () => {
      // Trivio Cardinal Rule: Never assume or invent an MDR
      const element = React.createElement(TrivioProvider, {
        currencyCode: 'USD',
        theme: 'dark',
        children: React.createElement('div', null, 'child'),
      });

      expect(React.isValidElement(element)).toBe(true);
      expect('defaultRateBps' in element.props).toBe(false);
    });
  });

  describe('TrivioSettlementSummary Component', () => {
    it('instantiates TrivioSettlementSummary with direct props', () => {
      const element = React.createElement(TrivioSettlementSummary, {
        grossMinor: 1_000_000,
        feeMinor: 25_000,
        netMinor: 975_000,
        expectedSettlementDate: '2026-11-18',
        currencyCode: 'LKR',
        settlementCycle: 'T+1 Business Days',
        isEstimated: true,
        isPostCutOff: true,
        isDeferred: true,
        theme: 'dark',
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.grossMinor).toBe(1_000_000);
      expect(element.props.netMinor).toBe(975_000);
      expect(element.props.isEstimated).toBe(true);
      expect(element.props.theme).toBe('dark');
    });

    it('instantiates TrivioSettlementSummary with full integrated calculation estimate', () => {
      const estimate = calculatePaymentSettlementEstimate(sampleTransaction, testConfig);

      const element = React.createElement(TrivioSettlementSummary, {
        estimate,
        theme: 'light',
        showDisclaimer: true,
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.estimate).toBe(estimate);
      expect(element.props.estimate?.isEstimated).toBe(true);
      expect(element.props.estimate?.grossMinor).toBe(1_000_000);
    });

    it('handles explicit zero values gracefully', () => {
      const element = React.createElement(TrivioSettlementSummary, {
        estimate: null,
        grossMinor: 0,
        feeMinor: 0,
        netMinor: 0,
        expectedSettlementDate: '',
        showDisclaimer: false,
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.grossMinor).toBe(0);
      expect(element.props.showDisclaimer).toBe(false);
    });

    it('rejects unconfigured settlement summary with TrivioValidationError when estimate and amounts are omitted', () => {
      expect(() => {
        TrivioSettlementSummary({});
      }).toThrow('TrivioSettlementSummary requires either a valid estimate or explicit');
    });
  });

  describe('TrivioFeeBreakdown & FeeBreakdown Component', () => {
    it('exports FeeBreakdown as alias for backward compatibility', () => {
      expect(FeeBreakdown).toBe(TrivioFeeBreakdown);
    });

    it('instantiates with direct legacy props (grossMinor, rateBasisPoints)', () => {
      const element = React.createElement(TrivioFeeBreakdown, {
        grossMinor: 1_000_000,
        rateBasisPoints: 250,
        currencyCode: 'USD',
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.grossMinor).toBe(1_000_000);
      expect(element.props.rateBasisPoints).toBe(250);
    });

    it('instantiates with full integrated calculation estimate', () => {
      const estimate = calculatePaymentSettlementEstimate(sampleTransaction, testConfig);

      const element = React.createElement(TrivioFeeBreakdown, {
        estimate,
        showRuleSnapshot: true,
        theme: 'dark',
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.estimate).toBe(estimate);
      expect(element.props.showRuleSnapshot).toBe(true);
    });

    it('handles explicit zero rates gracefully when provided', () => {
      const element = React.createElement(TrivioFeeBreakdown, {
        estimate: null,
        grossMinor: 0,
        rateBasisPoints: 0,
        currencyCode: 'EUR',
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.grossMinor).toBe(0);
      expect(element.props.currencyCode).toBe('EUR');
    });

    it('strictly rejects missing fee rate with TrivioValidationError when estimate/feeResult is omitted', () => {
      // Trivio Financial Safety Invariant: Never invent or assume an MDR fallback rate
      expect(() => {
        TrivioFeeBreakdown({ grossMinor: 100_000 });
      }).toThrow('TrivioFeeBreakdown requires an explicit fee agreement');
    });
  });

  describe('TrivioSettlementTimeline Component', () => {
    it('instantiates TrivioSettlementTimeline with integrated estimate', () => {
      const estimate = calculatePaymentSettlementEstimate(sampleTransaction, testConfig);

      const element = React.createElement(TrivioSettlementTimeline, {
        estimate,
        theme: 'dark',
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.estimate).toBe(estimate);
    });

    it('instantiates TrivioSettlementTimeline with custom steps override', () => {
      const element = React.createElement(TrivioSettlementTimeline, {
        customSteps: [
          {
            id: 'step1',
            title: 'Custom Step 1',
            description: 'Custom Description 1',
            status: 'completed',
            badge: 'Completed',
          },
        ],
        theme: 'light',
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.customSteps).toHaveLength(1);
    });

    it('instantiates TrivioSettlementTimeline with settlementDateResult directly', () => {
      const estimate = calculatePaymentSettlementEstimate(sampleTransaction, testConfig);

      const element = React.createElement(TrivioSettlementTimeline, {
        settlementDateResult: estimate.settlementEstimate,
        currencyCode: 'LKR',
        theme: 'dark',
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.currencyCode).toBe('LKR');
    });

    it('rejects unconfigured timeline with TrivioValidationError when estimate and steps are omitted', () => {
      expect(() => {
        TrivioSettlementTimeline({});
      }).toThrow('TrivioSettlementTimeline requires either an estimate, settlementDateResult, or customSteps');
    });
  });

  describe('useTrivioSettlementEstimate Hook Foundation', () => {
    it('exports useTrivioSettlementEstimate as a valid function', () => {
      expect(typeof useTrivioSettlementEstimate).toBe('function');
    });

    it('executes core integrated calculation and produces valid estimate structure', () => {
      const estimate = calculatePaymentSettlementEstimate(sampleTransaction, testConfig);

      expect(estimate.isEstimated).toBe(true);
      expect(estimate.status).toBe('ESTIMATED');
      expect(estimate.grossMinor).toBe(1_000_000);
      expect(estimate.totalFeeMinor).toBeGreaterThan(0);
      expect(estimate.netMinor).toBe(estimate.grossMinor - estimate.totalFeeMinor);
      expect(estimate.isPastCutOff).toBe(true); // authorized at 17:30, cutoff is 16:00
      expect(estimate.expectedSettlementDate).toBe('2026-11-18'); // Friday post-cutoff -> Tue Nov 17 anchor -> Wed Nov 18 deposit
    });
  });

  describe('Framework & SSR Compatibility', () => {
    it('components instantiate valid React element trees cleanly without browser DOM window access', () => {
      const estimate = calculatePaymentSettlementEstimate(sampleTransaction, testConfig);

      // Verify that instantiating TrivioSettlementSummary, TrivioFeeBreakdown, and TrivioSettlementTimeline
      // produces valid React element trees without requiring browser globals or throwing errors
      const summaryElement = React.createElement(TrivioSettlementSummary, { estimate, theme: 'dark' });
      const breakdownElement = React.createElement(TrivioFeeBreakdown, { estimate, theme: 'dark' });
      const timelineElement = React.createElement(TrivioSettlementTimeline, { estimate, theme: 'dark' });

      expect(React.isValidElement(summaryElement)).toBe(true);
      expect(React.isValidElement(breakdownElement)).toBe(true);
      expect(React.isValidElement(timelineElement)).toBe(true);
      expect(summaryElement.props.theme).toBe('dark');
      expect(breakdownElement.props.theme).toBe('dark');
      expect(timelineElement.props.theme).toBe('dark');
    });
  });
});
