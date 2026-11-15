# @trivio.ink/node

> Production-ready server-side Node.js SDK for Trivio Payment Settlement Intelligence.

## 1. Overview & Purpose

`@trivio.ink/node` is Trivio's official server-side client library for Node.js backend applications (Express, Fastify, NestJS, Koa, or custom microservices). It exposes a high-level, developer-friendly interface to Trivio's financial calculation engines without requiring external network telemetry, API keys, or database dependencies.

### Core Architectural Guarantees

- **Zero Cloud Mandate:** Operates 100% locally and offline inside developer infrastructure.
- **Developer-Owned Data:** No database connections are forced by the SDK. Developers persist calculation results in their own databases (PostgreSQL, MySQL, SQLite, MongoDB, etc.).
- **Multi-Merchant Isolation:** Separate `TrivioClient` instances can be initialized per merchant or tenant with isolated agreement rules, settlement policies, and calendars.
- **Runtime Immutability:** Pre-registered configurations and returned ledger snapshots are deeply frozen at runtime using `Object.freeze()` to prevent in-memory tampering.
- **Full Backward Compatibility:** Preserves all existing Stage 1 (`calculateFee`), Stage 2A (`calculateDynamicFee`), Stage 2B (`estimateSettlementDate`), and Stage 2C (`calculateSettlement`) contracts.

---

## 2. Package Status & Installation

> [!NOTE]
> `@trivio.ink/node` is currently a private workspace package (`"private": true`) within the Trivio platform monorepo. It will be published to the public npm registry upon completion of Stage 3C.

Within the monorepo:

```json
{
  "dependencies": {
    "@trivio.ink/node": "*"
  }
}
```

Future public npm installation:

```bash
npm install @trivio.ink/node
```

---

## 3. Client Initialization

### Offline Mode with Pre-Configured Agreements

```typescript
import {
  TrivioClient,
  type MerchantFeeRule,
  type SettlementPolicy,
  type SettlementCalendar,
} from '@trivio.ink/node';

// 1. Agreed merchant fee schedule (e.g. 2.50% MDR)
const feeRules: MerchantFeeRule[] = [
  {
    id: 'rule_boc_retail',
    version: '1.0.0',
    acquirerId: 'ACQ_BOC',
    effectiveFrom: '2026-01-01T00:00:00Z',
    priority: 0,
    feeStructure: { rateBasisPoints: 250, fixedFeeMinor: 0 },
    rateSource: 'merchant_configured',
  },
];

// 2. Acquirer settlement policy (T+1 business days, 17:00 cut-off)
const settlementPolicies: SettlementPolicy[] = [
  {
    id: 'pol_boc_t1',
    version: '1.0.0',
    acquirerId: 'ACQ_BOC',
    effectiveFrom: '2026-01-01',
    priority: 0,
    cycleLength: 1,
    cycleUnit: 'business_days',
    cutOffTime: '17:00',
    timeZone: 'Asia/Colombo',
    calendarId: 'cal_colombo',
    nonWorkingDayConvention: 'following_business_day',
  },
];

// 3. Working day calendar (Monday through Friday)
const calendars: SettlementCalendar[] = [
  {
    id: 'cal_colombo',
    version: '2026.1',
    timeZone: 'Asia/Colombo',
    workingDays: [1, 2, 3, 4, 5],
    holidays: [],
  },
];

// 4. Initialize client with pre-registered agreements and defaults
const client = new TrivioClient({
  defaultMerchantId: 'MCH_RETAIL_STORE',
  defaultTerminalId: 'POS_COUNTER_01',
  defaultCurrency: 'LKR',
  feeRules,
  settlementPolicies,
  calendars,
});
```

---

## 4. Primary Calculation Methods

### A. Integrated Settlement & Fee Calculation (`calculateSettlement`)

Combines MDR deductions, net proceeds, and projected bank deposit date into one unified estimate:

```typescript
const estimate = client.calculateSettlement({
  id: 'tx_retail_1001',
  grossMinor: 1_000_000, // LKR 10,000.00
  currency: 'LKR',
  transactionTime: '2026-11-13T10:00:00+05:30', // Friday 10:00 local
  acquirerId: 'ACQ_BOC',
});

console.log(estimate.totalFeeMinor);           // 25000 (LKR 250.00)
console.log(estimate.netMinor);                // 975000 (LKR 9,750.00)
console.log(estimate.expectedSettlementDate);   // '2026-11-16' (Monday)
console.log(estimate.settlementCycle);         // 'T+1'
console.log(estimate.status);                  // 'ESTIMATED'
```

### B. Dynamic Fee-Only Calculation (`calculateDynamicFee`)

Calculates itemized merchant processing fees against fee agreement rules:

```typescript
const feeResult = client.calculateDynamicFee({
  grossMinor: 500_000,
  currency: 'LKR',
  transactionDate: '2026-11-13T10:00:00Z',
  acquirerId: 'ACQ_BOC',
});

console.log(feeResult.totalFeeMinor); // 12500
console.log(feeResult.netMinor);      // 487500
```

### C. Settlement-Date-Only Estimation (`estimateSettlementDate`)

Projects deposit dates based on cut-off times, holidays, and $T+N$ cycles:

```typescript
const dateResult = client.estimateSettlementDate({
  transactionTime: '2026-11-13T18:30:00+05:30', // After 17:00 cut-off
  acquirerId: 'ACQ_BOC',
  currency: 'LKR',
});

console.log(dateResult.anchorProcessingDate);   // '2026-11-16' (Monday)
console.log(dateResult.expectedSettlementDate); // '2026-11-17' (Tuesday)
```

### D. Basic Percentage Fee (`calculateFee`)

Legacy Stage 1 primitive for fast, standalone percentage math:

```typescript
const basic = client.calculateFee(1_000_000, 250);
// { grossMinor: 1000000, feeMinor: 25000, netMinor: 975000, rateBasisPoints: 250 }
```

---

## 5. Ledger Persistence & Formatting Helpers

To facilitate saving calculation outputs into developer databases, `TrivioClient` provides standardized snapshot and formatting utilities:

```typescript
// 1. Create a standardized, deep-frozen persistent ledger record
const ledgerRecord = client.createLedgerRecord(estimate, {
  invoiceNumber: 'INV-2026-0042',
  cashierId: 'operator_7',
});

// Save to your own relational database (e.g. PostgreSQL, Prisma, TypeORM)
// await db.settlementLedger.create({ data: ledgerRecord });

// 2. Format a human-readable one-line reconciliation summary
console.log(client.formatLedgerSummary(estimate));
// "[Tx: tx_retail_1001] Gross: LKR 10000.00 | Fee: 250.00 | Net: 9750.00 | Deposit: 2026-11-16 (T+1)"
```

---

## 6. Error Handling

`@trivio.ink/node` re-exports the complete typed Trivio error hierarchy:

| Error Class | Inherits From | Thrown When |
| :--- | :--- | :--- |
| `TrivioValidationError` | `TypeError` | Input parameter fails structure or format validation |
| `TrivioRangeError` | `RangeError` | Numerical or bounded values are out of allowable range |
| `RuleNotFoundError` | `TrivioError` | No fee agreement rule matches the transaction criteria |
| `RuleConflictError` | `TrivioError` | Multiple candidate fee rules tie in priority and specificity |
| `NegativeNetSettlementError` | `TrivioError` | Fees exceed gross amount without explicit override |
| `SettlementPolicyNotFoundError` | `TrivioError` | No settlement policy matches acquirer or currency |
| `SettlementPolicyConflictError` | `TrivioError` | Distinct settlement policies tie at identical priority |
| `SettlementCalendarNotFoundError` | `TrivioError` | Matched policy references an unknown calendar ID |
