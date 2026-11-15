/**
 * @file packages/core/src/rules/matcher.ts
 * @description Deterministic rule selection and specificity matching engine.
 */

import { RuleConflictError, RuleNotFoundError } from '../types/errors.js';
import type { NormalizedFeeRule } from '../validation/rule.js';
import type { NormalizedTransaction } from '../validation/transaction.js';

export interface MatchedRuleCandidate {
  rule: NormalizedFeeRule;
  specificityScore: number;
}

/**
 * Calculates specificity score for a candidate rule based on criteria granularity.
 *
 * Uses strict hierarchical powers so that higher-level criteria (Terminal > Merchant >
 * Scheme > Funding Type > Region > Currency) cannot be accidentally outranked by any
 * combination of lower-level criteria:
 *
 * Terminal match:          +100,000  (Hardware-level agreement)
 * Merchant match:          +10,000   (Enterprise/merchant agreement; max lower sum = 1,111)
 * Card Scheme match:       +1,000    (Network agreement; max lower sum = 111)
 * Card Funding Type match: +100      (Product agreement; max lower sum = 11)
 * Card Region match:       +10       (Geographical jurisdiction; max lower sum = 1)
 * Currency match:          +1        (Currency constraint)
 */
export function calculateSpecificityScore(
  rule: NormalizedFeeRule,
  tx: NormalizedTransaction
): number {
  let score = 0;

  if (rule.terminalId && tx.terminalId && rule.terminalId === tx.terminalId) {
    score += 100_000;
  }
  if (rule.merchantId && rule.merchantId !== '*' && tx.merchantId && rule.merchantId === tx.merchantId) {
    score += 10_000;
  }
  if (rule.cardScheme && tx.cardScheme && rule.cardScheme.toLowerCase() === tx.cardScheme.toLowerCase()) {
    score += 1_000;
  }
  if (rule.cardFundingType && tx.cardFundingType && rule.cardFundingType.toLowerCase() === tx.cardFundingType.toLowerCase()) {
    score += 100;
  }
  if (rule.cardRegion && tx.cardRegion && rule.cardRegion.toLowerCase() === tx.cardRegion.toLowerCase()) {
    score += 10;
  }
  if (rule.currency && rule.currency.toUpperCase() === tx.currency) {
    score += 1;
  }

  return score;
}

/**
 * Determines whether a transaction satisfies all filtering predicates of a fee rule.
 */
export function isRuleEligible(rule: NormalizedFeeRule, tx: NormalizedTransaction): boolean {
  // 1. Acquirer match (mandatory)
  if (rule.acquirerId !== tx.acquirerId) {
    return false;
  }

  // 2. Currency match (optional filter on rule)
  if (rule.currency && rule.currency.toUpperCase() !== tx.currency) {
    return false;
  }

  // 3. Merchant scope
  if (rule.merchantId && rule.merchantId !== '*') {
    if (!tx.merchantId || rule.merchantId !== tx.merchantId) {
      return false;
    }
  }

  // 4. Terminal scope
  if (rule.terminalId) {
    if (!tx.terminalId || rule.terminalId !== tx.terminalId) {
      return false;
    }
  }

  // 5. Card scheme
  if (rule.cardScheme) {
    if (!tx.cardScheme || rule.cardScheme.toLowerCase() !== tx.cardScheme.toLowerCase()) {
      return false;
    }
  }

  // 6. Card funding type
  if (rule.cardFundingType) {
    if (!tx.cardFundingType || rule.cardFundingType.toLowerCase() !== tx.cardFundingType.toLowerCase()) {
      return false;
    }
  }

  // 7. Card region
  if (rule.cardRegion) {
    if (!tx.cardRegion || rule.cardRegion.toLowerCase() !== tx.cardRegion.toLowerCase()) {
      return false;
    }
  }

  // 8. Effective date window (inclusive start, exclusive end)
  const txTime = tx.transactionDate.getTime();
  if (txTime < rule.effectiveFrom.getTime()) {
    return false;
  }
  if (rule.effectiveTo && txTime >= rule.effectiveTo.getTime()) {
    return false;
  }

  return true;
}

/**
 * Selects the single most specific, highest-priority matching fee rule for a transaction.
 *
 * @param rules - List of candidate normalized fee rules.
 * @param tx - Normalized transaction context.
 * @returns The winning NormalizedFeeRule.
 * @throws {RuleNotFoundError} If no eligible rule matches.
 * @throws {RuleConflictError} If multiple conflicting rules have identical priority and specificity.
 */
export function findMatchingRule(
  rules: NormalizedFeeRule[],
  tx: NormalizedTransaction
): NormalizedFeeRule {
  const eligibleCandidates: MatchedRuleCandidate[] = [];

  for (const rule of rules) {
    if (isRuleEligible(rule, tx)) {
      const specificityScore = calculateSpecificityScore(rule, tx);
      eligibleCandidates.push({ rule, specificityScore });
    }
  }

  if (eligibleCandidates.length === 0) {
    throw new RuleNotFoundError(
      `No eligible fee agreement rule found for acquirer "${tx.acquirerId}" (Currency: ${tx.currency}, Date: ${tx.transactionDate.toISOString()})`,
      {
        acquirerId: tx.acquirerId,
        currency: tx.currency,
        transactionDate: tx.transactionDate.toISOString(),
        terminalId: tx.terminalId,
        cardScheme: tx.cardScheme,
      }
    );
  }

  // Sort candidates:
  // 1. Highest priority first
  // 2. Highest specificity first
  // 3. Deterministic tie-breaker by rule ID (guarantees identical result regardless of input array order)
  eligibleCandidates.sort((a, b) => {
    if (b.rule.priority !== a.rule.priority) {
      return b.rule.priority - a.rule.priority;
    }
    if (b.specificityScore !== a.specificityScore) {
      return b.specificityScore - a.specificityScore;
    }
    return a.rule.id.localeCompare(b.rule.id);
  });

  const best = eligibleCandidates[0]!;

  // Conflict detection:
  // Check if any distinct rule has the EXACT same priority and specificity.
  // In financial settlement systems, choosing arbitrarily between different agreement rules with distinct IDs
  // (even if fee structures are currently equivalent) produces misleading contract attribution.
  // Therefore, distinct rule agreements that tie in priority and specificity are strictly rejected.
  const conflicting = eligibleCandidates.filter(
    (c) =>
      c !== best &&
      c.rule.priority === best.rule.priority &&
      c.specificityScore === best.specificityScore &&
      c.rule.id !== best.rule.id
  );

  if (conflicting.length > 0) {
    const allConflictingIds = [best.rule.id, ...conflicting.map((c) => c.rule.id)];
    throw new RuleConflictError(
      `Found ${allConflictingIds.length} conflicting fee rules with identical priority (${best.rule.priority}) ` +
      `and specificity score (${best.specificityScore}): [${allConflictingIds.join(', ')}]. ` +
      `Configure explicit rule priorities or non-overlapping date ranges to resolve ambiguity.`,
      allConflictingIds
    );
  }

  return best.rule;
}
