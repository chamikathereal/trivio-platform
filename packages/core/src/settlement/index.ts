/**
 * @file packages/core/src/settlement/index.ts
 * @description Public exports for Trivio settlement calendar and date forecasting engine.
 */

// Errors
export {
  SettlementPolicyNotFoundError,
  SettlementPolicyConflictError,
  SettlementCalendarNotFoundError,
  SettlementValidationError,
  SettlementRangeError,
} from './errors.js';

// Types
export type {
  CycleUnit,
  NonWorkingDayHandlingConvention,
  SettlementTransactionInput,
  SettlementPolicy,
  SettlementCalendar,
  AppliedSettlementPolicySnapshot,
  SettlementCalculationOptions,
  SettlementEstimateResult,
} from './types.js';

// Timezone primitives
export {
  validateIanaTimeZone,
  parseIsoTimestamp,
  getZonedDateTimeParts,
  type ZonedDateTimeParts,
} from './timezone.js';

// Calendar primitives
export {
  MAX_CALENDAR_SEARCH_DAYS,
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
  type ParsedDate,
} from './calendar.js';

// Validation primitives
export {
  validateAndNormalizeSettlementTransaction,
  validateAndNormalizeSettlementCalendar,
  validateAndNormalizeSettlementCalendars,
  validateAndNormalizeSettlementPolicy,
  validateAndNormalizeSettlementPolicies,
  normalizeCutOffTime,
  arePoliciesIdentical,
  type NormalizedSettlementTransaction,
  type NormalizedSettlementCalendar,
  type NormalizedSettlementPolicy,
} from './validation.js';

// Policy matcher
export {
  SETTLEMENT_SPECIFICITY_WEIGHTS,
  calculateSettlementSpecificityScore,
  isSettlementPolicyEligible,
  findMatchingSettlementPolicy,
  type MatchedSettlementPolicyCandidate,
} from './policy-matcher.js';

// Engine
export {
  estimateSettlementDate,
  DEFAULT_SETTLEMENT_CALCULATION_VERSION,
} from './calculation.js';
