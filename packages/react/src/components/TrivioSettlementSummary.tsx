/**
 * @file packages/react/src/components/TrivioSettlementSummary.tsx
 * @description Compact, accessible financial settlement forecast summary card.
 * Displays gross transaction amount, estimated fee deductions, net settlement amount,
 * forecasted deposit date, settlement cycle, and non-confirmed estimate disclaimer.
 */

import React from 'react';
import type { TrivioSettlementSummaryProps } from '../types.js';
import { useTrivio } from '../context.js';
import { formatCurrency, formatDisplayDate } from '../formatters.js';
import { getCardStyle, getBadgeStyle, getThemePalette } from '../theme.js';

/**
 * Compact settlement summary presentation component.
 *
 * Visualizes forecasted payout metrics and timeline while prominently highlighting
 * that the values are pre-settlement calculations rather than confirmed bank receipts.
 *
 * @example
 * <TrivioSettlementSummary
 *   estimate={estimate}
 *   theme="dark"
 *   showDisclaimer={true}
 * />
 */
export function TrivioSettlementSummary({
  estimate,
  grossMinor: propGross,
  feeMinor: propFee,
  netMinor: propNet,
  expectedSettlementDate: propDate,
  currencyCode: propCurrency,
  settlementCycle: propCycle,
  isEstimated: propIsEstimated,
  isPostCutOff: propIsPostCutOff,
  isDeferred: propIsDeferred,
  theme: propTheme,
  className = 'trivio-settlement-summary',
  showDisclaimer = true,
  testId = 'trivio-settlement-summary',
}: TrivioSettlementSummaryProps): React.JSX.Element {
  const context = useTrivio();
  const theme = propTheme ?? context.theme ?? 'dark';
  const palette = getThemePalette(theme);

  // Extract metrics from estimate or fallback to direct props
  const gross = propGross ?? estimate?.grossMinor ?? 0;
  const fee = propFee ?? estimate?.totalFeeMinor ?? 0;
  const net = propNet ?? estimate?.netMinor ?? 0;
  const currency = propCurrency ?? estimate?.currency ?? context.currencyCode ?? 'USD';
  const expectedDate = propDate ?? estimate?.expectedSettlementDate ?? '';
  const isEstimated = propIsEstimated ?? estimate?.isEstimated ?? true;
  const isPostCutOff = propIsPostCutOff ?? estimate?.isPastCutOff ?? false;
  const isDeferred = propIsDeferred ?? ((estimate?.daysDeferred ?? 0) > 0);

  const cycleText =
    propCycle ??
    (estimate
      ? `${estimate.settlementCycle} (${estimate.cycleUnit === 'business_days' ? 'Business' : 'Calendar'} Days)`
      : 'T+1 Settlement');

  const cardStyle = getCardStyle(theme);
  const formattedGross = formatCurrency(gross, currency);
  const formattedFee = formatCurrency(fee, currency);
  const formattedNet = formatCurrency(net, currency);
  const formattedDate = formatDisplayDate(expectedDate, context.locale);

  return (
    <article
      className={className}
      data-testid={testId}
      data-theme={theme}
      style={cardStyle}
      aria-label="Payment Settlement Forecast Summary"
    >
      {/* Header bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          borderBottom: `1px solid ${palette.border}`,
          paddingBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: palette.accent,
              display: 'inline-block',
              boxShadow: theme === 'dark' ? `0 0 8px ${palette.accent}` : 'none',
            }}
            aria-hidden="true"
          />
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: palette.textPrimary,
              letterSpacing: '-0.01em',
            }}
          >
            Settlement Forecast
          </h3>
          <span
            style={{
              fontSize: '0.8125rem',
              color: palette.textSecondary,
              fontWeight: 500,
            }}
          >
            ({currency})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isEstimated && (
            <span
              style={getBadgeStyle('accent', theme)}
              data-testid="summary-badge-estimate"
              role="status"
            >
              Estimated
            </span>
          )}
          {isPostCutOff && (
            <span
              style={getBadgeStyle('warning', theme)}
              data-testid="summary-badge-cutoff"
              title="Transaction occurred after daily bank cut-off"
            >
              Post Cut-Off
            </span>
          )}
          {isDeferred && (
            <span
              style={getBadgeStyle('muted', theme)}
              data-testid="summary-badge-deferred"
              title="Deposit adjusted across weekend or holiday"
            >
              Calendar Adjusted
            </span>
          )}
        </div>
      </header>

      {/* Primary Financial Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        {/* Gross */}
        <div
          style={{
            backgroundColor: palette.cardBgElevated,
            padding: '12px 14px',
            borderRadius: '8px',
            border: `1px solid ${palette.borderMuted}`,
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: palette.textSecondary,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Gross Amount
          </span>
          <span
            style={{
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: palette.textPrimary,
            }}
            data-testid="summary-gross"
            aria-label={`Gross Amount: ${formattedGross}`}
          >
            {formattedGross}
          </span>
        </div>

        {/* Deductions */}
        <div
          style={{
            backgroundColor: palette.cardBgElevated,
            padding: '12px 14px',
            borderRadius: '8px',
            border: `1px solid ${palette.borderMuted}`,
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: palette.textSecondary,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Est. Deductions
          </span>
          <span
            style={{
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: palette.warning,
            }}
            data-testid="summary-fee"
            aria-label={`Estimated Fee Deductions: -${formattedFee}`}
          >
            -{formattedFee}
          </span>
        </div>

        {/* Net Settlement */}
        <div
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(0, 255, 255, 0.05)' : 'rgba(0, 139, 139, 0.04)',
            padding: '12px 14px',
            borderRadius: '8px',
            border: `1px solid ${palette.accentBorder}`,
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: palette.accent,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Est. Net Settlement
          </span>
          <span
            style={{
              fontSize: '1.1875rem',
              fontWeight: 700,
              color: palette.accent,
            }}
            data-testid="summary-net"
            aria-label={`Estimated Net Settlement: ${formattedNet}`}
          >
            {formattedNet}
          </span>
        </div>
      </div>

      {/* Forecasted Settlement Timeline Details */}
      <section
        style={{
          backgroundColor: palette.cardBgElevated,
          padding: '14px 16px',
          borderRadius: '8px',
          border: `1px solid ${palette.borderMuted}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
        aria-label="Settlement Schedule"
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              color: palette.textSecondary,
              display: 'block',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            Expected Bank Deposit Date
          </span>
          <time
            dateTime={expectedDate}
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
            data-testid="summary-date"
          >
            {formattedDate}
          </time>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: palette.textSecondary,
              display: 'block',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            Settlement Cycle
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: palette.textPrimary,
            }}
            data-testid="summary-cycle"
          >
            {cycleText}
          </span>
        </div>
      </section>

      {/* Non-Binding Legal Disclaimer Footer */}
      {showDisclaimer && (
        <footer
          style={{
            marginTop: '14px',
            paddingTop: '10px',
            borderTop: `1px solid ${palette.borderMuted}`,
            fontSize: '0.75rem',
            color: palette.textMuted,
            lineHeight: 1.4,
          }}
          data-testid="summary-disclaimer"
        >
          Calculation represents an offline estimate based on registered acquirer rules.
          Final credited amounts depend on acquirer reconciliation batches and bank clearing windows.
        </footer>
      )}
    </article>
  );
}
