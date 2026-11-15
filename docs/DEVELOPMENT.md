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
│   └── workflows/
│       ├── ci.yml               # Automated build, typecheck, and unit test CI
│       └── pr-description.yml   # PR description quality gate
├── apps/             # Future Next.js and NestJS applications (Placeholders in Stage 1 & 1.1)
│   ├── web/          # Public marketing & calculator portal
│   ├── console/      # Merchant developer dashboard
│   ├── docs/         # Developer documentation hub
│   └── api/          # Hosted cloud microservice
├── packages/         # Core TypeScript libraries & SDKs
│   ├── core/         # @trivio.ink/core: Pure mathematical & settlement engine
│   ├── node/         # @trivio.ink/node: Server-side Node.js SDK foundation
│   └── react/        # @trivio.ink/react: Reusable UI settlement components
├── scripts/          # Zero-dependency maintenance and validation scripts
│   └── validate-pr-description.mjs # PR description validator
├── tests/            # Monorepo tooling and integration tests
└── docs/             # Architecture, design systems, roadmaps
```

## 3. Initial Setup

Clone your developer fork and configure git remotes:

```bash
# Clone the developer fork
git clone https://github.com/chamikathereal/trivio-platform.git
cd trivio-platform

# Add the upstream organization repository
git remote add upstream https://github.com/trivio-ink/trivio-platform.git

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

### Validating PR Descriptions Locally

Before opening a pull request, test your PR markdown description against the governance validator:

```bash
# Test a local markdown file
node scripts/validate-pr-description.mjs --file my_pr_description.md

# Or pass the markdown text directly
node scripts/validate-pr-description.mjs --body "## 1. Executive Summary..."
```

## 5. The 14-Step Fork Development Workflow

1. `git fetch upstream`
2. `git checkout main && git merge --ff-only upstream/main`
3. `git switch -c feat/my-feature`
4. Implement scoped changes.
5. `npm run check`
6. Update documentation and `AGENTS.md`.
7. `git commit -m "feat(scope): concise description"`
8. `git push -u origin feat/my-feature`
9. Open a Pull Request targeting `trivio-ink/trivio-platform:main`.
10. Fill out all 13 sections in `.github/pull_request_template.md`.
11. Confirm CI checks (`CI` and `PR Description Validator`) pass.
12. Review code diff.
13. Merge after approval.
14. Synchronize fork `main` with upstream.

## 6. Engineering & Security Principles

### A. Zero-Float Arithmetic
Never use floating-point math for financial figures. Always use integer minor currency units (e.g. `1000000` for 10,000.00) and `BigInt` intermediate precision.

### B. Strict Rounding Policies
All fee calculation functions must explicitly define and document their rounding behavior. The Stage 1 demonstration primitive uses deterministic **Round-Half-Up**.

### C. Developer-Owned Data Model
Core libraries must remain zero-dependency and executable completely offline. Do not introduce mandatory cloud telemetry or require database connections for core calculations.

### D. Repository Visibility Stance
Both `trivio-ink/trivio-platform` and forks are **public repositories**. Never commit client data, private keys, live bank tokens, `.env` files, or unannounced commercial agreements.
