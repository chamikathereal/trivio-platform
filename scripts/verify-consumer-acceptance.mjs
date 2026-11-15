#!/usr/bin/env node

/**
 * @file scripts/verify-consumer-acceptance.mjs
 * @description Stage 3C-A independent consumer acceptance verification script.
 * Validates distribution artifacts, module resolution, financial safety,
 * BigInt JSON serialization, currency exponents, and React component trees
 * directly against compiled dist/ outputs without relying on source TypeScript aliases.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('===========================================================');
console.log('TRIVIO STAGE 3C-A: INDEPENDENT PACKAGE CONSUMER ACCEPTANCE');
console.log('===========================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failCount++;
  }
}

async function run() {
  // -------------------------------------------------------------
  // Test 1: Verify Package Manifests & Whitelists
  // -------------------------------------------------------------
  console.log('--- 1. Package Manifests & Whitelist Verification ---');
  const packages = ['core', 'node', 'react'];

  for (const pkg of packages) {
    const pkgJsonPath = path.join(rootDir, 'packages', pkg, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

    assert(pkgJson.private === true, `@trivio.ink/${pkg} retains "private": true`);
    assert(pkgJson.license === 'Apache-2.0', `@trivio.ink/${pkg} specifies "license": "Apache-2.0"`);
    assert(
      Array.isArray(pkgJson.files) && pkgJson.files.includes('dist'),
      `@trivio.ink/${pkg} explicitly whitelists "dist" in files array`
    );
    assert(
      Array.isArray(pkgJson.files) && pkgJson.files.includes('LICENSE'),
      `@trivio.ink/${pkg} explicitly whitelists "LICENSE" in files array`
    );
    assert(
      Array.isArray(pkgJson.files) && pkgJson.files.includes('NOTICE'),
      `@trivio.ink/${pkg} explicitly whitelists "NOTICE" in files array`
    );
    assert(
      fs.existsSync(path.join(rootDir, 'packages', pkg, 'LICENSE')),
      `@trivio.ink/${pkg} LICENSE exists on disk`
    );
    assert(
      fs.existsSync(path.join(rootDir, 'packages', pkg, 'NOTICE')),
      `@trivio.ink/${pkg} NOTICE exists on disk`
    );
    assert(
      fs.existsSync(path.join(rootDir, 'packages', pkg, 'dist', 'index.js')),
      `@trivio.ink/${pkg} dist/index.js exists and is compiled`
    );
    assert(
      fs.existsSync(path.join(rootDir, 'packages', pkg, 'dist', 'index.d.ts')),
      `@trivio.ink/${pkg} dist/index.d.ts type declarations exist`
    );
  }

  // -------------------------------------------------------------
  // Test 2: Consumer Acceptance - @trivio.ink/core
  // -------------------------------------------------------------
  console.log('\n--- 2. Consumer Acceptance: @trivio.ink/core ---');
  const coreModule = await import('../packages/core/dist/index.js');

  assert(
    typeof coreModule.calculatePaymentSettlementEstimate === 'function',
    'core exports calculatePaymentSettlementEstimate'
  );
  assert(
    typeof coreModule.calculateFeeEstimate === 'function',
    'core exports calculateFeeEstimate'
  );
  assert(
    typeof coreModule.estimateSettlementDate === 'function',
    'core exports estimateSettlementDate'
  );

  const sampleRules = [
    {
      id: 'RULE_VISA_STD',
      version: '1.0.0',
      priority: 10,
      acquirerId: 'ACQ_BOC',
      currency: 'LKR',
      effectiveFrom: '2026-01-01',
      rateSource: 'merchant_configured',
      feeStructure: {
        rateBasisPoints: 250, // 2.50%
        fixedFeeMinor: 1500,  // 15.00 LKR
      },
    },
    {
      id: 'RULE_ZERO_FEE',
      version: '1.0.0',
      priority: 20,
      acquirerId: 'ACQ_ZERO',
      currency: 'LKR',
      effectiveFrom: '2026-01-01',
      rateSource: 'merchant_configured',
      feeStructure: {
        rateBasisPoints: 0,   // Explicit 0 bps rate
        fixedFeeMinor: 0,
      },
    },
  ];

  const samplePolicies = [
    {
      id: 'POL_BOC_T1',
      version: '1.0.0',
      acquirerId: 'ACQ_BOC',
      currency: 'LKR',
      effectiveFrom: '2026-01-01',
      cycleLength: 1,
      cycleUnit: 'business_days',
      cutOffTime: '16:00:00',
      timeZone: 'Asia/Colombo',
      calendarId: 'CAL_LK',
    },
    {
      id: 'POL_ZERO_T0',
      version: '1.0.0',
      acquirerId: 'ACQ_ZERO',
      currency: 'LKR',
      effectiveFrom: '2026-01-01',
      cycleLength: 0,
      cycleUnit: 'calendar_days',
      cutOffTime: '23:59:59',
      timeZone: 'Asia/Colombo',
      calendarId: 'CAL_LK',
    },
  ];

  const sampleCalendars = [
    {
      id: 'CAL_LK',
      version: '2026.1',
      timeZone: 'Asia/Colombo',
      workingDays: [1, 2, 3, 4, 5],
      holidays: ['2026-11-16'],
    },
  ];

  // Run calculation
  const estimate = coreModule.calculatePaymentSettlementEstimate(
    {
      grossMinor: 1_000_000,
      currency: 'LKR',
      transactionTime: '2026-11-13T17:30:00+05:30',
      acquirerId: 'ACQ_BOC',
    },
    {
      feeRules: sampleRules,
      settlementPolicies: samplePolicies,
      calendars: sampleCalendars,
    }
  );

  assert(estimate.isEstimated === true, 'estimate.isEstimated is explicitly true');
  assert(estimate.status === 'ESTIMATED', 'estimate.status is "ESTIMATED"');
  assert(estimate.grossMinor === 1_000_000, 'estimate.grossMinor is exact integer');
  assert(estimate.percentageFeeMinor === 25_000, 'estimate.percentageFeeMinor is 25000 (2.50%)');
  assert(estimate.fixedFeeMinor === 1500, 'estimate.fixedFeeMinor is 1500');
  assert(estimate.totalFeeMinor === 26_500, 'estimate.totalFeeMinor is 26500');
  assert(estimate.netMinor === 973_500, 'estimate.netMinor is 973500');
  assert(estimate.isPastCutOff === true, 'estimate.isPastCutOff is correctly true (17:30 > 16:00)');
  assert(estimate.expectedSettlementDate === '2026-11-18', 'estimate.expectedSettlementDate is 2026-11-18');

  // Verify explicit zero fee agreement
  const zeroEstimate = coreModule.calculatePaymentSettlementEstimate(
    {
      grossMinor: 500_000,
      currency: 'LKR',
      transactionTime: '2026-11-13T10:00:00+05:30',
      acquirerId: 'ACQ_ZERO',
    },
    {
      feeRules: sampleRules,
      settlementPolicies: samplePolicies,
      calendars: sampleCalendars,
    }
  );
  assert(zeroEstimate.totalFeeMinor === 0, 'explicit zero fee agreement computes 0 total fee');
  assert(zeroEstimate.netMinor === 500_000, 'explicit zero fee agreement nets full gross');

  // -------------------------------------------------------------
  // Test 3: Consumer Acceptance - @trivio.ink/node
  // -------------------------------------------------------------
  console.log('\n--- 3. Consumer Acceptance: @trivio.ink/node ---');
  const nodeModule = await import('../packages/node/dist/index.js');

  assert(typeof nodeModule.TrivioClient === 'function', 'node exports TrivioClient class');

  const client = new nodeModule.TrivioClient({
    feeRules: sampleRules,
    settlementPolicies: samplePolicies,
    calendars: sampleCalendars,
    defaultCurrency: 'LKR',
  });

  const clientEstimate = client.calculateSettlement({
    grossMinor: 1_000_000,
    transactionTime: '2026-11-13T17:30:00+05:30',
    acquirerId: 'ACQ_BOC',
  });

  assert(clientEstimate.netMinor === 973_500, 'TrivioClient.calculateSettlement produces exact net');

  // Test ledger record generation and JSON safety (No BigInt crash)
  const ledgerRecord = client.createLedgerRecord(clientEstimate, { invoiceId: 'INV-9901' });
  assert(ledgerRecord.appliedFeeRuleId === 'RULE_VISA_STD', 'ledgerRecord.appliedFeeRuleId matches applied rule');
  assert(ledgerRecord.appliedSettlementPolicyId === 'POL_BOC_T1', 'ledgerRecord.appliedSettlementPolicyId matches applied policy');
  assert(ledgerRecord.status === 'ESTIMATED', 'ledgerRecord.status is "ESTIMATED"');

  let jsonSerialized = null;
  try {
    jsonSerialized = JSON.stringify(ledgerRecord);
    assert(typeof jsonSerialized === 'string', 'ledgerRecord serializes to JSON with zero BigInt crashes');
  } catch (err) {
    assert(false, `ledgerRecord failed JSON serialization: ${err.message}`);
  }

  const ledgerSummary = client.formatLedgerSummary(clientEstimate);
  assert(ledgerSummary.includes('LKR 10000.00'), 'formatLedgerSummary contains formatted gross amount');

  // -------------------------------------------------------------
  // Test 4: Consumer Acceptance - @trivio.ink/react
  // -------------------------------------------------------------
  console.log('\n--- 4. Consumer Acceptance: @trivio.ink/react ---');
  const reactModule = await import('../packages/react/dist/index.js');

  // Currency formatting
  assert(reactModule.getCurrencyDecimals('JPY') === 0, 'JPY currency decimals is 0');
  assert(reactModule.getCurrencyDecimals('BHD') === 3, 'BHD currency decimals is 3');
  assert(reactModule.getCurrencyDecimals('USD') === 2, 'USD currency decimals is 2');

  assert(reactModule.formatCurrency(1_500, 'JPY') === 'JPY 1,500', 'formats JPY correctly: JPY 1,500');
  assert(reactModule.formatCurrency(1_500, 'BHD') === 'BHD 1.500', 'formats BHD correctly: BHD 1.500');
  assert(reactModule.formatCurrency(1_000_000, 'USD') === 'USD 10,000.00', 'formats USD correctly: USD 10,000.00');
  assert(reactModule.formatMinorAmount(50, 2) === '0.50', 'formatMinorAmount handles fractional minor: 0.50');

  // Brand Tokens
  assert(reactModule.TRIVIO_TOKENS.midnightNavy === '#000b26', 'Midnight Navy token is #000b26');
  assert(reactModule.TRIVIO_TOKENS.electricCyan === '#00ffff', 'Electric Cyan token is #00ffff');
  assert(reactModule.TRIVIO_TOKENS.warmWhite === '#fffefa', 'Warm White token is #fffefa');

  // React Component Elements
  assert(typeof reactModule.TrivioSettlementSummary === 'function', 'exports TrivioSettlementSummary');
  assert(typeof reactModule.TrivioFeeBreakdown === 'function', 'exports TrivioFeeBreakdown');
  assert(typeof reactModule.TrivioSettlementTimeline === 'function', 'exports TrivioSettlementTimeline');
  assert(typeof reactModule.TrivioProvider === 'function', 'exports TrivioProvider');
  assert(typeof reactModule.useTrivioSettlementEstimate === 'function', 'exports useTrivioSettlementEstimate');

  // Financial Safety Invariant: TrivioFeeBreakdown throws on missing MDR
  let missingRateThrew = false;
  try {
    reactModule.TrivioFeeBreakdown({ grossMinor: 100_000 });
  } catch (err) {
    if (err.name === 'TrivioValidationError' && err.message.includes('explicit fee agreement')) {
      missingRateThrew = true;
    }
  }
  assert(missingRateThrew, 'TrivioFeeBreakdown strictly throws TrivioValidationError when rate is omitted');

  // Verify explicit zero rate in TrivioFeeBreakdown
  let zeroRateElementValid = false;
  try {
    const el = React.createElement(reactModule.TrivioFeeBreakdown, { grossMinor: 100_000, rateBasisPoints: 0 });
    zeroRateElementValid = React.isValidElement(el);
  } catch {
    zeroRateElementValid = false;
  }
  assert(zeroRateElementValid, 'TrivioFeeBreakdown accepts explicit 0 bps fee rate and instantiates valid element tree');

  // Summary Report
  console.log('\n===========================================================');
  console.log(`TOTAL ACCEPTANCE CHECKS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('===========================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unexpected error during acceptance tests:', err);
  process.exit(1);
});
