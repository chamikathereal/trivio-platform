# Contributing to Trivio

Thank you for your interest in contributing to Trivio (`trivio.ink`). We welcome contributions that maintain our high standards of mathematical determinism, type safety, and developer-first design.

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and collaborative in all discussions and code reviews.

---

## 2. Development Setup

### Requirements

- **Node.js:** Node.js 22 LTS (`>=20.0.0`)
- **Package Manager:** **npm** exclusively (npm Workspaces). Do not use Yarn, pnpm, Bun, or Turborepo.

### Getting Started

```bash
# Clone the repository
git clone https://github.com/chamikathereal/trivio-platform.git
cd trivio-platform

# Install dependencies and link packages
npm install

# Run the complete verification suite
npm run check
```

---

## 3. Branching & Commits

### Branching Convention

- Feature: `feat/short-description`
- Bugfix: `fix/short-description`
- Maintenance/Chore: `chore/short-description`
- Documentation: `docs/short-description`

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add tiered fee calculator primitive`
- `fix: correct half-up rounding boundary on remainder edge`
- `docs: update ADR-0001 with settlement event lifecycle`
- `chore: update vitest dependency to latest LTS`

---

## 4. Architectural Rules

1. **Deterministic Minor Units:** Never use floating-point math (`0.1 + 0.2`) for financial calculations. Always use integer minor currency units and `BigInt` precision.
2. **Zero-Dependency Core:** `@trivio.ink/core` must not depend on databases, network clients, environment variables, or external runtime dependencies.
3. **No Hardcoded Bank Rates:** Never hardcode regional acquirer fees, merchant discount agreements, or banking credentials into generic libraries.
4. **Developer-Owned Data:** Keep calculation logic decoupled from hosted cloud persistence. Developers own their transaction data.
5. **Private Packages in Stage 1:** Do not publish packages to public npm during foundation stages.

---

## 5. Verification Checklist

Before submitting a Pull Request, ensure:

```bash
# 1. TypeScript builds compile cleanly
npm run build

# 2. Type checking passes with zero errors
npm run typecheck

# 3. All unit tests pass
npm test

# 4. Master validation command passes
npm run check

# 5. Clean installation verification
npm ci
```
