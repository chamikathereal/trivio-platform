// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/settlement/errors.ts
 * @description Typed error hierarchy for Trivio settlement calendar and date estimation primitives.
 */

import {
  TrivioError,
  TrivioRangeError,
  TrivioValidationError,
} from '../types/errors.js';

/**
 * Error thrown when no matching settlement policy is found for a given transaction context.
 */
export class SettlementPolicyNotFoundError extends TrivioError {
  public readonly transactionDetails: {
    acquirerId: string;
    currency: string;
    transactionTime: string;
    merchantId?: string;
    terminalId?: string;
  };

  constructor(
    message: string,
    transactionDetails: {
      acquirerId: string;
      currency: string;
      transactionTime: string;
      merchantId?: string;
      terminalId?: string;
    }
  ) {
    super(message);
    this.name = 'SettlementPolicyNotFoundError';
    this.transactionDetails = transactionDetails;
    Object.setPrototypeOf(this, SettlementPolicyNotFoundError.prototype);
  }
}

/**
 * Error thrown when multiple candidate settlement policies tie at the highest priority
 * and specificity with conflicting terms.
 */
export class SettlementPolicyConflictError extends TrivioError {
  public readonly conflictingPolicyIds: string[];

  constructor(message: string, conflictingPolicyIds: string[]) {
    super(message);
    this.name = 'SettlementPolicyConflictError';
    this.conflictingPolicyIds = conflictingPolicyIds;
    Object.setPrototypeOf(this, SettlementPolicyConflictError.prototype);
  }
}

/**
 * Error thrown when a matched policy references a calendar ID that was not provided.
 */
export class SettlementCalendarNotFoundError extends TrivioError {
  public readonly calendarId: string;
  public readonly policyId: string;

  constructor(calendarId: string, policyId: string) {
    super(
      `Settlement calendar "${calendarId}" referenced by policy "${policyId}" was not found in the supplied calendars list.`
    );
    this.name = 'SettlementCalendarNotFoundError';
    this.calendarId = calendarId;
    this.policyId = policyId;
    Object.setPrototypeOf(this, SettlementCalendarNotFoundError.prototype);
  }
}

/**
 * Error thrown when settlement input values fail type, format, or structure validation.
 */
export class SettlementValidationError extends TrivioValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'SettlementValidationError';
    Object.setPrototypeOf(this, SettlementValidationError.prototype);
  }
}

/**
 * Error thrown when settlement values violate mathematical or domain boundary bounds.
 */
export class SettlementRangeError extends TrivioRangeError {
  constructor(message: string) {
    super(message);
    this.name = 'SettlementRangeError';
    Object.setPrototypeOf(this, SettlementRangeError.prototype);
  }
}
