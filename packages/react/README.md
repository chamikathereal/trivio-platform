# @trivio.ink/react

> Reusable, accessible, themeable React UI components and hooks for Trivio payment settlement intelligence.

---

## 1. Overview

`@trivio.ink/react` provides drop-in React components and client calculation hooks for merchant payment settlement forecasting, fee deductions, cut-off evaluation, and deposit timeline visualization.

### Core Architectural Principles
- **Pure Dependency Isolation:** Depends strictly on `@trivio.ink/core` and React peer dependencies (`react >= 18.0.0`). Never imports `@trivio.ink/node` into browser code.
- **Zero-Float Financial Math:** All components receive integer minor currency units (e.g. `1000000` for `10,000.00`) and format using exact string manipulation with zero IEEE-754 floating-point inaccuracies.
- **Zero Default MDR Rates:** Components strictly reject unconfigured fee agreements. Missing rates throw `TrivioValidationError` rather than silently assuming zero or fallback rates.
- **Zero CSS-in-JS Overhead:** Pre-styled using zero-runtime inline CSS custom property palettes with official Trivio brand tokens. Works out of the box with zero stylesheet imports or Tailwind setup.
- **SSR-Safe Architecture:** Built with pure ESM and zero references to browser globals (`window`, `document`) during module evaluation or server rendering. *(Note: Full cross-framework matrix testing across Vite, Remix, and Astro is unverified pending Stage 3C package acceptance).*
- **Accessibility-First Semantic Markup:** Structured using semantic HTML5 elements (`<article>`, `<header>`, `<section>`, `<dl>`, `<dt>`, `<dd>`, `<ol>`, `<li>`, `<time>`), accessible contrast ratios, and screen-reader status announcements. *(Note: Formal WCAG 2.2 AA certification is pending independent live browser audits in Stage 4).*

---

## 2. Installation

```bash
npm install @trivio.ink/react @trivio.ink/core
```

*(Note: Currently in pre-release private development under monorepo workspace coordination until Stage 3C).*

---

## 3. Brand Tokens & Theme Palettes

The SDK includes official Trivio brand tokens and supports `dark`, `light`, and `auto` theme modes:

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| **Midnight Navy** | `#000b26` | Canonical brand primary, dark card background |
| **Electric Cyan** | `#00ffff` | High-contrast accent, active badges, net proceeds |
| **Warm White** | `#fffefa` | Canonical brand light surface tone, high-contrast text |

---

## 4. Components

### `TrivioSettlementSummary`

Compact financial summary card displaying gross authorized payment, estimated fee deductions, net settlement proceeds, expected deposit date, and settlement cycle with prominent estimate status.

```tsx
import React from 'react';
import { TrivioSettlementSummary } from '@trivio.ink/react';

export function SettlementPreview({ estimate }) {
  return (
    <TrivioSettlementSummary
      estimate={estimate}
      theme="dark"
      showDisclaimer={true}
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `estimate` | `IntegratedSettlementEstimateResult` | `undefined` | Full settlement estimate object from `@trivio.ink/core`. |
| `grossMinor` | `number \| bigint` | `0` | Direct gross amount in minor units. |
| `feeMinor` | `number \| bigint` | `0` | Direct fee deductions in minor units. |
| `netMinor` | `number \| bigint` | `0` | Direct net proceeds in minor units. |
| `expectedSettlementDate` | `string` | `''` | Target deposit date (`YYYY-MM-DD`). |
| `currencyCode` | `string` | `'USD'` | ISO 4217 three-letter currency code. |
| `settlementCycle` | `string` | `'T+1 Settlement'` | Description of the settlement cycle. |
| `isEstimated` | `boolean` | `true` | Explicit indicator that calculation is an estimate. |
| `isPostCutOff` | `boolean` | `false` | Indicates transaction occurred after daily cut-off. |
| `isDeferred` | `boolean` | `false` | Indicates deposit date rolled over weekend/holiday. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'dark'` | UI theme mode. |
| `showDisclaimer` | `boolean` | `true` | Renders offline non-binding disclaimer footer. |

---

### `TrivioFeeBreakdown` (Alias: `FeeBreakdown`)

Itemized financial breakdown displaying percentage MDR rate, fixed per-transaction fee, minimum/maximum boundary adjustments, tax levies, total deductions, and net proceeds.

```tsx
import React from 'react';
import { TrivioFeeBreakdown } from '@trivio.ink/react';

export function FeeDetails({ estimate }) {
  return (
    <TrivioFeeBreakdown
      estimate={estimate}
      showRuleSnapshot={true}
      theme="dark"
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `estimate` | `IntegratedSettlementEstimateResult` | `undefined` | Full estimate object from core. |
| `feeResult` | `DynamicFeeEstimateResult` | `undefined` | Direct fee calculation result from core. |
| `grossMinor` | `number \| bigint` | `0` | Direct gross amount for legacy usage. |
| `rateBasisPoints` | `number` | `0` | Direct fee rate in basis points (1 bp = 0.01%). |
| `showRuleSnapshot` | `boolean` | `false` | Renders collapsible applied rule audit drawer. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'dark'` | UI theme mode. |

---

### `TrivioSettlementTimeline`

Visual chronological progress tracker illustrating authorization capture, daily cut-off evaluation, business-day accumulation, holiday/weekend deferrals, and final bank payout.

```tsx
import React from 'react';
import { TrivioSettlementTimeline } from '@trivio.ink/react';

export function TimelineView({ estimate }) {
  return (
    <TrivioSettlementTimeline
      estimate={estimate}
      theme="dark"
    />
  );
}
```

---

## 5. Client Calculation Hook

### `useTrivioSettlementEstimate`

Memoized React hook executing instantaneous offline settlement forecasting in developer client applications.

```tsx
import React from 'react';
import {
  useTrivioSettlementEstimate,
  TrivioSettlementSummary,
  TrivioFeeBreakdown,
  TrivioSettlementTimeline,
} from '@trivio.ink/react';

export function CheckoutPreview({ transaction, config }) {
  const { estimate, error, isLoading } = useTrivioSettlementEstimate(
    transaction,
    config
  );

  if (error) {
    return <div className="error-alert">{error.message}</div>;
  }

  if (!estimate) {
    return <div>Enter transaction details to forecast settlement...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <TrivioSettlementSummary estimate={estimate} theme="dark" />
      <TrivioFeeBreakdown estimate={estimate} showRuleSnapshot={true} theme="dark" />
      <TrivioSettlementTimeline estimate={estimate} theme="dark" />
    </div>
  );
}
```

---

## 6. Formatting Utilities

Operate strictly on strings and integers without IEEE-754 floating-point inaccuracies:

```typescript
import {
  formatCurrency,
  formatMinorAmount,
  formatRateBps,
  formatDisplayDate,
  getCurrencyDecimals,
} from '@trivio.ink/react';

formatCurrency(1_000_000, 'USD');       // "USD 10,000.00"
formatCurrency(25_000, 'LKR');          // "LKR 250.00"
formatCurrency(1_500, 'JPY');           // "JPY 1,500" (0 decimals)
formatCurrency(1_500, 'BHD');           // "BHD 1.500" (3 decimals)

formatMinorAmount(1000000, 2);          // "10000.00"
formatRateBps(250);                     // "2.50%"
formatDisplayDate('2026-11-18');        // "Wed, Nov 18, 2026"
```

---

## 7. License

Proprietary / Apache-2.0 — Trivio Platform (`trivio.ink`).
