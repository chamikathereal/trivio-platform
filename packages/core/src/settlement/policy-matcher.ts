// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/settlement/policy-matcher.ts
 * @description Deterministic settlement policy matching and conflict resolution engine.
 */

import {
  SettlementPolicyConflictError,
  SettlementPolicyNotFoundError,
} from './errors.js';
import { getZonedDateTimeParts } from './timezone.js';
import {
  arePoliciesIdentical,
  type NormalizedSettlementPolicy,
  type NormalizedSettlementTransaction,
} from './validation.js';

export const SETTLEMENT_SPECIFICITY_WEIGHTS = {
  TERMINAL: 100_000,
  MERCHANT: 10_000,
  CURRENCY: 1,
} as const;

export interface MatchedSettlementPolicyCandidate {
  policy: NormalizedSettlementPolicy;
  specificityScore: number;
  localTransactionDate: string;
}

/**
 * Computes the specificity score of a settlement policy relative to transaction criteria.
 */
export function calculateSettlementSpecificityScore(
  policy: NormalizedSettlementPolicy
): number {
  let score = 0;
  if (policy.terminalId !== undefined) {
    score += SETTLEMENT_SPECIFICITY_WEIGHTS.TERMINAL;
  }
  if (policy.merchantId !== undefined) {
    score += SETTLEMENT_SPECIFICITY_WEIGHTS.MERCHANT;
  }
  if (policy.currency !== undefined) {
    score += SETTLEMENT_SPECIFICITY_WEIGHTS.CURRENCY;
  }
  return score;
}

/**
 * Checks whether a candidate settlement policy is eligible for a given transaction context.
 */
export function isSettlementPolicyEligible(
  policy: NormalizedSettlementPolicy,
  tx: NormalizedSettlementTransaction
): { eligible: boolean; localDate?: string } {
  // 1. Acquirer must match exactly
  if (policy.acquirerId !== tx.acquirerId) {
    return { eligible: false };
  }

  // 2. Currency check
  if (policy.currency !== undefined && policy.currency !== tx.currency) {
    return { eligible: false };
  }

  // 3. Merchant check
  if (policy.merchantId !== undefined) {
    if (tx.merchantId === undefined || tx.merchantId !== policy.merchantId) {
      return { eligible: false };
    }
  }

  // 4. Terminal check
  if (policy.terminalId !== undefined) {
    if (tx.terminalId === undefined || tx.terminalId !== policy.terminalId) {
      return { eligible: false };
    }
  }

  // 5. Date effectiveness in policy's processing timezone
  const parts = getZonedDateTimeParts(tx.instant, policy.timeZone);
  const localDate = parts.localDate;

  if (localDate < policy.effectiveFrom) {
    return { eligible: false };
  }

  if (policy.effectiveTo !== undefined && localDate > policy.effectiveTo) {
    return { eligible: false };
  }

  return { eligible: true, localDate };
}

/**
 * Finds the single most specific, highest-priority matching settlement policy for a transaction.
 *
 * @param policies - Array of normalized settlement policies.
 * @param tx - Normalized transaction context.
 * @returns The winning candidate settlement policy and its transaction local date.
 * @throws {SettlementPolicyNotFoundError} If no policy matches the transaction context.
 * @throws {SettlementPolicyConflictError} If multiple distinct policies tie at highest priority and specificity.
 */
export function findMatchingSettlementPolicy(
  policies: NormalizedSettlementPolicy[],
  tx: NormalizedSettlementTransaction
): MatchedSettlementPolicyCandidate {
  // Enforce input-order independence by sorting candidate policies deterministically by id
  const sortedPolicies = [...policies].sort((a, b) => a.id.localeCompare(b.id));

  const eligibleCandidates: MatchedSettlementPolicyCandidate[] = [];

  for (const policy of sortedPolicies) {
    const { eligible, localDate } = isSettlementPolicyEligible(policy, tx);
    if (eligible && localDate) {
      const specificityScore = calculateSettlementSpecificityScore(policy);
      eligibleCandidates.push({
        policy,
        specificityScore,
        localTransactionDate: localDate,
      });
    }
  }

  if (eligibleCandidates.length === 0) {
    throw new SettlementPolicyNotFoundError(
      `No matching settlement policy found for acquirer "${tx.acquirerId}", currency "${tx.currency}", at transaction time "${tx.transactionTime}".`,
      {
        acquirerId: tx.acquirerId,
        currency: tx.currency,
        transactionTime: tx.transactionTime,
        merchantId: tx.merchantId,
        terminalId: tx.terminalId,
      }
    );
  }

  // Sort eligible candidates by:
  // 1. Explicit priority descending
  // 2. Specificity score descending
  eligibleCandidates.sort((a, b) => {
    if (b.policy.priority !== a.policy.priority) {
      return b.policy.priority - a.policy.priority;
    }
    return b.specificityScore - a.specificityScore;
  });

  const winner = eligibleCandidates[0];
  if (!winner) {
    throw new SettlementPolicyNotFoundError(
      `No matching settlement policy found for acquirer "${tx.acquirerId}", currency "${tx.currency}", at transaction time "${tx.transactionTime}".`,
      {
        acquirerId: tx.acquirerId,
        currency: tx.currency,
        transactionTime: tx.transactionTime,
        merchantId: tx.merchantId,
        terminalId: tx.terminalId,
      }
    );
  }

  // Check for ambiguous ties with distinct policy terms
  if (eligibleCandidates.length > 1) {
    const runnerUp = eligibleCandidates[1];
    if (
      runnerUp &&
      runnerUp.policy.priority === winner.policy.priority &&
      runnerUp.specificityScore === winner.specificityScore
    ) {
      if (!arePoliciesIdentical(winner.policy, runnerUp.policy)) {
        throw new SettlementPolicyConflictError(
          `Ambiguous settlement policy match: multiple distinct policies (${winner.policy.id}, ${runnerUp.policy.id}) ` +
          `tied with priority ${winner.policy.priority} and specificity score ${winner.specificityScore}. ` +
          `Please define explicit priorities or narrower terminal/merchant scopes to resolve ambiguity.`,
          [winner.policy.id, runnerUp.policy.id]
        );
      }
    }
  }

  return winner;
}
