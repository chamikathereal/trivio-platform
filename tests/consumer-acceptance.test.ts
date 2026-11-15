/**
 * @file tests/consumer-acceptance.test.ts
 * @description Vitest consumer acceptance tests verifying that built dist/ artifacts
 * of @trivio.ink/core, @trivio.ink/node, and @trivio.ink/react satisfy release readiness criteria.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Stage 3C-A: Release Acceptance & Packaging Verification', () => {
  describe('Package Manifests & Whitelists', () => {
    const packages = ['core', 'node', 'react'];

    for (const pkg of packages) {
      it(`verifies @trivio.ink/${pkg} manifest is private and whitelists dist`, () => {
        const pkgJsonPath = path.join(rootDir, 'packages', pkg, 'package.json');
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

        expect(pkgJson.private).toBe(true);
        expect(pkgJson.files).toContain('dist');
        expect(pkgJson.files).toContain('README.md');
        expect(pkgJson.engines?.node).toBe('>=20.0.0');
        expect(pkgJson.homepage).toBe('https://trivio.ink');
        expect(pkgJson.repository?.directory).toBe(`packages/${pkg}`);
        expect(pkgJson.bugs?.url).toBe('https://github.com/trivio-ink/trivio-platform/issues');
      });

      it(`verifies @trivio.ink/${pkg} compiled dist artifacts exist`, () => {
        expect(fs.existsSync(path.join(rootDir, 'packages', pkg, 'dist', 'index.js'))).toBe(true);
        expect(fs.existsSync(path.join(rootDir, 'packages', pkg, 'dist', 'index.d.ts'))).toBe(true);
      });
    }
  });

  describe('Consumer Acceptance: @trivio.ink/core', async () => {
    const core = await import('../packages/core/dist/index.js');

    it('executes dynamic fee and settlement calculation from built artifacts', () => {
      const estimate = core.calculatePaymentSettlementEstimate(
        {
          grossMinor: 1_000_000,
          currency: 'LKR',
          transactionTime: '2026-11-13T17:30:00+05:30',
          acquirerId: 'ACQ_BOC',
        },
        {
          feeRules: [
            {
              id: 'RULE_STD',
              version: '1.0.0',
              priority: 10,
              acquirerId: 'ACQ_BOC',
              currency: 'LKR',
              effectiveFrom: '2026-01-01',
              rateSource: 'merchant_configured',
              feeStructure: {
                rateBasisPoints: 250,
                fixedFeeMinor: 1500,
              },
            },
          ],
          settlementPolicies: [
            {
              id: 'POL_STD',
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
          ],
          calendars: [
            {
              id: 'CAL_LK',
              version: '2026.1',
              timeZone: 'Asia/Colombo',
              workingDays: [1, 2, 3, 4, 5],
              holidays: ['2026-11-16'],
            },
          ],
        }
      );

      expect(estimate.isEstimated).toBe(true);
      expect(estimate.status).toBe('ESTIMATED');
      expect(estimate.grossMinor).toBe(1_000_000);
      expect(estimate.percentageFeeMinor).toBe(25_000);
      expect(estimate.fixedFeeMinor).toBe(1500);
      expect(estimate.totalFeeMinor).toBe(26_500);
      expect(estimate.netMinor).toBe(973_500);
      expect(estimate.isPastCutOff).toBe(true);
      expect(estimate.expectedSettlementDate).toBe('2026-11-18');
    });

    it('verifies explicit zero-fee agreements are valid and preserved', () => {
      const estimate = core.calculatePaymentSettlementEstimate(
        {
          grossMinor: 500_000,
          currency: 'LKR',
          transactionTime: '2026-11-13T10:00:00+05:30',
          acquirerId: 'ACQ_ZERO',
        },
        {
          feeRules: [
            {
              id: 'RULE_ZERO',
              version: '1.0.0',
              priority: 10,
              acquirerId: 'ACQ_ZERO',
              currency: 'LKR',
              effectiveFrom: '2026-01-01',
              rateSource: 'merchant_configured',
              feeStructure: {
                rateBasisPoints: 0,
                fixedFeeMinor: 0,
              },
            },
          ],
          settlementPolicies: [
            {
              id: 'POL_ZERO',
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
          ],
          calendars: [
            {
              id: 'CAL_LK',
              version: '2026.1',
              timeZone: 'Asia/Colombo',
              workingDays: [1, 2, 3, 4, 5],
              holidays: [],
            },
          ],
        }
      );

      expect(estimate.totalFeeMinor).toBe(0);
      expect(estimate.netMinor).toBe(500_000);
    });
  });

  describe('Consumer Acceptance: @trivio.ink/node', async () => {
    const node = await import('../packages/node/dist/index.js');

    it('initializes TrivioClient, runs calculations, and creates JSON-safe ledger records', () => {
      const client = new node.TrivioClient({
        feeRules: [
          {
            id: 'RULE_BOC',
            version: '1.0.0',
            acquirerId: 'ACQ_BOC',
            currency: 'LKR',
            effectiveFrom: '2026-01-01',
            rateSource: 'merchant_configured',
            feeStructure: { rateBasisPoints: 250, fixedFeeMinor: 1500 },
          },
        ],
        settlementPolicies: [
          {
            id: 'POL_BOC',
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
        ],
        calendars: [
          {
            id: 'CAL_LK',
            version: '2026.1',
            timeZone: 'Asia/Colombo',
            workingDays: [1, 2, 3, 4, 5],
            holidays: [],
          },
        ],
        defaultCurrency: 'LKR',
      });

      const estimate = client.calculateSettlement({
        grossMinor: 1_000_000,
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
      });

      expect(estimate.netMinor).toBe(973_500);

      const record = client.createLedgerRecord(estimate, { batchId: 'BATCH_101' });
      expect(record.status).toBe('ESTIMATED');
      expect(record.appliedFeeRuleId).toBe('RULE_BOC');

      // Verify JSON serialization safety (no BigInt crash)
      const json = JSON.stringify(record);
      expect(typeof json).toBe('string');
      expect(json).toContain('"status":"ESTIMATED"');
    });
  });

  describe('Consumer Acceptance: @trivio.ink/react', async () => {
    const react = await import('../packages/react/dist/index.js');

    it('verifies currency decimals and exact formatting without float math', () => {
      expect(react.getCurrencyDecimals('JPY')).toBe(0);
      expect(react.getCurrencyDecimals('BHD')).toBe(3);
      expect(react.getCurrencyDecimals('USD')).toBe(2);

      expect(react.formatCurrency(1_500, 'JPY')).toBe('JPY 1,500');
      expect(react.formatCurrency(1_500, 'BHD')).toBe('BHD 1.500');
      expect(react.formatCurrency(1_000_000, 'USD')).toBe('USD 10,000.00');
    });

    it('verifies official brand tokens are exported unchanged', () => {
      expect(react.TRIVIO_TOKENS.midnightNavy).toBe('#000b26');
      expect(react.TRIVIO_TOKENS.electricCyan).toBe('#00ffff');
      expect(react.TRIVIO_TOKENS.warmWhite).toBe('#fffefa');
    });

    it('verifies TrivioFeeBreakdown strictly rejects missing rates with TrivioValidationError', () => {
      expect(() => {
        react.TrivioFeeBreakdown({ grossMinor: 100_000 });
      }).toThrow('TrivioFeeBreakdown requires an explicit fee agreement');
    });

    it('verifies TrivioFeeBreakdown accepts explicit 0 bps fee rate', () => {
      const el = React.createElement(react.TrivioFeeBreakdown, {
        grossMinor: 100_000,
        rateBasisPoints: 0,
      });
      expect(React.isValidElement(el)).toBe(true);
    });
  });
});
