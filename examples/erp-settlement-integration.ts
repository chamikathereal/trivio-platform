/**
 * @file examples/erp-settlement-integration.ts
 * @description Practical ERP / POS integration example using the Trivio Node.js SDK (@trivio.ink/node).
 * Demonstrates local calculation, ledger snapshot creation, and persistence into developer-owned storage.
 */

import {
  TrivioClient,
  type IntegratedTransactionInput,
  type MerchantFeeRule,
  type SettlementCalendar,
  type SettlementPolicy,
  type TrivioLedgerRecord,
} from '../packages/node/src/index.js';

/**
 * Developer-owned in-memory ERP ledger database table.
 * Illustrates how enterprise accounting systems store immutable Trivio snapshots.
 */
class ErpTransactionalDatabase {
  private readonly records = new Map<string, TrivioLedgerRecord>();

  public saveLedgerEntry(record: TrivioLedgerRecord): void {
    if (!record.transactionId) {
      throw new Error('Transaction identifier is required for ERP ledger storage.');
    }
    this.records.set(record.transactionId, record);
    console.log(`[ERP DB] Stored ledger record for transaction ${record.transactionId}:`);
    console.log(`  - Gross Minor: ${record.currency} ${record.grossMinor} (${(record.grossMinor / 100).toFixed(2)})`);
    console.log(`  - Fee Minor:   ${record.currency} ${record.totalFeeMinor} (${(record.totalFeeMinor / 100).toFixed(2)})`);
    console.log(`  - Net Minor:   ${record.currency} ${record.netMinor} (${(record.netMinor / 100).toFixed(2)})`);
    console.log(`  - Expected Bank Deposit: ${record.expectedSettlementDate} (${record.settlementCycle})`);
  }

  public getLedgerEntry(transactionId: string): TrivioLedgerRecord | undefined {
    return this.records.get(transactionId);
  }
}

/**
 * Main ERP integration execution workflow.
 */
export function runErpIntegrationExample(): {
  grossMinor: number;
  totalFeeMinor: number;
  netMinor: number;
  expectedSettlementDate: string;
} {
  console.log('=== TRIVIO NODE SDK — ERP SETTLEMENT INTEGRATION EXAMPLE ===\n');

  // 1. Configure merchant acquiring fee agreements (2.50% MDR on Bank of Ceylon)
  const feeRules: MerchantFeeRule[] = [
    {
      id: 'rule_boc_retail_pos',
      version: '1.0.0',
      acquirerId: 'ACQ_BOC',
      effectiveFrom: '2026-01-01T00:00:00Z',
      priority: 0,
      feeStructure: {
        rateBasisPoints: 250, // 2.50%
        fixedFeeMinor: 0,
      },
      rateSource: 'merchant_configured',
      description: 'Standard retail POS merchant agreement with Bank of Ceylon',
    },
  ];

  // 2. Configure acquirer settlement policy (T+1 business days, 17:00 cut-off)
  const settlementPolicies: SettlementPolicy[] = [
    {
      id: 'pol_boc_retail_t1',
      version: '1.0.0',
      acquirerId: 'ACQ_BOC',
      effectiveFrom: '2026-01-01',
      priority: 0,
      cycleLength: 1, // T+1
      cycleUnit: 'business_days',
      cutOffTime: '17:00',
      timeZone: 'Asia/Colombo',
      calendarId: 'cal_sri_lanka_commercial',
      nonWorkingDayConvention: 'following_business_day',
      description: 'Bank of Ceylon retail POS T+1 settlement cycle',
    },
  ];

  // 3. Configure working days and holiday calendar (Monday through Friday, Asia/Colombo)
  const calendars: SettlementCalendar[] = [
    {
      id: 'cal_sri_lanka_commercial',
      version: '2026.1',
      timeZone: 'Asia/Colombo',
      workingDays: [1, 2, 3, 4, 5],
      holidays: [],
      description: 'Standard commercial banking calendar',
    },
  ];

  // 4. Initialize Trivio Node SDK client with pre-configured agreements
  const client = new TrivioClient({
    defaultMerchantId: 'MCH_COLOMBO_FLAGSHIP',
    defaultTerminalId: 'POS_TERMINAL_01',
    defaultCurrency: 'LKR',
    feeRules,
    settlementPolicies,
    calendars,
  });

  console.log(`[TrivioClient] Initialized v${client.version} in offline deterministic mode.`);

  // 5. Authorize a sale: LKR 10,000.00 on Friday morning, 13 Nov 2026 at 10:00 local
  const saleTransaction: IntegratedTransactionInput = {
    id: 'TX_ERP_20261113_001',
    grossMinor: 1_000_000, // LKR 10,000.00
    currency: 'LKR',
    transactionTime: '2026-11-13T10:00:00+05:30', // Friday before cut-off
    acquirerId: 'ACQ_BOC',
  };

  // 6. Calculate consolidated fee deduction and projected bank deposit date
  const estimate = client.calculateSettlement(saleTransaction);

  console.log('\n[Trivio] Calculation Result:');
  console.log(client.formatLedgerSummary(estimate));

  // 7. Store standardized, JSON-safe calculation snapshot in ERP database
  const erpDb = new ErpTransactionalDatabase();
  const ledgerRecord = client.createLedgerRecord(estimate, {
    invoiceNumber: 'INV-2026-9901',
    posOperator: 'cashier_04',
  });

  erpDb.saveLedgerEntry(ledgerRecord);

  // 8. Verify historical retrieval from ERP database
  const retrieved = erpDb.getLedgerEntry('TX_ERP_20261113_001');
  if (!retrieved) {
    throw new Error('Failed to retrieve record from ERP database.');
  }

  console.log('\n[ERP DB] Verified historical record immutability: Object is frozen =', Object.isFrozen(retrieved));
  console.log('=== ERP INTEGRATION COMPLETE ===\n');

  return {
    grossMinor: estimate.grossMinor,
    totalFeeMinor: estimate.totalFeeMinor,
    netMinor: estimate.netMinor,
    expectedSettlementDate: estimate.expectedSettlementDate,
  };
}

// Self-execute when run via node
if (typeof process !== 'undefined' && process.argv[1]?.includes('erp-settlement-integration')) {
  runErpIntegrationExample();
}
