# @trivio.ink/core

> Deterministic, zero-dependency payment processing fee and settlement calculation engine.

## 1. Overview & Purpose

`@trivio.ink/core` is Trivio's standalone financial calculation library. It empowers developers of ERP, POS, e-commerce, and accounting software to calculate exact merchant processing charges and projected net settlements using merchant-configured bank fee agreements.

### Core Architectural Principles

- **Zero Runtime Dependencies:** No third-party packages, network requests, database drivers, or environment variables. Runs anywhere (Node.js, browser, edge workers).
- **Zero-Float Precision:** All monetary amounts are processed strictly as non-negative integer minor units (e.g. cents, paise) using intermediate `BigInt` precision to prevent IEEE-754 floating-point errors.
- **Developer-Owned Data:** Calculations execute locally on your infrastructure. You can store calculation outputs directly in PostgreSQL, MySQL, SQLite, or transactional ledgers without sending telemetry to Trivio.
- **Configurable Agreements:** No hardcoded bank rates. All fee schedules are caller-supplied.

---

## 2. Supported Calculation Modes

The engine supports full commercial fee structures:

1. **Percentage-based MDR:** Basis point fee rate (`rateBasisPoints: 250` for 2.50%).
2. **Fixed Transaction Fee:** Fixed charge per transaction in minor units (`fixedFeeMinor: 2500` for 25.00).
3. **Blended (Percentage + Fixed):** Combination of percentage MDR plus per-transaction fixed fee.
4. **Minimum Fee Limit (Floor):** Ensures the processing fee does not fall below a contractual threshold (`minFeeMinor`).
5. **Maximum Fee Limit (Cap):** Ensures the processing fee does not exceed a contractual cap (`maxFeeMinor`).
6. **Caller-Configured Taxes/Levies:** Optional statutory adjustments on the fee (`taxAdjustment`).

---

## 3. Required Inputs

```typescript
import type { TransactionInput } from '@trivio.ink/core';

const transaction: TransactionInput = {
  grossMinor: 1_000_000,           // LKR 10,000.00 in minor units (cents)
  currency: 'LKR',                 // ISO 4217 3-letter code
  transactionDate: '2026-06-15T10:00:00Z', // ISO 8601 string or Date object
  acquirerId: 'acq_boc',           // Identifier for acquiring bank/gateway
  merchantId: 'mch_retail_store',  // Optional merchant identifier
  terminalId: 'term_counter_01',   // Optional POS terminal identifier
  cardScheme: 'visa',              // Optional: 'visa', 'mastercard', etc.
  cardFundingType: 'debit',         // Optional: 'credit', 'debit', 'prepaid'
  cardRegion: 'domestic',          // Optional: 'domestic', 'international'
};
```

> [!IMPORTANT]
> **No Sensitive Cardholder Data:**
> Never supply Primary Account Numbers (PAN), CVV/CVC, Cardholder PINs, or banking credentials. Trivio operates strictly on sanitized transaction metadata.

---

## 4. Configuration Model & Rule Precedence

Merchant fee agreements are expressed as an array of `MerchantFeeRule` objects:

```typescript
import type { MerchantFeeRule } from '@trivio.ink/core';

const rules: MerchantFeeRule[] = [
  {
    id: 'rule_boc_retail_2026',
    version: '1.0.0',
    acquirerId: 'acq_boc',
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveTo: '2026-12-31T23:59:59Z',
    priority: 0,
    feeStructure: {
      rateBasisPoints: 250, // 2.50% MDR
      fixedFeeMinor: 0,
      minFeeMinor: 500,     // Minimum LKR 5.00
      maxFeeMinor: 100_000, // Maximum LKR 1,000.00
    },
    rateSource: 'merchant_configured',
    description: 'Bank of Ceylon Retail POS Merchant Agreement',
  },
];
```

### Rule Precedence & Specificity

When multiple candidate rules match an authorized transaction:
1. **Explicit Priority:** Rules with higher `priority` values (e.g. `priority: 10` for promotional campaigns) take precedence.
2. **Criteria Specificity:** If priorities tie, the engine chooses the more specific rule based on matched attributes:
   - Terminal Match: `+100` points
   - Merchant Match: `+50` points
   - Card Scheme Match: `+25` points
   - Card Funding Type Match: `+15` points
   - Card Region Match: `+10` points
   - Currency Match: `+5` points
3. **Ambiguity Rejection:** If multiple candidate rules have identical priority and specificity but differing fee structures, the engine throws `RuleConflictError`. It will never guess or pick arbitrarily.

---

## 5. Rounding Policy & Monetary Precision

- **Integer Arithmetic:** All divisions use exact BigInt arithmetic.
- **Round-Half-Up:** Standard commercial rounding policy:
  - Remainder $\ge 5,000 / 10,000$ (0.50 minor unit) rounds up toward positive infinity.
  - Remainder $< 5,000$ rounds down (truncates).
  - Formula: `(grossMinor * rateBasisPoints + 5000) / 10000` (integer division).

---

## 6. Usage Example: Calculating In-Store POS Fee

```typescript
import { calculateFeeEstimate, type TransactionInput, type MerchantFeeRule } from '@trivio.ink/core';

// 1. Transaction context: LKR 10,000.00 sale at Colombo branch
const tx: TransactionInput = {
  grossMinor: 1_000_000,
  currency: 'LKR',
  transactionDate: new Date('2026-06-15T14:30:00Z'),
  acquirerId: 'acq_boc',
  terminalId: 'pos_terminal_01',
  cardScheme: 'visa',
  cardFundingType: 'debit',
};

// 2. Agreed merchant fee schedule
const rules: MerchantFeeRule[] = [
  {
    id: 'rule_boc_pos_visa_debit',
    version: '1.2.0',
    acquirerId: 'acq_boc',
    cardScheme: 'visa',
    cardFundingType: 'debit',
    effectiveFrom: '2026-01-01T00:00:00Z',
    feeStructure: {
      rateBasisPoints: 250, // 2.50%
      fixedFeeMinor: 0,
    },
  },
];

// 3. Calculate estimate
const result = calculateFeeEstimate(tx, rules);

console.log(result);
// {
//   grossMinor: 1000000,
//   currency: 'LKR',
//   totalFeeMinor: 25000,
//   netMinor: 975000,
//   appliedRateBasisPoints: 250,
//   fixedFeeMinor: 0,
//   percentageFeeMinor: 25000,
//   minFeeAdjustmentMinor: null,
//   maxFeeAdjustmentMinor: null,
//   taxMinor: 0,
//   appliedRule: { id: 'rule_boc_pos_visa_debit', version: '1.2.0', priority: 0 },
//   breakdown: { ... },
//   isEstimate: true,
//   rateSource: 'merchant_configured',
//   calculationPolicy: 'trivio-mdr-v1-half-up',
//   calculatedAt: '2026-06-15T14:30:00.123Z'
// }
```

---

## 7. Negative Net Settlement Handling

If fixed charges or minimums exceed the gross transaction amount (e.g. gross 10.00 with a 15.00 fixed fee):
- **Default Policy:** Throws `NegativeNetSettlementError` to prevent silent merchant loss.
- **Permissive Option:** Pass `{ allowNegativeNetSettlement: true }` in options if your accounting system explicitly records negative settlement charges.

---

## 8. Error Handling Reference

| Error Class | Inherits From | Thrown When |
| :--- | :--- | :--- |
| `TrivioValidationError` | `TypeError` | Non-integer minor amount, invalid currency format, invalid date |
| `TrivioRangeError` | `RangeError` | Negative amount, rate $> 10,000$ bps, minFee $>$ maxFee |
| `RuleNotFoundError` | `TrivioError` | No eligible fee rule matches acquirer, date, or card criteria |
| `RuleConflictError` | `TrivioError` | Multiple candidate rules tie in priority and specificity |
| `NegativeNetSettlementError`| `TrivioError` | Total fees exceed gross amount without explicit override |

---

## 9. Backward Compatibility

Stage 1 primitive `estimatePercentageFee(grossMinor, rateBasisPoints)` remains fully supported:

```typescript
import { estimatePercentageFee } from '@trivio.ink/core';

const simple = estimatePercentageFee(1_000_000, 250);
// { grossMinor: 1000000, feeMinor: 25000, netMinor: 975000, rateBasisPoints: 250 }
```

---

## 10. Limitations & Roadmap

- **Authorization Estimates vs. Settlements:** Outputs are estimates at authorization time. Realized credit batches are subject to post-authorization banking adjustments.
- **Settlement Schedules (Stage 2B):** T+1, T+2, bank holiday calendars, and weekend cut-off shift projections will be introduced in Stage 2B.
- **Card Surcharges:** The core engine does not compute customer-facing checkout surcharges; it models merchant acquirer deductions.
