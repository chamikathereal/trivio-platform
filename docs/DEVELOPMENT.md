# Trivio Development Guide

Welcome to the Trivio Platform developer guide. This document details local environment setup, engineering workflows, monorepo commands, and quality standards.

## 1. Prerequisites

- **Node.js:** Node.js 22 LTS (`>=20.0.0` required). Verify with `node --version`.
- **npm:** npm 10+ / 11+ (`>=10.0.0` required). Verify with `npm --version`.
- **Operating System:** Cross-platform (Windows, macOS, Linux).
- **Git:** Git 2.30+.

> **Note on Tooling:** This monorepo uses **npm Workspaces** exclusively. Do not introduce Yarn, pnpm, Bun, Turborepo, or Nx.

## 2. Repository Layout

```
trivio-platform/
├── .github/          # GitHub Actions CI and issue/PR templates
├── apps/             # Future Next.js and NestJS applications (Placeholders in Stage 1)
│   ├── web/          # Public marketing & calculator portal
│   ├── console/      # Merchant developer dashboard
│   ├── docs/         # Developer documentation hub
│   └── api/          # Hosted cloud microservice
├── packages/         # Core TypeScript libraries & SDKs
│   ├── core/         # @trivio.ink/core: Pure mathematical & settlement engine
│   ├── node/         # @trivio.ink/node: Server-side Node.js SDK foundation
│   └── react/        # @trivio.ink/react: Reusable UI settlement components
└── docs/             # Architecture, design systems, roadmaps
```

## 3. Initial Setup

Clone the repository and install dependencies at the repository root:

```bash
# Clone the repository
git clone https://github.com/chamikathereal/trivio-platform.git
cd trivio-platform

# Install dependencies and link workspaces
npm install
```

## 4. Primary Monorepo Commands

The root `package.json` coordinates all workspace tasks:

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm install` | Install & link | Installs root dependencies and symlinks workspace packages |
| `npm run build` | Compile TypeScript | Compiles all packages to `dist/` with `.d.ts` declarations |
| `npm run typecheck` | Type checking | Runs `tsc --noEmit` across all workspace packages |
| `npm test` | Run unit tests | Executes all Vitest unit tests across the monorepo |
| `npm run check` | Full validation | Sequential verification (`build` → `typecheck` → `test`) |
| `npm ci` | Clean install | Reinstalls exact dependencies against `package-lock.json` |

### Working on a Specific Package

You can target any individual workspace with npm's `-w` or `--workspace` flag:

```bash
# Run tests only in core
npm test -w @trivio.ink/core

# Build only the node SDK
npm run build -w @trivio.ink/node

# Typecheck only react components
npm run typecheck -w @trivio.ink/react
```

## 5. Engineering Principles

### A. Zero-Float Arithmetic
Never use floating-point math for financial figures. Always use integer minor currency units (e.g. `1000000` for 10,000.00) and `BigInt` intermediate precision.

### B. Strict Rounding Policies
All fee calculation functions must explicitly define and document their rounding behavior. The Stage 1 demonstration primitive uses deterministic **Round-Half-Up**.

### C. Developer-Owned Data Model
Core libraries must remain zero-dependency and executable completely offline. Do not introduce mandatory cloud telemetry or require database connections for core calculations.

### D. Private Packages
During Stage 1 and early development, all packages are flagged `"private": true`. Do not publish packages to npm until officially authorized.
