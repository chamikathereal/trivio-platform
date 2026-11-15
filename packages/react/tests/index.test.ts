import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  TrivioProvider,
  useTrivio,
  FeeBreakdown,
  formatMinorAmount,
  formatRateBps,
} from '../src/index.js';

describe('@trivio.ink/react foundation', () => {
  describe('Formatting helpers', () => {
    it('formats minor amounts into standard 2-decimal currency representation', () => {
      expect(formatMinorAmount(1_000_000)).toBe('10000.00');
      expect(formatMinorAmount(25_000)).toBe('250.00');
      expect(formatMinorAmount(0)).toBe('0.00');
      expect(formatMinorAmount(50)).toBe('0.50');
    });

    it('formats basis points into percentage representation', () => {
      expect(formatRateBps(250)).toBe('2.50%');
      expect(formatRateBps(150)).toBe('1.50%');
      expect(formatRateBps(10_000)).toBe('100.00%');
      expect(formatRateBps(0)).toBe('0.00%');
    });
  });

  describe('Component and Context Foundation', () => {
    it('exports TrivioProvider as a valid React component function', () => {
      expect(typeof TrivioProvider).toBe('function');
    });

    it('exports useTrivio as a valid hook function', () => {
      expect(typeof useTrivio).toBe('function');
    });

    it('exports FeeBreakdown as a valid React component function', () => {
      expect(typeof FeeBreakdown).toBe('function');
    });

    it('instantiates FeeBreakdown component tree without throwing', () => {
      // Testing React element instantiation
      const element = React.createElement(FeeBreakdown, {
        grossMinor: 1_000_000,
        rateBasisPoints: 250,
        currencyCode: 'LKR',
      });

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.grossMinor).toBe(1_000_000);
      expect(element.props.rateBasisPoints).toBe(250);
      expect(element.props.currencyCode).toBe('LKR');
    });

    it('instantiates TrivioProvider element tree', () => {
      const element = React.createElement(
        TrivioProvider,
        { currencyCode: 'USD', defaultRateBps: 200 },
        React.createElement(FeeBreakdown, { grossMinor: 50_000 })
      );

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.currencyCode).toBe('USD');
      expect(element.props.defaultRateBps).toBe(200);
    });
  });
});
