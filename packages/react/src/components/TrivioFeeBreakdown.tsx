// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/react/src/components/TrivioFeeBreakdown.tsx
 * @description Accessible itemized fee breakdown displaying percentage MDR, fixed fee,
 * cap adjustments, tax levies, total fee deductions, and net settlement proceeds.
 */

import React, { useMemo, useState } from 'react';
import type { TrivioFeeBreakdownProps } from '../types.js';
import { useTrivio } from '../context.js';
import { formatCurrency, formatRateBps } from '../formatters.js';
import { getCardStyle, getBadgeStyle, getThemePalette } from '../theme.js';
import { estimatePercentageFee, TrivioValidationError } from '@trivio.ink/core';

/**
 * Itemized financial fee breakdown presentation component.
 *
 * Renders an accessible definition list detailing each deduction component (percentage MDR,
 * fixed fee per transaction, boundary caps, and tax adjustments) with optional audit drawer.
 *
 * @example
 * <TrivioFeeBreakdown
 *   estimate={estimate}
 *   showRuleSnapshot={true}
 *   theme="dark"
 * />
 */
export function TrivioFeeBreakdown({
  estimate,
  feeResult: propFeeResult,
  grossMinor: propGross,
  rateBasisPoints: propRateBps,
  currencyCode: propCurrency,
  showRuleSnapshot = false,
  theme: propTheme,
  className = 'trivio-fee-breakdown',
  testId = 'trivio-fee-breakdown',
}: TrivioFeeBreakdownProps): React.JSX.Element {
  // Explicit rejection: Trivio Cardinal Rule - never assume or invent an MDR
  if (!estimate && (!propFeeResult || !('breakdown' in propFeeResult)) && propRateBps === undefined) {
    throw new TrivioValidationError(
      'TrivioFeeBreakdown requires an explicit fee agreement. Pass either a valid estimate, feeResult, or explicit rateBasisPoints. Trivio does not permit default or fallback merchant fee rates.'
    );
  }

  const context = useTrivio();
  const theme = propTheme ?? context.theme ?? 'dark';
  const palette = getThemePalette(theme);
  const [snapshotOpen, setSnapshotOpen] = useState(false);

  // Currency resolution
  const currency =
    propCurrency ??
    estimate?.currency ??
    context.currencyCode ??
    'USD';

  // Determine effective values from estimate, propFeeResult, or fallback legacy props
  const computedValues = useMemo(() => {
    // 1. From Integrated estimate
    if (estimate) {
      return {
        gross: estimate.grossMinor,
        feeTotal: estimate.totalFeeMinor,
        net: estimate.netMinor,
        percentageFee: estimate.percentageFeeMinor,
        rateBps: estimate.appliedRateBasisPoints,
        fixedFee: estimate.fixedFeeMinor,
        isMinApplied: estimate.minFeeAdjustmentMinor !== null && estimate.minFeeAdjustmentMinor > 0,
        isMaxApplied: estimate.maxFeeAdjustmentMinor !== null && estimate.maxFeeAdjustmentMinor > 0,
        taxAdjustment: estimate.taxMinor,
        snapshot: estimate.appliedFeeRule,
      };
    }

    // 2. From DynamicFeeEstimateResult
    if (propFeeResult && 'breakdown' in propFeeResult) {
      const fee = propFeeResult;
      return {
        gross: fee.grossMinor,
        feeTotal: fee.totalFeeMinor,
        net: fee.netMinor,
        percentageFee: fee.percentageFeeMinor,
        rateBps: fee.appliedRateBasisPoints,
        fixedFee: fee.fixedFeeMinor,
        isMinApplied: fee.minFeeAdjustmentMinor !== null && fee.minFeeAdjustmentMinor > 0,
        isMaxApplied: fee.maxFeeAdjustmentMinor !== null && fee.maxFeeAdjustmentMinor > 0,
        taxAdjustment: fee.taxMinor,
        snapshot: fee.appliedRule.snapshot,
      };
    }

    // 3. From direct/legacy props
    if (propRateBps !== undefined) {
      const gross = propGross ?? 0;
      const legacy = estimatePercentageFee(Number(gross), propRateBps);

      return {
        gross: legacy.grossMinor,
        feeTotal: legacy.feeMinor,
        net: legacy.netMinor,
        percentageFee: legacy.feeMinor,
        rateBps: legacy.rateBasisPoints,
        fixedFee: 0,
        isMinApplied: false,
        isMaxApplied: false,
        taxAdjustment: 0,
        snapshot: undefined,
      };
    }

    // Explicit rejection: Trivio Cardinal Rule - never assume or invent an MDR
    throw new TrivioValidationError(
      'TrivioFeeBreakdown requires an explicit fee agreement. Pass either a valid estimate, feeResult, or explicit rateBasisPoints. Trivio does not permit default or fallback merchant fee rates.'
    );
  }, [estimate, propFeeResult, propGross, propRateBps]);

  const cardStyle = getCardStyle(theme);
  const formattedGross = formatCurrency(computedValues.gross, currency);
  const formattedFeeTotal = formatCurrency(computedValues.feeTotal, currency);
  const formattedNet = formatCurrency(computedValues.net, currency);
  const formattedPercentageFee = formatCurrency(computedValues.percentageFee, currency);
  const formattedFixedFee = formatCurrency(computedValues.fixedFee, currency);
  const formattedTax = formatCurrency(computedValues.taxAdjustment, currency);

  return (
    <article
      className={className}
      data-testid={testId}
      data-theme={theme}
      style={cardStyle}
      aria-label="Merchant Fee Calculation Breakdown"
    >
      {/* Component Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: `1px solid ${palette.border}`,
          paddingBottom: '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 700,
            color: palette.textPrimary,
          }}
        >
          Fee Deduction Breakdown
        </h3>
        <span style={getBadgeStyle('accent', theme)}>Deterministic MDR</span>
      </header>

      {/* Itemized List */}
      <dl
        style={{
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Gross Transaction Amount */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '8px',
            borderBottom: `1px dashed ${palette.borderMuted}`,
          }}
        >
          <dt
            style={{
              fontSize: '0.875rem',
              color: palette.textSecondary,
              fontWeight: 500,
            }}
          >
            Gross Transaction Amount
          </dt>
          <dd
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: palette.textPrimary,
            }}
            data-testid="breakdown-gross"
          >
            {formattedGross}
          </dd>
        </div>

        {/* Percentage MDR Rate */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <dt
            style={{
              fontSize: '0.875rem',
              color: palette.textSecondary,
              fontWeight: 500,
            }}
          >
            Percentage MDR ({formatRateBps(computedValues.rateBps)})
          </dt>
          <dd
            style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: palette.warning,
            }}
            data-testid="breakdown-rate-fee"
          >
            -{formattedPercentageFee}
          </dd>
        </div>

        {/* Fixed Fee (if present) */}
        {computedValues.fixedFee > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <dt
              style={{
                fontSize: '0.875rem',
                color: palette.textSecondary,
                fontWeight: 500,
              }}
            >
              Fixed Fee Per Transaction
            </dt>
            <dd
              style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: palette.warning,
              }}
              data-testid="breakdown-fixed-fee"
            >
              -{formattedFixedFee}
            </dd>
          </div>
        )}

        {/* Minimum Fee Adjustment Badge */}
        {computedValues.isMinApplied && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(217, 119, 6, 0.06)',
              padding: '6px 10px',
              borderRadius: '6px',
            }}
          >
            <dt style={{ fontSize: '0.8125rem', color: palette.warning, fontWeight: 500 }}>
              Minimum Fee Floor Enforced
            </dt>
            <dd style={{ margin: 0 }}>
              <span style={getBadgeStyle('warning', theme)}>Min Cap</span>
            </dd>
          </div>
        )}

        {/* Maximum Fee Adjustment Badge */}
        {computedValues.isMaxApplied && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(5, 150, 105, 0.06)',
              padding: '6px 10px',
              borderRadius: '6px',
            }}
          >
            <dt style={{ fontSize: '0.8125rem', color: palette.success, fontWeight: 500 }}>
              Maximum Fee Ceiling Enforced
            </dt>
            <dd style={{ margin: 0 }}>
              <span style={getBadgeStyle('success', theme)}>Max Cap</span>
            </dd>
          </div>
        )}

        {/* Tax Adjustment */}
        {computedValues.taxAdjustment > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <dt
              style={{
                fontSize: '0.875rem',
                color: palette.textSecondary,
                fontWeight: 500,
              }}
            >
              Applicable Tax / Scheme Surcharge
            </dt>
            <dd
              style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: palette.warning,
              }}
              data-testid="breakdown-tax"
            >
              -{formattedTax}
            </dd>
          </div>
        )}

        {/* Total Fee Deductions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: `1px solid ${palette.borderMuted}`,
          }}
        >
          <dt
            style={{
              fontSize: '0.875rem',
              color: palette.textPrimary,
              fontWeight: 600,
            }}
          >
            Total Estimated Deductions
          </dt>
          <dd
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: palette.warning,
            }}
            data-testid="breakdown-fee"
          >
            -{formattedFeeTotal}
          </dd>
        </div>

        {/* Net Settlement */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: theme === 'dark' ? 'rgba(0, 255, 255, 0.06)' : 'rgba(0, 139, 139, 0.05)',
            borderRadius: '6px',
            border: `1px solid ${palette.accentBorder}`,
            marginTop: '4px',
          }}
        >
          <dt
            style={{
              fontSize: '0.9375rem',
              color: palette.accent,
              fontWeight: 700,
            }}
          >
            Estimated Net Proceeds
          </dt>
          <dd
            style={{
              margin: 0,
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: palette.accent,
            }}
            data-testid="breakdown-net"
          >
            {formattedNet}
          </dd>
        </div>
      </dl>

      {/* Applied Rule Audit Snapshot (Optional) */}
      {showRuleSnapshot && computedValues.snapshot && (
        <section
          style={{
            marginTop: '16px',
            borderTop: `1px solid ${palette.borderMuted}`,
            paddingTop: '12px',
          }}
          aria-label="Applied Rule Snapshot"
        >
          <button
            type="button"
            onClick={() => setSnapshotOpen((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: palette.textSecondary,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0,
              width: '100%',
              textAlign: 'left',
            }}
            aria-expanded={snapshotOpen}
          >
            <span>{snapshotOpen ? '▾' : '▸'}</span>
            <span>Applied Fee Rule Snapshot ({computedValues.snapshot.id})</span>
          </button>

          {snapshotOpen && (
            <div
              style={{
                marginTop: '8px',
                padding: '10px 12px',
                backgroundColor: palette.cardBgElevated,
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
              data-testid="rule-snapshot-drawer"
            >
              <div><strong>Rule ID:</strong> {computedValues.snapshot.id}</div>
              <div><strong>Acquirer:</strong> {computedValues.snapshot.acquirerId}</div>
              <div><strong>Merchant:</strong> {computedValues.snapshot.merchantId ?? 'Default'}</div>
              <div><strong>Scheme:</strong> {computedValues.snapshot.cardScheme ?? 'Any'}</div>
              <div><strong>Funding Type:</strong> {computedValues.snapshot.cardFundingType ?? 'Any'}</div>
              <div><strong>Calculation Policy:</strong> {computedValues.snapshot.calculationPolicy}</div>
            </div>
          )}
        </section>
      )}
    </article>
  );
}

/**
 * Backward compatibility alias for `TrivioFeeBreakdown`.
 */
export const FeeBreakdown = TrivioFeeBreakdown;
