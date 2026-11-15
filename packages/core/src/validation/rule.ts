/**
 * @file packages/core/src/validation/rule.ts
 * @description Validation and normalization for merchant fee rules.
 */

import {
  MIN_SUPPORTED_RATE_BPS,
  MAX_SUPPORTED_RATE_BPS,
} from '../arithmetic/monetary.js';
import { TrivioValidationError, TrivioRangeError } from '../types/errors.js';
import type { MerchantFeeRule } from '../types/rule.js';

export interface NormalizedFeeRule extends Omit<MerchantFeeRule, 'effectiveFrom' | 'effectiveTo'> {
  effectiveFrom: Date;
  effectiveTo?: Date;
  priority: number;
}

/**
 * Validates a single MerchantFeeRule and returns a normalized version.
 *
 * @param rule - Raw merchant fee rule.
 * @returns Normalized fee rule with validated timestamps and defaults.
 */
export function validateAndNormalizeRule(rule: MerchantFeeRule): NormalizedFeeRule {
  if (!rule || typeof rule !== 'object') {
    throw new TrivioValidationError('Merchant fee rule must be an object');
  }

  // 1. Validate ID
  if (typeof rule.id !== 'string' || rule.id.trim().length === 0) {
    throw new TrivioValidationError('Rule id must be a non-empty string');
  }

  // 2. Validate Version
  if (
    rule.version === undefined ||
    rule.version === null ||
    (typeof rule.version !== 'string' && typeof rule.version !== 'number') ||
    (typeof rule.version === 'string' && rule.version.trim().length === 0)
  ) {
    throw new TrivioValidationError('Rule version must be a non-empty string or number');
  }

  // 3. Validate Acquirer ID
  if (typeof rule.acquirerId !== 'string' || rule.acquirerId.trim().length === 0) {
    throw new TrivioValidationError(`Rule ${rule.id}: acquirerId must be a non-empty string`);
  }

  // 4. Validate Effective Dates
  let effFrom: Date;
  if (rule.effectiveFrom instanceof Date) {
    if (isNaN(rule.effectiveFrom.getTime())) {
      throw new TrivioValidationError(`Rule ${rule.id}: effectiveFrom Date is invalid`);
    }
    effFrom = new Date(rule.effectiveFrom.getTime());
  } else if (typeof rule.effectiveFrom === 'string') {
    effFrom = new Date(rule.effectiveFrom);
    if (isNaN(effFrom.getTime())) {
      throw new TrivioValidationError(
        `Rule ${rule.id}: effectiveFrom string could not be parsed into a valid timestamp`
      );
    }
  } else {
    throw new TrivioValidationError(
      `Rule ${rule.id}: effectiveFrom must be a Date object or valid ISO 8601 string`
    );
  }

  let effTo: Date | undefined;
  if (rule.effectiveTo !== undefined) {
    if (rule.effectiveTo instanceof Date) {
      if (isNaN(rule.effectiveTo.getTime())) {
        throw new TrivioValidationError(`Rule ${rule.id}: effectiveTo Date is invalid`);
      }
      effTo = new Date(rule.effectiveTo.getTime());
    } else if (typeof rule.effectiveTo === 'string') {
      effTo = new Date(rule.effectiveTo);
      if (isNaN(effTo.getTime())) {
        throw new TrivioValidationError(
          `Rule ${rule.id}: effectiveTo string could not be parsed into a valid timestamp`
        );
      }
    } else {
      throw new TrivioValidationError(
        `Rule ${rule.id}: effectiveTo must be a Date object or valid ISO 8601 string if provided`
      );
    }

    if (effTo.getTime() <= effFrom.getTime()) {
      throw new TrivioRangeError(
        `Rule ${rule.id}: effectiveTo (${effTo.toISOString()}) must be chronologically after effectiveFrom (${effFrom.toISOString()})`
      );
    }
  }

  // 5. Validate Priority
  let priority = 0;
  if (rule.priority !== undefined) {
    if (typeof rule.priority !== 'number' || !Number.isSafeInteger(rule.priority)) {
      throw new TrivioValidationError(`Rule ${rule.id}: priority must be a safe integer if provided`);
    }
    priority = rule.priority;
  }

  // 6. Validate Fee Structure
  const fs = rule.feeStructure;
  if (!fs || typeof fs !== 'object') {
    throw new TrivioValidationError(`Rule ${rule.id}: feeStructure must be an object`);
  }

  // MDR rate basis points
  if (typeof fs.rateBasisPoints !== 'number' || !Number.isSafeInteger(fs.rateBasisPoints)) {
    throw new TrivioValidationError(
      `Rule ${rule.id}: feeStructure.rateBasisPoints must be a safe integer, received: ${String(fs.rateBasisPoints)}`
    );
  }

  if (fs.rateBasisPoints < MIN_SUPPORTED_RATE_BPS || fs.rateBasisPoints > MAX_SUPPORTED_RATE_BPS) {
    throw new TrivioRangeError(
      `Rule ${rule.id}: feeStructure.rateBasisPoints must be between ${MIN_SUPPORTED_RATE_BPS} and ${MAX_SUPPORTED_RATE_BPS} bps (0% to 100%)`
    );
  }

  // Fixed fee
  if (fs.fixedFeeMinor !== undefined) {
    if (typeof fs.fixedFeeMinor !== 'number' || !Number.isSafeInteger(fs.fixedFeeMinor)) {
      throw new TrivioValidationError(
        `Rule ${rule.id}: feeStructure.fixedFeeMinor must be a safe integer if provided`
      );
    }
    if (fs.fixedFeeMinor < 0) {
      throw new TrivioRangeError(
        `Rule ${rule.id}: feeStructure.fixedFeeMinor must be non-negative, received: ${fs.fixedFeeMinor}`
      );
    }
  }

  // Min fee
  if (fs.minFeeMinor !== undefined) {
    if (typeof fs.minFeeMinor !== 'number' || !Number.isSafeInteger(fs.minFeeMinor)) {
      throw new TrivioValidationError(
        `Rule ${rule.id}: feeStructure.minFeeMinor must be a safe integer if provided`
      );
    }
    if (fs.minFeeMinor < 0) {
      throw new TrivioRangeError(
        `Rule ${rule.id}: feeStructure.minFeeMinor must be non-negative, received: ${fs.minFeeMinor}`
      );
    }
  }

  // Max fee
  if (fs.maxFeeMinor !== undefined) {
    if (typeof fs.maxFeeMinor !== 'number' || !Number.isSafeInteger(fs.maxFeeMinor)) {
      throw new TrivioValidationError(
        `Rule ${rule.id}: feeStructure.maxFeeMinor must be a safe integer if provided`
      );
    }
    if (fs.maxFeeMinor < 0) {
      throw new TrivioRangeError(
        `Rule ${rule.id}: feeStructure.maxFeeMinor must be non-negative, received: ${fs.maxFeeMinor}`
      );
    }
  }

  // Min vs Max boundary
  if (fs.minFeeMinor !== undefined && fs.maxFeeMinor !== undefined) {
    if (fs.minFeeMinor > fs.maxFeeMinor) {
      throw new TrivioRangeError(
        `Rule ${rule.id}: minFeeMinor (${fs.minFeeMinor}) cannot be greater than maxFeeMinor (${fs.maxFeeMinor})`
      );
    }
  }

  // Tax adjustment
  if (fs.taxAdjustment !== undefined) {
    if (typeof fs.taxAdjustment !== 'object' || fs.taxAdjustment === null) {
      throw new TrivioValidationError(`Rule ${rule.id}: feeStructure.taxAdjustment must be an object if provided`);
    }

    if (fs.taxAdjustment.rateBasisPoints !== undefined) {
      if (
        typeof fs.taxAdjustment.rateBasisPoints !== 'number' ||
        !Number.isSafeInteger(fs.taxAdjustment.rateBasisPoints) ||
        fs.taxAdjustment.rateBasisPoints < 0 ||
        fs.taxAdjustment.rateBasisPoints > MAX_SUPPORTED_RATE_BPS
      ) {
        throw new TrivioRangeError(
          `Rule ${rule.id}: feeStructure.taxAdjustment.rateBasisPoints must be an integer between 0 and 10000`
        );
      }
    }

    if (fs.taxAdjustment.fixedMinor !== undefined) {
      if (
        typeof fs.taxAdjustment.fixedMinor !== 'number' ||
        !Number.isSafeInteger(fs.taxAdjustment.fixedMinor) ||
        fs.taxAdjustment.fixedMinor < 0
      ) {
        throw new TrivioRangeError(
          `Rule ${rule.id}: feeStructure.taxAdjustment.fixedMinor must be a non-negative integer`
        );
      }
    }
  }

  return {
    ...rule,
    id: rule.id.trim(),
    acquirerId: rule.acquirerId.trim(),
    effectiveFrom: effFrom,
    effectiveTo: effTo,
    priority,
    rateSource: rule.rateSource ?? 'merchant_configured',
  };
}

/**
 * Validates an array of fee rules.
 *
 * @param rules - Array of candidate fee rules.
 * @returns Array of normalized fee rules.
 */
export function validateAndNormalizeRules(rules: MerchantFeeRule[]): NormalizedFeeRule[] {
  if (!Array.isArray(rules)) {
    throw new TrivioValidationError('Fee rules configuration must be an array of MerchantFeeRule objects');
  }

  return rules.map(validateAndNormalizeRule);
}
