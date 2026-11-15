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

## Stage 3: Multi-Platform Developer SDKs (`@trivio.ink/node`, `@trivio.ink/react`) (Next)

**Goal:** Provide seamless integration tools for server-side and client-side engineers.

- [ ] **Node.js SDK (`@trivio.ink/node`):**
  - Offline-first configuration manager
  - Middlewares for Express, Fastify, and NestJS
  - Transaction ledger formatting utilities
  - Webhook payload signature verification
- [ ] **React Components (`@trivio.ink/react`):**
  - Merchant fee breakdown visualizer
  - Settlement schedule calendar component
  - Bank account & acquirer settings form fields
  - Accessible, WCAG-compliant design tokens

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
