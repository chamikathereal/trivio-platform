// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/index.ts
 * @description Trivio Payment Settlement Intelligence Core Engine.
 * Provides deterministic, zero-dependency financial calculation primitives.
 */

// 1. Errors
export {
  TrivioError,
  TrivioValidationError,
  TrivioRangeError,
  RuleNotFoundError,
  RuleConflictError,
  NegativeNetSettlementError,
} from './types/errors.js';

// 2. Transaction types
export type {
  CardScheme,
  CardFundingType,
  CardRegion,
  TransactionInput,
} from './types/transaction.js';

// 3. Rule types
export type {
  RateSource,
  TaxAdjustmentConfig,
  FeeStructure,
  MerchantFeeRule,
} from './types/rule.js';

// 4. Result types
export type {
  FeeBreakdownDetails,
  AppliedRuleSnapshot,
  DynamicFeeEstimateResult,
  FeeCalculationOptions,
} from './types/result.js';

// 5. Arithmetic primitives and constants
export {
  BASIS_POINTS_DIVISOR,
  MIN_SUPPORTED_RATE_BPS,
  MAX_SUPPORTED_RATE_BPS,
  DEFAULT_CALCULATION_POLICY,
  roundHalfUpDiv,
  calculatePercentageFee,
} from './arithmetic/monetary.js';

// 6. Validation functions
export {
  validateAndNormalizeTransaction,
  type NormalizedTransaction,
} from './validation/transaction.js';

export {
  validateAndNormalizeRule,
  validateAndNormalizeRules,
  type NormalizedFeeRule,
} from './validation/rule.js';

// 7. Rule matcher
export {
  calculateSpecificityScore,
  isRuleEligible,
  findMatchingRule,
  type MatchedRuleCandidate,
} from './rules/matcher.js';

// 8. Main Dynamic Fee Engine
export { calculateFeeEstimate } from './engine/calculate.js';

// 9. Legacy Stage 1 primitive (backward compatibility)
export {
  estimatePercentageFee,
  type FeeEstimateResult,
} from './legacy.js';

// 10. Stage 2B Settlement Errors
export {
  SettlementPolicyNotFoundError,
  SettlementPolicyConflictError,
  SettlementCalendarNotFoundError,
  SettlementValidationError,
  SettlementRangeError,
} from './settlement/index.js';

// 11. Stage 2B Settlement Types
export type {
  CycleUnit,
  NonWorkingDayHandlingConvention,
  SettlementTransactionInput,
  SettlementPolicy,
  SettlementCalendar,
  AppliedSettlementPolicySnapshot,
  SettlementCalculationOptions,
  SettlementEstimateResult,
  ZonedDateTimeParts,
  ParsedDate,
  NormalizedSettlementTransaction,
  NormalizedSettlementCalendar,
  NormalizedSettlementPolicy,
  MatchedSettlementPolicyCandidate,
} from './settlement/index.js';

// 12. Stage 2B Settlement Engine and Calendar Primitives
export {
  estimateSettlementDate,
  DEFAULT_SETTLEMENT_CALCULATION_VERSION,
  SETTLEMENT_SPECIFICITY_WEIGHTS,
  MAX_CALENDAR_SEARCH_DAYS,
  validateIanaTimeZone,
  parseIsoTimestamp,
  getZonedDateTimeParts,
  parseISODate,
  formatISODate,
  getISOWeekday,
  addCalendarDays,
  daysBetween,
  isHoliday,
  isWorkingDay,
  findEligibleWorkingDay,
  getNextWorkingDay,
  addBusinessDays,
  adjustNonWorkingDay,
  validateAndNormalizeSettlementTransaction,
  validateAndNormalizeSettlementCalendar,
  validateAndNormalizeSettlementCalendars,
  validateAndNormalizeSettlementPolicy,
  validateAndNormalizeSettlementPolicies,
  normalizeCutOffTime,
  arePoliciesIdentical,
  calculateSettlementSpecificityScore,
  isSettlementPolicyEligible,
  findMatchingSettlementPolicy,
} from './settlement/index.js';

// 13. Stage 2C Integrated Settlement Engine
export {
  calculatePaymentSettlementEstimate,
  DEFAULT_INTEGRATED_CALCULATION_VERSION,
} from './integrated/index.js';

// 14. Stage 2C Integrated Types
export type {
  IntegratedTransactionInput,
  IntegratedSettlementConfig,
  IntegratedSettlementOptions,
  IntegratedSettlementEstimateResult,
} from './integrated/index.js';
