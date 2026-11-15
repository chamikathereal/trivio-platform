/**
 * @file packages/react/src/components/TrivioSettlementTimeline.tsx
 * @description Visual settlement lifecycle progress timeline illustrating transaction authorization,
 * cut-off window evaluation, settlement cycle, calendar deferrals, and expected bank deposit.
 */

import React, { useMemo } from 'react';
import type {
  TrivioSettlementTimelineProps,
  SettlementTimelineStep,
} from '../types.js';
import { useTrivio } from '../context.js';
import { formatDisplayDate } from '../formatters.js';
import { getCardStyle, getBadgeStyle, getThemePalette } from '../theme.js';

/**
 * Visual settlement progress timeline component.
 *
 * Details the chronological progression from transaction timestamp through cut-off
 * evaluation, business-day accumulation, holiday/weekend adjustments, to estimated bank deposit.
 *
 * @example
 * <TrivioSettlementTimeline
 *   estimate={estimate}
 *   theme="dark"
 * />
 */
export function TrivioSettlementTimeline({
  estimate,
  settlementDateResult: propSettlementResult,
  customSteps,
  currencyCode: propCurrency,
  theme: propTheme,
  className = 'trivio-settlement-timeline',
  testId = 'trivio-settlement-timeline',
}: TrivioSettlementTimelineProps): React.JSX.Element {
  const context = useTrivio();
  const theme = propTheme ?? context.theme ?? 'dark';
  const palette = getThemePalette(theme);

  const steps = useMemo<SettlementTimelineStep[]>(() => {
    if (customSteps && customSteps.length > 0) {
      return customSteps;
    }

    const authTime = estimate?.transactionTime ?? propSettlementResult?.transactionTime ?? 'Authorized';
    const isPastCutOff =
      estimate?.isPastCutOff ??
      propSettlementResult?.isPastCutOff ??
      false;

    const daysDeferred =
      estimate?.daysDeferred ??
      propSettlementResult?.daysDeferred ??
      0;
    const isDeferred = daysDeferred > 0;

    const expectedDate =
      estimate?.expectedSettlementDate ??
      propSettlementResult?.expectedSettlementDate ??
      '';

    const cycleDays =
      estimate?.cycleLength ??
      propSettlementResult?.cycleLength ??
      propSettlementResult?.appliedPolicy?.cycleLength ??
      1;

    const cycleUnit =
      estimate?.cycleUnit ??
      propSettlementResult?.cycleUnit ??
      propSettlementResult?.appliedPolicy?.cycleUnit ??
      'business_days';

    const unitLabel = cycleUnit === 'business_days' ? 'Business Day(s)' : 'Calendar Day(s)';

    const cutOffTime =
      estimate?.appliedSettlementPolicy?.cutOffTime ??
      propSettlementResult?.appliedPolicy?.cutOffTime ??
      propSettlementResult?.cutOffTime ??
      '16:00:00';

    const timeZone =
      estimate?.appliedSettlementPolicy?.timeZone ??
      propSettlementResult?.appliedPolicy?.timeZone ??
      propSettlementResult?.timeZone ??
      'UTC';

    return [
      {
        id: 'authorization',
        title: 'Transaction Authorized',
        description: `Authorization captured at ${authTime}`,
        status: 'completed',
        timestamp: authTime,
      },
      {
        id: 'cutoff',
        title: 'Daily Cut-Off Window',
        description: isPastCutOff
          ? `Submitted after ${cutOffTime} (${timeZone}). Processing rolled over to the next business day.`
          : `Captured before daily cut-off of ${cutOffTime} (${timeZone}). Processed in same-day batch.`,
        status: isPastCutOff ? 'adjusted' : 'completed',
        badge: isPastCutOff ? 'Post Cut-Off +1d' : 'Same-Day Batch',
      },
      {
        id: 'cycle',
        title: `Settlement Processing (T+${cycleDays})`,
        description: `Evaluating ${cycleDays} ${unitLabel} processing timeline under working calendar rules.`,
        status: 'in_progress',
      },
      {
        id: 'calendar',
        title: 'Calendar & Holiday Rollover',
        description: isDeferred
          ? `Payout shifted by ${daysDeferred} day(s) across non-working weekend or observed bank holidays.`
          : 'No holiday deferrals encountered. Next active banking clearing window applied.',
        status: isDeferred ? 'adjusted' : 'completed',
        badge: isDeferred ? 'Holiday Adjusted' : 'No Deferral',
      },
      {
        id: 'deposit',
        title: 'Estimated Bank Payout',
        description: `Target settlement deposit expected on ${formatDisplayDate(expectedDate, context.locale)}.`,
        status: 'pending',
        timestamp: expectedDate,
      },
    ];
  }, [customSteps, estimate, propSettlementResult, context.locale]);

  const cardStyle = getCardStyle(theme);
  const currency = propCurrency ?? estimate?.currency ?? propSettlementResult?.currency ?? context.currencyCode;

  return (
    <article
      className={className}
      data-testid={testId}
      data-theme={theme}
      style={cardStyle}
      aria-label="Settlement Timeline Progression"
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: `1px solid ${palette.border}`,
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            Settlement Lifecycle Timeline
          </h3>
          {currency && (
            <span style={{ fontSize: '0.8125rem', color: palette.textSecondary }}>
              ({currency})
            </span>
          )}
        </div>
        <span style={getBadgeStyle('accent', theme)}>Calendar Intelligence</span>
      </header>

      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          position: 'relative',
        }}
        data-testid="timeline-steps-list"
      >
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          let nodeColor: string = palette.accent;
          const nodeBg: string = palette.cardBgElevated;
          let badgeVariant: 'accent' | 'warning' | 'success' | 'muted' = 'accent';

          if (step.status === 'completed') {
            nodeColor = palette.success;
            badgeVariant = 'success';
          } else if (step.status === 'adjusted') {
            nodeColor = palette.warning;
            badgeVariant = 'warning';
          } else if (step.status === 'in_progress') {
            nodeColor = palette.accent;
            badgeVariant = 'accent';
          } else {
            nodeColor = palette.textSecondary;
            badgeVariant = 'muted';
          }

          return (
            <li
              key={step.id}
              style={{
                position: 'relative',
                paddingLeft: '32px',
                paddingBottom: isLast ? '0' : '20px',
              }}
              data-testid={`timeline-step-${step.id}`}
            >
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: '7px',
                    top: '16px',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: palette.border,
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Node indicator */}
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: nodeBg,
                  border: `3px solid ${nodeColor}`,
                  boxSizing: 'border-box',
                }}
                aria-hidden="true"
              />

              {/* Content box */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: palette.textPrimary,
                    }}
                  >
                    {step.title}
                  </span>

                  {step.badge && (
                    <span style={getBadgeStyle(badgeVariant, theme)}>
                      {step.badge}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: palette.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
