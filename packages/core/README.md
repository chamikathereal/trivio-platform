# @trivio.ink/core

> Pure, deterministic payment settlement calculation engine for Trivio.

## Overview

`@trivio.ink/core` provides zero-dependency, strictly typed financial arithmetic primitives for payment settlement estimation and fee modeling.

### Architectural Principles

- **Zero Runtime Dependencies:** No external libraries, no database connections, no HTTP clients, and no environment variable requirements.
- **Deterministic Minor-Unit Arithmetic:** All currency values are processed as non-negative integer minor units (e.g. cents, paise, minor currency units) using BigInt intermediate precision to prevent IEEE-754 floating-point inaccuracies.
- **Strict Validation:** Inputs are rigorously checked against bounds, safe-integer constraints, and non-negative criteria.
- **Private Package:** Unreleased internal package for the Trivio platform monorepo.

> [!WARNING]
> **Demonstration Primitive Disclaimer:**  
> The `estimatePercentageFee` function implemented in Stage 1 is an illustrative arithmetic primitive designed for demonstration and test harness verification. It is **NOT** a bank-certified settlement calculator and does not constitute financial, taxation, or legal advice. Real-world acquirer settlements involve card scheme interchange rates, brand assessments, cross-border fees, currency conversion spreads, and acquirer-specific minimums.

## Installation

Within the Trivio monorepo:

```json
{
  "dependencies": {
    "@trivio.ink/core": "*"
  }
}
```

## API Reference

### `estimatePercentageFee(grossMinor, rateBasisPoints)`

Calculates an estimated percentage fee and resulting net amount using round-half-up policy on integer minor units.

#### Parameters

- `grossMinor` (`number`): Non-negative safe integer representing the gross transaction amount in minor currency units (e.g., `1000000` for 10,000.00).
- `rateBasisPoints` (`number`): Non-negative safe integer representing the fee rate in basis points (`0` to `10000`, where `100 bps = 1.00%` and `10000 bps = 100.00%`).

#### Returns

```typescript
interface FeeEstimateResult {
  grossMinor: number;
  feeMinor: number;
  netMinor: number;
  rateBasisPoints: number;
}
```

#### Example

```typescript
import { estimatePercentageFee } from '@trivio.ink/core';

// LKR 10,000.00 (1,000,000 cents) at 2.50% (250 bps) MDR
const result = estimatePercentageFee(1_000_000, 250);

console.log(result);
// {
//   grossMinor: 1000000,
//   feeMinor: 25000,
//   netMinor: 975000,
//   rateBasisPoints: 250
// }
```

## Error Handling

Throws `TrivioValidationError` (subclass of `TypeError`) or `TrivioRangeError` (subclass of `RangeError`) when:
- Inputs are negative or non-integer
- Inputs exceed `Number.MAX_SAFE_INTEGER`
- Rate is outside the supported range `[0, 10000]` basis points
