// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/react/src/theme.ts
 * @description Trivio brand tokens, color constants, and CSS variable styling definitions.
 * Zero external CSS-in-JS dependencies - pure styles and standard CSS custom properties.
 */

import type { CSSProperties } from 'react';
import type { TrivioTheme } from './types.js';

/**
 * Official Trivio brand color tokens.
 */
export const TRIVIO_TOKENS = {
  /** Canonical brand primary color */
  midnightNavy: '#000b26',
  /** Canonical brand high-contrast accent */
  electricCyan: '#00ffff',
  /** Canonical brand light surface/text tone */
  warmWhite: '#fffefa',

  // Dark Theme Palette
  dark: {
    bg: '#000b26',
    cardBg: '#001338',
    cardBgElevated: '#051b4a',
    border: '#142754',
    borderMuted: '#0e1c3e',
    textPrimary: '#fffefa',
    textSecondary: '#8da2c8',
    textMuted: '#5d7199',
    accent: '#00ffff',
    accentMuted: 'rgba(0, 255, 255, 0.12)',
    accentBorder: 'rgba(0, 255, 255, 0.35)',
    warning: '#f59e0b',
    warningMuted: 'rgba(245, 158, 11, 0.12)',
    warningBorder: 'rgba(245, 158, 11, 0.35)',
    success: '#10b981',
    successMuted: 'rgba(16, 185, 129, 0.12)',
    successBorder: 'rgba(16, 185, 129, 0.35)',
  },

  // Light Theme Palette
  light: {
    bg: '#ffffff',
    cardBg: '#f8fafc',
    cardBgElevated: '#ffffff',
    border: '#e2e8f0',
    borderMuted: '#edf2f7',
    textPrimary: '#000b26',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accent: '#008b8b',
    accentMuted: 'rgba(0, 139, 139, 0.08)',
    accentBorder: 'rgba(0, 139, 139, 0.3)',
    warning: '#d97706',
    warningMuted: 'rgba(217, 119, 6, 0.08)',
    warningBorder: 'rgba(217, 119, 6, 0.3)',
    success: '#059669',
    successMuted: 'rgba(5, 150, 105, 0.08)',
    successBorder: 'rgba(5, 150, 105, 0.3)',
  },
} as const;

/**
 * Returns theme color definitions for a resolved theme mode.
 */
export function getThemePalette(theme: TrivioTheme = 'dark') {
  if (theme === 'light') {
    return TRIVIO_TOKENS.light;
  }
  return TRIVIO_TOKENS.dark;
}

/**
 * Generates card container inline styles for zero-dependency styling.
 */
export function getCardStyle(theme: TrivioTheme = 'dark'): CSSProperties {
  const palette = getThemePalette(theme);
  return {
    backgroundColor: palette.cardBg,
    color: palette.textPrimary,
    border: `1px solid ${palette.border}`,
    borderRadius: '12px',
    padding: '20px',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxShadow:
      theme === 'dark'
        ? '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
        : '0 4px 16px -2px rgba(0, 11, 38, 0.06)',
    boxSizing: 'border-box',
    width: '100%',
  };
}

/**
 * Generates badge styles for status indicators.
 */
export function getBadgeStyle(
  variant: 'accent' | 'warning' | 'success' | 'muted',
  theme: TrivioTheme = 'dark'
): CSSProperties {
  const palette = getThemePalette(theme);

  let bg: string = palette.accentMuted;
  let text: string = palette.accent;
  let border: string = palette.accentBorder;

  if (variant === 'warning') {
    bg = palette.warningMuted;
    text = palette.warning;
    border = palette.warningBorder;
  } else if (variant === 'success') {
    bg = palette.successMuted;
    text = palette.success;
    border = palette.successBorder;
  } else if (variant === 'muted') {
    bg = theme === 'dark' ? 'rgba(141, 162, 200, 0.1)' : 'rgba(71, 85, 105, 0.08)';
    text = palette.textSecondary;
    border = palette.border;
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    backgroundColor: bg,
    color: text,
    border: `1px solid ${border}`,
  };
}
