# Trivio Engineering Instructions for AI Coding Agents & Contributors

> **Target Audience:** AI coding assistants (Gemini, Claude, GPT, Antigravity, Copilot), automated workflow runners, and human contributors developing on the Trivio platform (`trivio.ink`).

---

## 1. Core Mission & Philosophy

Trivio is a developer-first payment settlement intelligence platform. We provide deterministic, type-safe calculation primitives and integration libraries that model merchant discount rates (MDR), acquirer fees, scheme assessments, and settlement calendar adjustments.

### Cardinal Rule: Developer-Owned Payment Data
- Developers own and store their transactional ledgers inside their own databases.
- Trivio core calculation libraries execute locally inside developer infrastructure without mandatory cloud telemetry.
- Calculations must work offline with zero external network dependencies.

---

## 2. Mandatory Engineering Policies

### A. Technology Policy

1. **Package Manager:** **npm** is the exclusive package manager. Never introduce Yarn, pnpm, Bun, Turborepo, or Nx.
2. **Workspaces:** Use npm Workspaces for monorepo coordination. A single root `package-lock.json` must govern all workspace dependencies.
3. **TypeScript Strict Mode:** Mandatory across all packages. Every `tsconfig.json` must inherit from `tsconfig.base.json` with strict type checking, no implicit any, and strict null checks.
4. **Zero-Float Financial Math:** Never use IEEE-754 floating-point numbers (`0.1 + 0.2`) for financial calculations. Always use integer minor currency units (e.g. `1000000` for 10,000.00) and `BigInt` intermediate precision.
5. **Decoupled Architecture:**
   - Framework-independent SDKs (`@trivio.ink/core`, `@trivio.ink/node`, `@trivio.ink/react`) must remain strictly isolated from NestJS and Next.js.
   - Core libraries must never depend on databases, ORMs (Prisma), or hosted cloud services.
6. **No Hardcoded Bank Charges:** Never embed hardcoded regional acquirer rates, scheme levies, or bank policies as permanent constants in core packages. All rate models must be caller-configurable.
7. **Contract Stability:** Preserve existing public interfaces, TypeScript types, and export declarations.
8. **Dependency Discipline:** Minimize external runtime dependencies. Zero runtime dependencies are permitted in `@trivio.ink/core`.

### B. Development Policy

1. **Inspect Before Modifying:** Always inspect existing code, directory structures, git status, and dependencies before proposing or applying changes.
2. **Feature Branching:** Never commit directly to `main`. All development must occur on feature branches (`feat/*`, `fix/*`, `chore/*`) branched from the latest synchronized `upstream/main`.
3. **Surgical, Maintainable Edits:** Make minimal, focused, and well-structured modifications. Do not rewrite working modules or introduce cosmetic refactorings without reason.
4. **Mandatory Test Coverage:** Every new function, calculation primitive, or error path must include comprehensive automated tests using Vitest.
5. **Evidence-Based Verification:** Never claim a test passed, a build succeeded, or a typecheck succeeded without executing the tool and capturing the output.
6. **No Fictional Data or Integrations:** Never replace real integration data with simulated production values or fabricate live banking API responses.

### C. Financial Integrity Policy

1. **Monetary Precision:** Calculations must preserve exact minor currency units without loss of fractional pennies.
2. **Explicit Rounding Policies:** Every arithmetic function must document and implement its rounding policy (e.g., Round-Half-Up, Round-Half-Even / Banker's Rounding).
3. **Estimates vs. Confirmed Settlements:** Clearly distinguish estimated fee deductions (computed locally at authorization time) from confirmed bank settlements (reconciled against acquirer credit batches).
4. **Configurable Settlement Cycles:** Never assume universal `T+1` or `T+2` settlement cycles. Bank holidays, cut-off windows, and weekend shifts vary across acquirers and jurisdictions.
5. **Idempotency & Duplicate Prevention:** Design calculation pipelines to prevent duplicate deduction calculations on identical transaction identifiers.
6. **PCI & Security Boundaries:** Trivio generic SDKs must never process, store, log, or accept primary account numbers (PAN), CVVs, cardholder PINs, or banking credentials.
7. **Immutable Historical Ledgers:** Historical settlement calculations must remain deterministic and reproducible over time.

### D. Git & Collaboration Policy

1. **Canonical Source of Truth:** `trivio-ink/trivio-platform:main` represents reviewed, production-grade integration code.
2. **Fork-and-Upstream Workflow:**
   - Develop within the personal fork (`origin`).
   - Keep local `main` synchronized with `upstream/main`.
   - Submit changes via Pull Requests targeting `upstream/main`.
3. **No Force-Pushes:** Never force-push or rewrite commit history on `upstream/main`.
4. **Zero Secrets in Git:** Never commit `.env` files, API keys, private keys, or credentials.
5. **No Self-Merging:** AI agents must never automatically merge pull requests. Pull requests must remain open for human review and CI verification.

### E. Pull Request Documentation Policy

Every Pull Request must include a comprehensive Markdown description conforming to `.github/pull_request_template.md`.

**Unacceptable PR Practices:**
- Submitting with "No description provided"
- Leaving boilerplate comments or unfilled section placeholders
- Making generic AI claims without verifiable test output and command logs
- Omitting architectural rationale, testing evidence, or security reviews

Pull request descriptions are subject to automated validation via `.github/workflows/pr-description.yml` and will fail CI if required documentation standards are not satisfied.
