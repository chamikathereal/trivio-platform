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

## Stage 1.1: Development Governance, CI Verification & Repository Hardening (Current)

**Goal:** Verify GitHub Actions execution, enforce mandatory PR quality gates, establish permanent agent rules, and harden the repository.

- [x] Permanent coding agent instructions (`AGENTS.md`)
- [x] 13-section mandatory Pull Request template (`.github/pull_request_template.md`)
- [x] Automated PR description quality validation tool (`scripts/validate-pr-description.mjs`)
- [x] PR description validator GitHub Actions workflow (`.github/workflows/pr-description.yml`)
- [x] Comprehensive test suite for PR validator (10 automated tests)
- [x] 14-step fork-and-upstream development workflow documentation
- [x] Public repository visibility advisory and single-maintainer branch protection rules
- [x] Verification of upstream GitHub Actions CI execution (Run #1 verified success)

---

## Stage 2: Pure Financial Settlement Engine (`@trivio.ink/core`)

**Goal:** Implement full-scale deterministic payment settlement calculation capabilities.

- [ ] Multi-tiered Merchant Discount Rate (MDR) calculation engine
- [ ] Card scheme fee models (Interchange ++ and blended pricing structures)
- [ ] Regional tax and withholding levies (e.g., VAT, NBT, WHT)
- [ ] Multi-currency minor-unit conversion helpers with zero float drift
- [ ] Settlement calendar adjustments (bank holidays, weekend shifts, T+1/T+2/T+3 cycle projections)
- [ ] Comprehensive scenario test suites with bank reconciliation edge cases

---

## Stage 3: Multi-Platform Developer SDKs (`@trivio.ink/node`, `@trivio.ink/react`)

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
