// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/node/src/index.ts
 * @description Server-side Node.js SDK for Trivio Payment Settlement Intelligence.
 */

// Export Node Client and Node-specific types
export {
  TrivioClient,
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
} from './client.js';

export type {
  TrivioClientOptions,
  TrivioLedgerRecord,
} from './types.js';

// Re-export Core Calculation Primitives
export {
  // Stage 1 primitive
  estimatePercentageFee,
  type FeeEstimateResult,

  // Stage 2A dynamic fee engine
  calculateFeeEstimate,
  findMatchingRule,
  calculatePercentageFee,
  roundHalfUpDiv,
  type TransactionInput,
  type MerchantFeeRule,
  type FeeStructure,
  type DynamicFeeEstimateResult,
  type FeeCalculationOptions,
  type FeeBreakdownDetails,
  type AppliedRuleSnapshot,
  type CardScheme,
  type CardFundingType,
  type CardRegion,
  type RateSource,
  type TaxAdjustmentConfig,

  // Stage 2B settlement calendar engine
  estimateSettlementDate,
  DEFAULT_SETTLEMENT_CALCULATION_VERSION,
  parseISODate,
  formatISODate,
  getISOWeekday,
  addCalendarDays,
  daysBetween,
  isWorkingDay,
  isHoliday,
  findEligibleWorkingDay,
  getNextWorkingDay,
  addBusinessDays,
  adjustNonWorkingDay,
  validateIanaTimeZone,
  parseIsoTimestamp,
  getZonedDateTimeParts,
  type SettlementTransactionInput,
  type SettlementPolicy,
  type SettlementCalendar,
  type AppliedSettlementPolicySnapshot,
  type SettlementCalculationOptions,
  type SettlementEstimateResult,
  type CycleUnit,
  type NonWorkingDayHandlingConvention,
  type ZonedDateTimeParts,
  type ParsedDate,

  // Stage 2C integrated settlement engine
  calculatePaymentSettlementEstimate,
  DEFAULT_INTEGRATED_CALCULATION_VERSION,
  type IntegratedTransactionInput,
  type IntegratedSettlementConfig,
  type IntegratedSettlementOptions,
  type IntegratedSettlementEstimateResult,

  // Domain Errors
  TrivioError,
  TrivioValidationError,
  TrivioRangeError,
  RuleNotFoundError,
  RuleConflictError,
  NegativeNetSettlementError,
  SettlementPolicyNotFoundError,
  SettlementPolicyConflictError,
  SettlementCalendarNotFoundError,
  SettlementValidationError,
  SettlementRangeError,
} from '@trivio.ink/core';
