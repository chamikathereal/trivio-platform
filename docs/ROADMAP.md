# Trivio Platform Roadmap

**Public Brand:** trivio.ink  
**Positioning:** Payment Settlement Intelligence  
**Architecture:** Developer-Owned Payment Data Monorepo

---

## Stage 1: Complete Monorepo Foundation & Repository Recovery (Completed)

**Goal:** Establish clean, secure, type-safe npm Workspaces monorepo and CI foundation. (Merged via PR #1)

- [x] npm Workspaces configuration across `packages/*` and `apps/*`
- [x] Shared TypeScript base configuration with strict compiler flags
- [x] Continuous Integration with GitHub Actions (`ci.yml`)
- [x] Private scoped package manifests (`@trivio.ink/core`, `@trivio.ink/node`, `@trivio.ink/react`)
- [x] Core demonstration primitive: `estimatePercentageFee` with BigInt arithmetic and round-half-up policy
- [x] Comprehensive Vitest test suite for demonstration primitive
- [x] Initial ADR-0001, branding guidelines, development standards, and security policies
- [x] Documented application placeholders for future Next.js and NestJS services

---

## Stage 1.1: Development Governance, CI Verification & Repository Hardening (Completed)

**Goal:** Verify GitHub Actions execution, enforce mandatory PR quality gates, establish permanent agent rules, and harden the repository. (Merged via PR #2)

- [x] Permanent coding agent instructions (`AGENTS.md`)
- [x] 13-section mandatory Pull Request template (`.github/pull_request_template.md`)
- [x] Automated PR description quality validation tool (`scripts/validate-pr-description.mjs`)
- [x] PR description validator GitHub Actions workflow (`.github/workflows/pr-description.yml`)
- [x] Comprehensive test suite for PR validator (10 automated tests)
- [x] 14-step fork-and-upstream development workflow documentation
- [x] Public repository visibility advisory and single-maintainer branch protection rules
- [x] Verification of upstream GitHub Actions CI execution (Run #1 verified success)

---

## Stage 2A: Dynamic Merchant Fee Calculation Engine (Completed)

**Goal:** Implement production-oriented dynamic merchant processing fee calculation engine in `@trivio.ink/core`.

- [x] Structured transaction input schema (grossMinor, currency, acquirerId, terminalId, cardScheme, etc.)
- [x] Declarative merchant fee rule configuration (`MerchantFeeRule`, `FeeStructure`)
- [x] Multi-mode fee structures: percentage MDR, fixed fee, blended rates, min fee floor, max fee ceiling
- [x] Caller-configurable statutory levies and tax adjustments (`taxAdjustment`)
- [x] Deterministic rule matching engine with criteria specificity scoring and priority ranking
- [x] Ambiguity conflict rejection (`RuleConflictError`) and unmatched handling (`RuleNotFoundError`)
- [x] Zero-float integer minor unit arithmetic with BigInt intermediate precision and Round-Half-Up policy
- [x] Negative net settlement protection (`NegativeNetSettlementError`) with permissive override option
- [x] Full backward compatibility with Stage 1 primitive (`estimatePercentageFee`)
- [x] Official brand assets integration (`assets/brand/trivio.ink.png`, approved color palette)
- [x] 71 automated unit tests across 5 test suites (100% passing)

---

## Stage 2B: Dynamic Settlement Calendar Engine (Completed)

**Goal:** Build deterministic settlement cycle and bank holiday calendar intelligence in `@trivio.ink/core`.

- [x] Acquirer settlement cycle modeling (T+0, T+1, T+2, general T+N)
- [x] Business-day and calendar-day cycle advancement models
- [x] POS batch cut-off time windows and boundary evaluations
- [x] Weekend and non-working-day rollover logic ('following_business_day', 'preceding_business_day', 'no_adjustment')
- [x] Configurable working weekdays and developer-/merchant-supplied holiday calendars
- [x] Timezone-safe date decomposition using native ECMAScript Intl with IANA identifiers
- [x] Deterministic settlement policy matching with criteria specificity scoring and conflict detection
- [x] Immutable historical policy snapshots (`deepFreeze`)
- [x] Comprehensive automated test coverage (35 new tests covering all 8 prompt reference examples, edge cases, leap years, DST)
- [x] 122 total automated unit tests passing across all packages (100% pass rate)

---

## Stage 2C: Integrated Merchant Fee and Settlement Intelligence Engine (Completed)

**Goal:** Combine dynamic fee calculation and settlement calendar forecasting into a unified, high-level developer orchestration API in `@trivio.ink/core`.

- [x] Unified financial calculation primitive combining MDR deductions and bank deposit projections (`calculatePaymentSettlementEstimate`)
- [x] Composite calculation result model with complete fee ledger breakdown, net settlement proceeds, and settlement timeline
- [x] Canonical transaction context mapping into underlying fee and settlement engines
- [x] Support for both configuration object and positional argument signatures
- [x] Runtime immutability on composite results and historical snapshots (`deepFreeze`)
- [x] Full backward compatibility with Stage 2A (`calculateFeeEstimate`) and Stage 2B (`estimateSettlementDate`)
- [x] 18 new automated integration tests covering commercial scenarios, terminal scopes, and negative net overrides
- [x] 140 total automated unit tests passing across all packages (100% pass rate)

---

## Stage 3A: Production-Ready Node.js Developer SDK (`@trivio.ink/node`) (Completed)

**Goal:** Transform the `@trivio.ink/node` package into a robust server-side SDK for ERP, POS, and accounting integrations.

- [x] Client initialization with optional pre-configured fee rules, settlement policies, and calendars (`TrivioClient`)
- [x] Multi-merchant isolation and immutability protection on registered configurations (`deepFreeze`)
- [x] Unified calculation methods: `calculateSettlement`, `calculateDynamicFee`, `estimateSettlementDate`, `calculateFee`
- [x] Per-request configuration overrides and default merchant/terminal/currency cascading
- [x] Standardized persistent ledger record generator (`createLedgerRecord`) and summary formatter (`formatLedgerSummary`)
- [x] Working practical ERP integration example (`examples/erp-settlement-integration.ts`)
- [x] 10 new automated unit and integration tests expanding monorepo test coverage to 150 passing tests (100% pass rate)

---

## Stage 3B: React Developer SDK (`@trivio.ink/react`) (Completed)

**Goal:** Deliver accessible, themeable, zero-runtime-dependency React UI components and offline calculation hooks for payment settlement intelligence.

- [x] Compact settlement summary card component (`TrivioSettlementSummary`) displaying gross, fees, net, deposit date, and cycle
- [x] Itemized merchant fee deduction list component (`TrivioFeeBreakdown`) with percentage MDR, fixed fees, boundary caps, tax, and rule snapshot drawer
- [x] Visual settlement progress timeline component (`TrivioSettlementTimeline`) tracking authorization, cut-off evaluation, cycle days, holiday adjustments, and bank payout
- [x] Shared context provider (`TrivioProvider`) and consumption hook (`useTrivio`) for global display currency, theme, and locale defaults
- [x] Instantaneous offline client calculation hook (`useTrivioSettlementEstimate`) with deterministic memoization and error boundary safety
- [x] Zero-float financial formatting utilities (`formatCurrency`, `formatMinorAmount`, `formatRateBps`, `getCurrencyDecimals`, `formatDisplayDate`)
- [x] Official brand tokens and theme palettes (`dark`, `light`, `auto`) utilizing Midnight Navy (`#000b26`), Electric Cyan (`#00ffff`), and Warm White (`#fffefa`)
- [x] Strict financial safety invariant: Complete removal of automatic rate fallbacks; unconfigured fee agreements fail explicitly with `TrivioValidationError`
- [x] Accessibility-first semantic HTML5 markup and verified SSR-safe pure ESM execution
- [x] 27 automated unit and integration tests covering the React SDK and financial safety invariants

---

## Stage 3C-A: npm Release Readiness & Package Acceptance (Completed)

**Goal:** Audit public API contracts, eliminate packaging bloat, verify independent consumer installation, and establish release governance before publishing.

- [x] Package manifest audit across `@trivio.ink/core`, `@trivio.ink/node`, and `@trivio.ink/react`
- [x] Explicit package whitelisting (`"files": ["dist", "README.md"]`) eliminating source code and test suite tarball leakage
- [x] Independent consumer acceptance test suite (`tests/consumer-acceptance.test.ts` & `scripts/verify-consumer-acceptance.mjs`)
- [x] JSON serialization safety verified (zero BigInt crash in client ledger outputs)
- [x] Explicit zero-fee agreement preservation verified across core, node, and react
- [x] Formal Semantic Versioning & Release Policy documentation (`docs/VERSIONING.md`)
- [x] npm Trusted Publishing OIDC integration guide (`docs/NPM_TRUSTED_PUBLISHING.md`)
- [x] Automated release quality gate script (`npm run verify:release`)
- [x] All three SDKs preserved as private (`"private": true`) pending explicit owner authorization
- [x] 183 automated tests passing across 8 test files in the monorepo (100% pass rate)

---

## Stage 3C-B1: Apache-2.0 Corporate Licensing Implementation (Completed)

**Goal:** Implement approved Apache-2.0 corporate licensing (`LIC-2026-001` Rev 2) across `@trivio.ink/core`, `@trivio.ink/node`, and `@trivio.ink/react` under corporate copyright holder `trivio.ink`, while preserving proprietary cloud application boundaries and brand protection.

- [x] Official unmodified Apache-2.0 `LICENSE` files placed in all three SDK packages
- [x] Package-level `NOTICE` files establishing corporate copyright notice (`Copyright 2026 trivio.ink`)
- [x] Corporate copyright headers added to all 34 SDK source files (`// Copyright 2026 trivio.ink`, `// SPDX-License-Identifier: Apache-2.0`)
- [x] Package manifests updated with `"license": "Apache-2.0"` and files whitelist updated to include `LICENSE` and `NOTICE`
- [x] Licensing policy and proprietary boundaries documented in `docs/LICENSING.md`
- [x] Automated licensing verification test suite (`tests/licensing.test.ts`)
- [x] Packaging and distribution verification updated in `scripts/verify-consumer-acceptance.mjs`
- [x] All three SDKs preserved as private (`"private": true`) with zero unauthorized public registry actions
- [x] Monorepo root unencumbered by blanket open-source license, preserving proprietary cloud boundaries

---

## Stage 3C-B2: npm Organization Verification & Release Security Governance (Completed)

**Goal:** Verify `@trivio.ink` scope ownership on npmjs.com, confirm package name availability, establish release runbook and security protocols, and prepare formal authorization report without publishing.

- [x] Project owner verified control of `trivio.ink` organization on npmjs.com (`https://www.npmjs.com/settings/trivio.ink/packages`)
- [x] Public npm registry namespace query verified (404 confirmed for `@trivio.ink/core`, `@trivio.ink/node`, `@trivio.ink/react`; zero conflicts)
- [x] Release governance runbook authored in `docs/NPM_RELEASE_AUTHORIZATION.md`
- [x] Strict dependency release order defined (Core -> Node & React)
- [x] Isolated npm tarball installation acceptance script (`npm run test:tarball`) verified
- [x] All three SDKs preserved as private (`"private": true`) pending Stage 3C-B3 authorization
- [x] 192 / 192 Vitest tests and 65 / 65 release verification checks passing

---

## Stage 3C-B3: First Controlled npm Public Release (Next — Requires Explicit Owner Authorization)

**Goal:** Remove `"private": true` publication guard upon explicit owner authorization, execute controlled initial publication (`v0.1.0`), and verify live registry artifacts.

- [ ] Project owner explicit release authorization for `v0.1.0`
- [ ] Removal of `"private": true` from SDK package manifests
- [ ] Sequential public publication to npm registry (`--access=public`)
- [ ] Live registry smoke tests and post-release external consumer verification
- [ ] Linking of GitHub Actions OIDC Trusted Publisher for future automated patch releases

---

## Stage 4: Merchant Console & Documentation Hub

**Goal:** Deliver modern web applications for developer onboarding and merchant insights.

- [ ] **Marketing Website (`apps/web`):** Next.js marketing portal and interactive fee simulation calculator
- [ ] **Developer Documentation (`apps/docs`):** Next.js documentation hub with code playgrounds and API specifications
- [ ] **Merchant Console (`apps/console`):** Next.js dashboard for acquirer configuration and settlement ledger inspection

---

## Stage 5: Trivio Cloud Hosted API & Intelligence Platform

**Goal:** Introduce hosted cloud intelligence services for merchants seeking automated bank reconciliation.

- [ ] **Hosted Microservice (`apps/api`):** NestJS modular architecture
- [ ] **Platform Persistence:** PostgreSQL + Prisma ORM for cloud user profiles, rate schedules, and audit trails
- [ ] **Acquirer Directory:** Curated, versioned directory of bank rate cards and holiday calendars
- [ ] **Reconciliation Intelligence:** Automated bank statement ingestion, OCR/CSV parsing, and settlement discrepancy alerts
- [ ] **API Authentication & Telemetry:** Multi-tenant API keys, rate limiting, and usage analytics
