/**
 * @file packages/core/src/types/errors.ts
 * @description Typed error hierarchy for Trivio payment settlement calculation primitives.
 */

/**
 * Base error class for all Trivio domain errors.
 */
export class TrivioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrivioError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when an input value fails type, format, or structure validation.
 * Inherits from TypeError for backwards compatibility with Stage 1.
 */
export class TrivioValidationError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = 'TrivioValidationError';
    Object.setPrototypeOf(this, TrivioValidationError.prototype);
  }
}

/**
 * Error thrown when an input value violates mathematical or business numerical bounds.
 * Inherits from RangeError for backwards compatibility with Stage 1.
 */
export class TrivioRangeError extends RangeError {
  constructor(message: string) {
    super(message);
    this.name = 'TrivioRangeError';
    Object.setPrototypeOf(this, TrivioRangeError.prototype);
  }
}

/**
 * Error thrown when no matching fee agreement rule is found for a given transaction context.
 */
export class RuleNotFoundError extends TrivioError {
  public readonly transactionDetails: {
    acquirerId: string;
    currency: string;
    transactionDate: string;
    terminalId?: string;
    cardScheme?: string;
  };

  constructor(
    message: string,
    transactionDetails: {
      acquirerId: string;
      currency: string;
      transactionDate: string;
      terminalId?: string;
      cardScheme?: string;
    }
  ) {
    super(message);
    this.name = 'RuleNotFoundError';
    this.transactionDetails = transactionDetails;
    Object.setPrototypeOf(this, RuleNotFoundError.prototype);
  }
}

/**
 * Error thrown when multiple candidate fee rules are equally eligible and conflict without
 * an unambiguous priority or specificity resolution.
 */
export class RuleConflictError extends TrivioError {
  public readonly conflictingRuleIds: string[];

  constructor(message: string, conflictingRuleIds: string[]) {
    super(message);
    this.name = 'RuleConflictError';
    this.conflictingRuleIds = conflictingRuleIds;
    Object.setPrototypeOf(this, RuleConflictError.prototype);
  }
}

/**
 * Error thrown when calculated merchant fees exceed the gross transaction amount,
 * resulting in a negative net settlement, unless explicitly permitted by policy.
 */
export class NegativeNetSettlementError extends TrivioError {
  public readonly grossMinor: number;
  public readonly totalFeeMinor: number;
  public readonly netMinor: number;

  constructor(grossMinor: number, totalFeeMinor: number, netMinor: number) {
    super(
      `Calculated merchant fee (${totalFeeMinor} minor units) exceeds gross transaction amount (${grossMinor} minor units), ` +
      `resulting in a negative net settlement (${netMinor} minor units).`
    );
    this.name = 'NegativeNetSettlementError';
    this.grossMinor = grossMinor;
    this.totalFeeMinor = totalFeeMinor;
    this.netMinor = netMinor;
    Object.setPrototypeOf(this, NegativeNetSettlementError.prototype);
  }
}
