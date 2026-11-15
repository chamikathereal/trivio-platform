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
