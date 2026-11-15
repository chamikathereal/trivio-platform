// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/react/src/index.ts
 * @description Trivio React Developer SDK (@trivio.ink/react).
 * Reusable, accessible, themeable UI components and hooks for payment settlement intelligence.
 */

// 1. Components
export { TrivioSettlementSummary } from './components/TrivioSettlementSummary.js';
export { TrivioFeeBreakdown, FeeBreakdown } from './components/TrivioFeeBreakdown.js';
export { TrivioSettlementTimeline } from './components/TrivioSettlementTimeline.js';

// 2. Context & Provider
export { TrivioProvider, useTrivio } from './context.js';

// 3. Hooks
export { useTrivioSettlementEstimate } from './hooks/useTrivioSettlementEstimate.js';

// 4. Formatters & Zero-Float Utilities
export {
  getCurrencyDecimals,
  formatMinorAmount,
  formatCurrency,
  formatRateBps,
  formatDisplayDate,
} from './formatters.js';

// 5. Brand Tokens & Theme Utilities
export {
  TRIVIO_TOKENS,
  getThemePalette,
  getCardStyle,
  getBadgeStyle,
} from './theme.js';

// 6. Types
export type {
  TrivioTheme,
  TrivioContextValue,
  TrivioProviderProps,
  TrivioSettlementSummaryProps,
  TrivioFeeBreakdownProps,
  TrivioSettlementTimelineProps,
  SettlementTimelineStep,
  UseTrivioSettlementEstimateResult,
} from './types.js';

// 7. Re-exports from @trivio.ink/core for consumer convenience
export {
  estimatePercentageFee,
  type FeeEstimateResult,
  TrivioValidationError,
  TrivioRangeError,
  RuleNotFoundError,
  RuleConflictError,
  SettlementPolicyNotFoundError,
  SettlementPolicyConflictError,
  calculatePaymentSettlementEstimate,
  type IntegratedSettlementEstimateResult,
  type DynamicFeeEstimateResult,
  type SettlementEstimateResult,
  type IntegratedTransactionInput,
  type IntegratedSettlementConfig,
  type IntegratedSettlementOptions,
} from '@trivio.ink/core';
