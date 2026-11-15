/**
 * @file packages/react/src/index.ts
 * @description Reusable React components and hooks for Trivio payment settlement intelligence.
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  estimatePercentageFee,
  type FeeEstimateResult,
  TrivioValidationError,
  TrivioRangeError,
} from '@trivio.ink/core';

export {
  estimatePercentageFee,
  type FeeEstimateResult,
  TrivioValidationError,
  TrivioRangeError,
};

/**
 * Context configuration for Trivio UI components.
 */
export interface TrivioContextValue {
  /** Default ISO 4217 currency code (e.g. 'LKR', 'USD', 'EUR'). Defaults to 'USD'. */
  currencyCode: string;
  /** Default fallback rate in basis points (e.g. 250 for 2.50%). */
  defaultRateBps: number;
}

const defaultContextValue: TrivioContextValue = {
  currencyCode: 'USD',
  defaultRateBps: 0,
};

const TrivioContext = createContext<TrivioContextValue>(defaultContextValue);

/**
 * Props for `TrivioProvider`.
 */
export interface TrivioProviderProps {
  /** Optional custom currency code for child components. */
  currencyCode?: string;
  /** Optional default fallback rate in basis points. */
  defaultRateBps?: number;
  /** Child React elements. */
  children: ReactNode;
}

/**
 * Context provider establishing configuration defaults for Trivio settlement components.
 */
export function TrivioProvider({
  currencyCode = 'USD',
  defaultRateBps = 0,
  children,
}: TrivioProviderProps): React.JSX.Element {
  const value = useMemo(
    () => ({
      currencyCode,
      defaultRateBps,
    }),
    [currencyCode, defaultRateBps]
  );

  return React.createElement(TrivioContext.Provider, { value }, children);
}

/**
 * Hook to access current Trivio context configuration.
 */
export function useTrivio(): TrivioContextValue {
  return useContext(TrivioContext);
}

/**
 * Props for `FeeBreakdown` component.
 */
export interface FeeBreakdownProps {
  /** Gross transaction amount in minor currency units. */
  grossMinor: number;
  /** Fee rate in basis points (0 to 10,000). If omitted, uses defaultRateBps from context. */
  rateBasisPoints?: number;
  /** Optional custom currency code override. */
  currencyCode?: string;
  /** Optional CSS class name for styling. */
  className?: string;
}

/**
 * Formats a minor currency amount into a decimal string (e.g. 1000000 -> "10000.00").
 */
export function formatMinorAmount(minor: number): string {
  return (minor / 100).toFixed(2);
}

/**
 * Formats basis points into a percentage string (e.g. 250 bps -> "2.50%").
 */
export function formatRateBps(rateBps: number): string {
  return `${(rateBps / 100).toFixed(2)}%`;
}

/**
 * Foundational presentation component displaying an estimated fee settlement breakdown.
 */
export function FeeBreakdown({
  grossMinor,
  rateBasisPoints,
  currencyCode: propCurrencyCode,
  className = 'trivio-fee-breakdown',
}: FeeBreakdownProps): React.JSX.Element {
  const context = useTrivio();
  const effectiveCurrency = propCurrencyCode ?? context.currencyCode;
  const effectiveRateBps = rateBasisPoints ?? context.defaultRateBps;

  const estimate = useMemo(() => {
    return estimatePercentageFee(grossMinor, effectiveRateBps);
  }, [grossMinor, effectiveRateBps]);

  return React.createElement(
    'div',
    { className, 'data-testid': 'trivio-fee-breakdown' },
    React.createElement(
      'dl',
      { className: 'trivio-breakdown-list' },
      React.createElement('dt', null, 'Gross Amount'),
      React.createElement(
        'dd',
        { 'data-testid': 'breakdown-gross' },
        `${effectiveCurrency} ${formatMinorAmount(estimate.grossMinor)}`
      ),
      React.createElement(
        'dt',
        null,
        `Estimated Fee (${formatRateBps(estimate.rateBasisPoints)})`
      ),
      React.createElement(
        'dd',
        { 'data-testid': 'breakdown-fee' },
        `${effectiveCurrency} ${formatMinorAmount(estimate.feeMinor)}`
      ),
      React.createElement('dt', null, 'Estimated Net Settlement'),
      React.createElement(
        'dd',
        { 'data-testid': 'breakdown-net' },
        `${effectiveCurrency} ${formatMinorAmount(estimate.netMinor)}`
      )
    )
  );
}
