import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const testDir = path.join(os.tmpdir(), `trivio-tarball-install-test-${Date.now()}`);
fs.mkdirSync(testDir, { recursive: true });
console.log(`\n===========================================================`);
console.log(`TRIVIO STAGE 3C-B1: ISOLATED TARBALL CONSUMER TEST`);
console.log(`Test Directory: ${testDir}`);
console.log(`===========================================================\n`);

try {
  // 1. Pack core
  console.log('1. Packing @trivio.ink/core...');
  const coreOutput = execSync('npm pack --workspace=@trivio.ink/core', { cwd: rootDir, encoding: 'utf8' });
  const coreTarball = coreOutput.trim().split('\n').filter(Boolean).pop().trim();
  const coreTarballPath = path.resolve(rootDir, coreTarball);
  console.log(`  ✓ Packed: ${coreTarballPath}`);

  // 2. Pack node
  console.log('2. Packing @trivio.ink/node...');
  const nodeOutput = execSync('npm pack --workspace=@trivio.ink/node', { cwd: rootDir, encoding: 'utf8' });
  const nodeTarball = nodeOutput.trim().split('\n').filter(Boolean).pop().trim();
  const nodeTarballPath = path.resolve(rootDir, nodeTarball);
  console.log(`  ✓ Packed: ${nodeTarballPath}`);

  // 3. Pack react
  console.log('3. Packing @trivio.ink/react...');
  const reactOutput = execSync('npm pack --workspace=@trivio.ink/react', { cwd: rootDir, encoding: 'utf8' });
  const reactTarball = reactOutput.trim().split('\n').filter(Boolean).pop().trim();
  const reactTarballPath = path.resolve(rootDir, reactTarball);
  console.log(`  ✓ Packed: ${reactTarballPath}`);

  // 4. In temporary consumer directory, create package.json and install
  fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
    name: 'test-consumer',
    version: '1.0.0',
    type: 'module',
    dependencies: {}
  }, null, 2));

  console.log('\n4. Installing tarballs into isolated consumer environment...');
  execSync(`npm install "${coreTarballPath}" react@19.0.0 react-dom@19.0.0`, { cwd: testDir, stdio: 'inherit' });
  execSync(`npm install "${nodeTarballPath}"`, { cwd: testDir, stdio: 'inherit' });
  execSync(`npm install "${reactTarballPath}"`, { cwd: testDir, stdio: 'inherit' });

  // 5. Run verification script in isolated environment
  console.log('\n5. Executing standalone consumer runtime script in isolated consumer directory...');
  const consumerScript = `
import { calculatePaymentSettlementEstimate } from '@trivio.ink/core';
import { TrivioClient } from '@trivio.ink/node';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TrivioFeeBreakdown, TrivioSettlementSummary } from '@trivio.ink/react';

console.log('--- Executing Consumer Logic ---');

// A. Test Core Calculation
const txn = {
  grossMinor: 1000000,
  currency: 'LKR',
  transactionTime: '2026-11-13T17:30:00+05:30',
  acquirerId: 'ACQ_BOC'
};

const feeRules = [{
  id: 'RULE_STD',
  version: '1.0.0',
  priority: 10,
  acquirerId: 'ACQ_BOC',
  currency: 'LKR',
  effectiveFrom: '2026-01-01',
  rateSource: 'merchant_configured',
  feeStructure: {
    rateBasisPoints: 250,
    fixedFeeMinor: 1500
  }
}];

const settlementPolicies = [{
  id: 'POL_STD',
  version: '1.0.0',
  acquirerId: 'ACQ_BOC',
  currency: 'LKR',
  effectiveFrom: '2026-01-01',
  cycleLength: 1,
  cycleUnit: 'business_days',
  cutOffTime: '16:00:00',
  timeZone: 'Asia/Colombo',
  calendarId: 'CAL_LK'
}];

const calendars = [{
  id: 'CAL_LK',
  version: '2026.1',
  timeZone: 'Asia/Colombo',
  workingDays: [1, 2, 3, 4, 5],
  holidays: ['2026-11-16']
}];

const coreEstimate = calculatePaymentSettlementEstimate(txn, { feeRules, settlementPolicies, calendars });
console.log('  ✓ Core: netMinor = ' + coreEstimate.netMinor + ', totalFeeMinor = ' + coreEstimate.totalFeeMinor);
if (coreEstimate.netMinor !== 973500) throw new Error('Core net minor mismatch: ' + coreEstimate.netMinor);

// B. Test Node Client
const client = new TrivioClient({
  defaultMerchantId: 'mch_001',
  feeRules,
  settlementPolicies,
  calendars
});

const nodeResult = client.calculateSettlement(txn);
console.log('  ✓ Node SDK: netMinor = ' + nodeResult.netMinor + ', status = ' + nodeResult.status);
const ledgerRecord = client.createLedgerRecord(nodeResult);
const serializedLedger = JSON.stringify(ledgerRecord);
console.log('  ✓ Node SDK: JSON ledger serialization safe (length: ' + serializedLedger.length + ' bytes)');

// C. Test React Server Rendering
const htmlSummary = renderToStaticMarkup(
  React.createElement(TrivioSettlementSummary, {
    grossMinor: 1000000,
    netMinor: 973500,
    totalFeeMinor: 26500,
    currency: 'LKR',
    expectedSettlementDate: '2026-11-18'
  })
);
console.log('  ✓ React TrivioSettlementSummary SSR rendered HTML (' + htmlSummary.length + ' bytes)');
if (!htmlSummary.includes('9,735.00')) throw new Error('React SSR missing formatted net');

const htmlBreakdown = renderToStaticMarkup(
  React.createElement(TrivioFeeBreakdown, {
    grossMinor: 1000000,
    rateBasisPoints: 250,
    currency: 'LKR',
    totalFeeMinor: 26500
  })
);
console.log('  ✓ React TrivioFeeBreakdown SSR rendered HTML (' + htmlBreakdown.length + ' bytes)');
if (!htmlBreakdown.includes('2.50%')) throw new Error('React SSR missing formatted rate');

console.log('\\n>>> ALL ISOLATED CONSUMER ACCEPTANCE TESTS PASSED FLAWLESSLY! <<<\\n');
`;

  fs.writeFileSync(path.join(testDir, 'test.mjs'), consumerScript, 'utf8');
  execSync('node test.mjs', { cwd: testDir, stdio: 'inherit' });

} finally {
  // Cleanup generated tarballs in monorepo
  try {
    fs.readdirSync(rootDir).forEach(f => {
      if (f.endsWith('.tgz')) {
        fs.unlinkSync(path.join(rootDir, f));
      }
    });
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log(`Cleaned up temporary test environment.`);
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }
}
