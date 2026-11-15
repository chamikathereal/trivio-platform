// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/react/src/types.ts
 * @description Type definitions for Trivio React settlement UI components and hooks.
 */

import type { ReactNode } from 'react';
import type {
  IntegratedSettlementEstimateResult,
  DynamicFeeEstimateResult,
  FeeEstimateResult,
  SettlementEstimateResult,
} from '@trivio.ink/core';

/**
 * UI Theme options supported by Trivio components.
 */
export type TrivioTheme = 'light' | 'dark' | 'auto';

/**
 * Context configuration value for Trivio React components.
 * Contains presentation and display settings only (theme, currency, locale).
 * Never contains fallback financial rates or automated fee defaults.
 */
export interface TrivioContextValue {
  /** Default ISO 4217 currency code (e.g. 'USD', 'LKR', 'EUR'). Defaults to 'USD'. */
  currencyCode: string;
  /** Active theme mode for components under this provider. */
  theme: TrivioTheme;
  /** Optional locale identifier for number/date display (e.g. 'en-US'). */
  locale?: string;
}

/**
 * Props for `TrivioProvider`.
 */
export interface TrivioProviderProps {
  /** Optional default currency code for child components. */
  currencyCode?: string;
  /** UI theme mode ('light', 'dark', or 'auto'). Defaults to 'auto'. */
  theme?: TrivioTheme;
  /** Optional locale identifier. */
  locale?: string;
  /** Child elements. */
  children: ReactNode;
}

/**
 * Props for `TrivioSettlementSummary`.
 */
export interface TrivioSettlementSummaryProps {
  /** Integrated calculation estimate returned by Trivio core or Node client. */
  estimate?: IntegratedSettlementEstimateResult | null;
  /** Direct gross transaction amount in integer minor units (e.g. 1000000 for 10,000.00). */
  grossMinor?: number | bigint;
  /** Direct fee deduction amount in integer minor units. */
  feeMinor?: number | bigint;
  /** Direct net settlement amount in integer minor units. */
  netMinor?: number | bigint;
  /** Forecasted settlement deposit date string (e.g. '2026-11-18'). */
  expectedSettlementDate?: string;
  /** ISO 4217 currency code (e.g. 'USD', 'LKR'). */
  currencyCode?: string;
  /** Human-readable settlement cycle description (e.g. 'T+1 Business Days'). */
  settlementCycle?: string;
  /** Explicit indicator that this is an estimated calculation, not a confirmed deposit. Defaults to true. */
  isEstimated?: boolean;
  /** Whether transaction occurred after the daily cut-off window. */
  isPostCutOff?: boolean;
  /** Whether the settlement date was deferred across a weekend or bank holiday. */
  isDeferred?: boolean;
  /** Component theme mode override. */
  theme?: TrivioTheme;
  /** Optional CSS class name for the root element. */
  className?: string;
  /** Whether to render the non-binding estimate legal disclaimer footer. Defaults to true. */
  showDisclaimer?: boolean;
  /** Test identifier attribute for testing. */
  testId?: string;
}

/**
 * Props for `TrivioFeeBreakdown`.
 */
export interface TrivioFeeBreakdownProps {
  /** Integrated calculation estimate containing fee details. */
  estimate?: IntegratedSettlementEstimateResult | null;
  /** Fee engine estimate result containing breakdown details. */
  feeResult?: DynamicFeeEstimateResult | FeeEstimateResult | null;
  /** Direct gross transaction amount in minor units. */
  grossMinor?: number | bigint;
  /** Direct fee rate in basis points (e.g. 250 for 2.50%). */
  rateBasisPoints?: number;
  /** ISO 4217 currency code override. */
  currencyCode?: string;
  /** Whether to render the applied rule audit snapshot drawer. Defaults to false. */
  showRuleSnapshot?: boolean;
  /** Component theme mode override. */
  theme?: TrivioTheme;
  /** Optional CSS class name. */
  className?: string;
  /** Test identifier attribute. */
  testId?: string;
}

/**
 * Single step entry for visual settlement timeline representation.
 */
export interface SettlementTimelineStep {
  /** Unique key for the step. */
  id: string;
  /** Step heading title. */
  title: string;
  /** Step explanatory description or detail. */
  description: string;
  /** Status indicator for step styling. */
  status: 'completed' | 'in_progress' | 'adjusted' | 'pending';
  /** Optional badge label (e.g. 'Cut-off +1d', 'Sunday Holiday'). */
  badge?: string;
  /** Optional date/time string associated with the step. */
  timestamp?: string;
}

/**
 * Props for `TrivioSettlementTimeline`.
 */
export interface TrivioSettlementTimelineProps {
  /** Integrated calculation estimate containing timeline data. */
  estimate?: IntegratedSettlementEstimateResult | null;
  /** Settlement engine date estimate result. */
  settlementDateResult?: SettlementEstimateResult | null;
  /** Custom timeline steps override. */
  customSteps?: SettlementTimelineStep[];
  /** Currency code for monetary labels. */
  currencyCode?: string;
  /** Component theme mode override. */
  theme?: TrivioTheme;
  /** Optional CSS class name. */
  className?: string;
  /** Test identifier attribute. */
  testId?: string;
}

/**
 * Return shape of the `useTrivioSettlementEstimate` calculation hook.
 */
export interface UseTrivioSettlementEstimateResult {
  /** Memoized calculation result or null if input is incomplete or calculation fails. */
  estimate: IntegratedSettlementEstimateResult | null;
  /** Error object if calculation or validation failed, otherwise null. */
  error: Error | null;
  /** Loading state indicator. */
  isLoading: boolean;
}
