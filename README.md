<p align="center">
  <img src="./assets/brand/trivio.ink.png" alt="trivio.ink — Payment Settlement Intelligence" width="220" />
</p>

# Trivio — Payment Settlement Intelligence

<p align="center">
  <strong>Deterministic, developer-first payment settlement calculation engine and reconciliation platform.</strong>
</p>

<p align="center">
  <a href="https://trivio.ink">Website</a> •
  <a href="https://docs.trivio.ink">Documentation</a> •
  <a href="https://console.trivio.ink">Console</a> •
  <a href="https://api.trivio.ink">API</a> •
  <a href="https://github.com/trivio-ink">GitHub</a>
</p>

---

## 1. Overview

**Trivio** (`trivio.ink`) provides software engineers and payment operations teams with deterministic intelligence over merchant payment settlements. We bridge the gap between gateway authorization totals and net bank deposits.

### Why Trivio?

- **Developer-Owned Payment Data:** Invoices, payment records, and ledgers remain inside your database. Trivio calculation libraries execute locally inside your infrastructure without mandatory cloud ingestion.
- **Zero-Float Precision:** Calculations use integer minor currency units and `BigInt` intermediate arithmetic, completely eliminating floating-point rounding errors.
- **Explicit Settlement vs. Estimate Distinction:** Clearly delineates estimated fee deductions computed at authorization time from acquirer-confirmed net settlements.
- **Modular Monorepo:** Pure calculation engine (`@trivio.ink/core`), server-side Node.js client (`@trivio.ink/node`), and reusable UI components (`@trivio.ink/react`).

---

## 2. Monorepo Architecture

This repository is organized as an **npm Workspaces** monorepo:

```
trivio-platform/
├── packages/
│   ├── core/         # @trivio.ink/core — Pure, deterministic financial engine
│   ├── node/         # @trivio.ink/node — Server SDK foundation for Node.js
│   └── react/        # @trivio.ink/react — Reusable React settlement components
│
├── apps/             # Application placeholders (Stage 1)
│   ├── web/          # Next.js marketing and fee simulator portal
│   ├── console/      # Next.js merchant settlement dashboard
│   ├── docs/         # Next.js developer documentation hub
│   └── api/          # NestJS hosted cloud API
│
├── docs/             # Architecture, branding, roadmap, and guides
│   ├── architecture/ # ADR-0001 Architecture Decision Record
│   ├── BRANDING.md   # Brand identity and design system
│   ├── ROADMAP.md    # Multi-stage platform roadmap
│   ├── DEVELOPMENT.md# Local setup and engineering guidelines
│   └── GITHUB_SETUP.md# Repository and CI/CD configuration
│
└── .github/          # GitHub Actions CI workflow & issue templates
```

---

## 3. Packages Overview

| Package | Purpose | Private | Dependencies |
| :--- | :--- | :---: | :--- |
| **[`@trivio.ink/core`](./packages/core)** | Pure calculation primitives, fee estimation | Yes | Zero runtime dependencies |
| **[`@trivio.ink/node`](./packages/node)** | Server-side Node.js client foundation | Yes | `@trivio.ink/core` |
| **[`@trivio.ink/react`](./packages/react)** | Reusable React hooks & settlement UI | Yes | `react` (peer), `@trivio.ink/core` |

---

## 4. Quick Start

### Prerequisites

- **Node.js:** Node.js 22 LTS (`>=20.0.0`)
- **Package Manager:** **npm** (`>=10.0.0`)

### Installation & Build

```bash
# Clone the repository
git clone https://github.com/chamikathereal/trivio-platform.git
cd trivio-platform

# Install dependencies and link workspaces
npm install

# Run the complete validation suite (build, typecheck, test)
npm run check
```

### Available Root Scripts

- `npm install` — Installs dependencies and symlinks workspace packages
- `npm run build` — Compiles TypeScript packages into `dist/` with declaration maps
- `npm run typecheck` — Validates strict TypeScript compilation across all packages
- `npm test` — Executes the Vitest test suite
- `npm run check` — Runs `build`, `typecheck`, and `test` sequentially
- `npm ci` — Executes a clean, repeatable installation verified against `package-lock.json`

---

## 5. Stage 1 Demonstration Primitive

The core engine contains a foundational percentage-fee estimation primitive:

```typescript
import { estimatePercentageFee } from '@trivio.ink/core';

// LKR 10,000.00 (1,000,000 minor units) with an illustrative 2.50% (250 bps) MDR
const result = estimatePercentageFee(1_000_000, 250);

console.log(result);
// {
//   grossMinor: 1000000,
//   feeMinor: 25000,
//   netMinor: 975000,
//   rateBasisPoints: 250
// }
```

> **Disclaimer:** This function is a deterministic Stage 1 demonstration primitive for test harness validation. It is **NOT** a bank-certified settlement calculator and does not constitute financial, taxation, or legal advice.

---

## 6. Project Status

| Milestone | Status | Description |
| :--- | :---: | :--- |
| **Stage 1** | **Completed** | Monorepo foundation, npm Workspaces, CI, SDK packages, and documentation (PR #1) |
| **Stage 1.1** | **Completed** | Development governance, AGENTS.md, PR quality gate, repository hardening (PR #2) |
| **Stage 2A** | **Completed** | Dynamic merchant fee calculation engine in `@trivio.ink/core` (PR #8) |
| **Stage 2B** | **Completed** | Dynamic settlement calendar engine, holidays, and cut-off projections (PR #9) |
| **Stage 2C** | **Completed** | Unified fee & settlement intelligence calculation engine (PR #10) |
| **Stage 3A** | **Completed** | Server-side Node.js developer SDK foundation in `@trivio.ink/node` (PR #11) |
| **Stage 3B** | **Completed** | Reusable React hooks & settlement UI components in `@trivio.ink/react` (PR #12, PR #13) |
| **Stage 3C-A** | **Completed** | Independent package packaging acceptance, whitelists, and versioning standards (PR #14) |
| **Stage 3C-B1** | **In Progress** | Formal corporate Apache-2.0 licensing under `trivio.ink` and distribution governance |
| **Stage 3C-B2** | *Planned* | npm registry organization verification and controlled public publication |
| **Stage 4** | *Planned* | Next.js merchant console, documentation portal, and marketing site |
| **Stage 5** | *Planned* | NestJS hosted cloud API with PostgreSQL/Prisma persistence & automated reconciliation |

For details, refer to [ROADMAP.md](./docs/ROADMAP.md).

---

## 7. Security & Licensing

- **Security Policy:** Review our [Security Policy](./SECURITY.md). Never process raw PAN, CVV, or authentication PINs in Trivio generic libraries.
- **Contributing:** Review our [Contribution Guidelines](./CONTRIBUTING.md).
- **Client Developer SDKs Licensing (`packages/*`):** The three SDK packages ([`@trivio.ink/core`](./packages/core), [`@trivio.ink/node`](./packages/node), [`@trivio.ink/react`](./packages/react)) are licensed under the **Apache License, Version 2.0** (`Apache-2.0`), Copyright 2026 `trivio.ink`. Commercial ERP, POS, and accounting integration is permitted without fee or mandatory cloud connectivity.
- **Proprietary Cloud Platform (`apps/*`):** Future hosted cloud applications, reconciliation engines, and multi-tenant services are commercial and subject to separate proprietary terms.
- **Trademarks & Brand Identity:** The name `trivio.ink`, logos, and color tokens are independently protected trademarks and are not granted under the SDK license.
- **Publication Status:** All packages remain private (`"private": true`) pending Stage 3C-B2 release authorization.
- **Policy Reference:** For complete legal terms and boundaries, consult [docs/LICENSING.md](./docs/LICENSING.md).
