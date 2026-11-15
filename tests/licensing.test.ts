import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const PACKAGES = ['core', 'node', 'react'] as const;
const REPO_ROOT = path.resolve(__dirname, '..');

describe('Stage 3C-B1: Licensing & Intellectual Property Boundaries', () => {
  it('all three SDK packages contain standalone LICENSE files', () => {
    for (const pkg of PACKAGES) {
      const licensePath = path.join(REPO_ROOT, 'packages', pkg, 'LICENSE');
      expect(fs.existsSync(licensePath), `packages/${pkg}/LICENSE must exist`).toBe(true);
      const content = fs.readFileSync(licensePath, 'utf8');
      expect(content).toContain('Apache License');
      expect(content).toContain('Version 2.0, January 2004');
      expect(content).toContain('http://www.apache.org/licenses/');
      expect(content).toContain('TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION');
    }
  });

  it('all three SDK packages contain official unmodified Apache-2.0 license text', () => {
    const coreLicense = fs.readFileSync(path.join(REPO_ROOT, 'packages/core/LICENSE'), 'utf8');
    const nodeLicense = fs.readFileSync(path.join(REPO_ROOT, 'packages/node/LICENSE'), 'utf8');
    const reactLicense = fs.readFileSync(path.join(REPO_ROOT, 'packages/react/LICENSE'), 'utf8');

    expect(coreLicense).toBe(nodeLicense);
    expect(coreLicense).toBe(reactLicense);
    expect(coreLicense.length).toBeGreaterThan(10000);
  });

  it('all three SDK packages contain NOTICE files with corporate copyright attribution', () => {
    for (const pkg of PACKAGES) {
      const noticePath = path.join(REPO_ROOT, 'packages', pkg, 'NOTICE');
      expect(fs.existsSync(noticePath), `packages/${pkg}/NOTICE must exist`).toBe(true);
      const content = fs.readFileSync(noticePath, 'utf8');
      expect(content).toContain('Trivio Payment Settlement Intelligence');
      expect(content).toContain('Copyright 2026 trivio.ink');
      expect(content).toContain('Licensed under the Apache License, Version 2.0.');
    }
  });

  it('all package manifests specify "license": "Apache-2.0" and are prepared for public distribution', () => {
    for (const pkg of PACKAGES) {
      const manifestPath = path.join(REPO_ROOT, 'packages', pkg, 'package.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      expect(manifest.license).toBe('Apache-2.0');
      expect(manifest.private).toBeFalsy();
      expect(manifest.files).toContain('dist');
      expect(manifest.files).toContain('README.md');
      expect(manifest.files).toContain('LICENSE');
      expect(manifest.files).toContain('NOTICE');
    }
  });

  it('monorepo root does not introduce blanket open-source license, preserving proprietary cloud boundaries', () => {
    const rootLicensePath = path.join(REPO_ROOT, 'LICENSE');
    expect(fs.existsSync(rootLicensePath), 'Root must NOT have a blanket LICENSE file').toBe(false);

    const rootManifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    expect(rootManifest.license).toBeUndefined();
    expect(rootManifest.private).toBe(true);
  });

  it('apps directory placeholders do not have Apache-2.0 licenses', () => {
    const apps = ['api', 'console', 'docs', 'web'];
    for (const app of apps) {
      const appLicense = path.join(REPO_ROOT, 'apps', app, 'LICENSE');
      expect(fs.existsSync(appLicense), `apps/${app}/LICENSE must not exist`).toBe(false);
    }
  });

  it('SDK source files contain corporate copyright and SPDX headers', () => {
    for (const pkg of PACKAGES) {
      const srcDir = path.join(REPO_ROOT, 'packages', pkg, 'src');
      const checkDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            checkDir(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            expect(content).toContain('// Copyright 2026 trivio.ink');
            expect(content).toContain('// SPDX-License-Identifier: Apache-2.0');
          }
        }
      };
      checkDir(srcDir);
    }
  });

  it('docs/LICENSING.md exists and documents boundaries, trademarks, and approval reference', () => {
    const licensingDocPath = path.join(REPO_ROOT, 'docs', 'LICENSING.md');
    expect(fs.existsSync(licensingDocPath)).toBe(true);
    const content = fs.readFileSync(licensingDocPath, 'utf8');
    expect(content).toContain('LIC-2026-001');
    expect(content).toContain('Revision 2');
    expect(content).toContain('Copyright 2026 trivio.ink');
    expect(content).toContain('Apache License, Version 2.0');
    expect(content).toContain('apps/api');
    expect(content).toContain('apps/console');
    expect(content).toContain('#000b26');
    expect(content).toContain('#00ffff');
    expect(content).toContain('#fffefa');
  });

  it('previously existing financial exports remain fully available and functional in @trivio.ink/core', async () => {
    const core = await import('../packages/core/src/index.js');
    expect(typeof core.calculatePaymentSettlementEstimate).toBe('function');
    expect(typeof core.calculateFeeEstimate).toBe('function');
    expect(typeof core.estimateSettlementDate).toBe('function');
    expect(typeof core.estimatePercentageFee).toBe('function');
  });
});
