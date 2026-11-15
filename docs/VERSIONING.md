# Trivio Versioning & Release Policy

> Canonical semantic versioning specification and release governance for `@trivio.ink/*` packages.

---

## 1. Overview & Coordinated Versioning

Trivio publishes three developer SDK packages that form a unified financial settlement intelligence platform:

1. **`@trivio.ink/core`**: Zero-dependency financial calculation engine.
2. **`@trivio.ink/node`**: Server-side client SDK for ERP, billing, and accounting systems.
3. **`@trivio.ink/react`**: Themeable React UI components and offline settlement calculation hooks.

### Initial Release Recommendation
- **Initial Version:** All three packages will share a synchronized initial public release at **`0.1.0`**.
- **Coordinated Milestone Releases:** While the packages operate under independent npm manifests, minor milestone releases (`0.2.0`, `0.3.0`, `1.0.0`) are coordinated across the monorepo to guarantee interface consistency and avoid cross-package dependency drift.
- **Inter-Package Dependency Strategy:** Published packages express dependencies using caret semver ranges:
  - `@trivio.ink/node` depends on `"@trivio.ink/core": "^0.1.0"`
  - `@trivio.ink/react` depends on `"@trivio.ink/core": "^0.1.0"`

---

## 2. Pre-1.0 Versioning Rules (`0.x.y`)

Prior to `1.0.0`, the platform follows standard pre-release SemVer conventions (SemVer 2.0.0 §4):
- **Patch Bumps (`0.1.0` -> `0.1.1`):** Backwards-compatible bug fixes, minor documentation updates, internal calculation optimizations, and new calendar holiday datasets.
- **Minor Bumps (`0.1.0` -> `0.2.0`):** Breaking public API changes, new calculation primitives, schema migrations, or removed props (e.g. removal of `defaultRateBps`).
- **Zero Silent Breakages:** Even during `0.x` development, every breaking change must be explicitly documented in the package CHANGELOG and migration guide.

---

## 3. Post-1.0 Production Versioning Rules (`MAJOR.MINOR.PATCH`)

Once `1.0.0` is published, strict semantic versioning governs all packages:

| Increment | Trigger | Financial & Contract Guarantee |
| :--- | :--- | :--- |
| **PATCH** (`1.0.x`) | Backwards-compatible bug fixes, performance improvements. | Preserves 100% calculation determinism and public type contracts. |
| **MINOR** (`1.x.0`) | New backward-compatible financial primitives, new calculation options, new components. | Existing code compiles and calculates identical results without modification. |
| **MAJOR** (`x.0.0`) | Incompatible public API changes, altered default rounding policies, modified mathematical formulas. | Requires migration guide and deprecation notice. |

---

## 4. Financial Contract Immutability

Because Trivio models commercial agreements and merchant fee deductions:
1. **Mathematical Reproducibility:** A patch release must NEVER alter the mathematical outcome of an existing calculation policy version (e.g. `'trivio-mdr-v1-half-up'`).
2. **Policy Versioning:** If an acquirer or scheme introduces a new calculation convention, it must be introduced as a new caller-selectable calculation policy string rather than silently overriding existing historical calculations.
3. **Historical Snapshots:** Changes to calculation logic must never corrupt or invalidate past `AppliedRuleSnapshot` or `AppliedSettlementPolicySnapshot` structures stored in merchant databases.

---

## 5. Emergency Rollback & Deprecation Procedure

If an unexpected critical regression or financial defect is discovered in a published npm release:
1. **Never Unpublish Stable Releases:** In accordance with npm registry policies, packages published for more than 72 hours cannot be unpublished.
2. **Immediate Patch Release:** Rapidly release a corrective patch (`0.1.1` or `1.0.1`) containing the fix or reverting the breaking commit.
3. **npm Deprecation Notice:** Execute `npm deprecate` to warn consumers against installing the defective version:
   ```bash
   npm deprecate @trivio.ink/core@0.1.0 "Critical calculation defect in v0.1.0. Upgrade immediately to v0.1.1."
   ```
4. **Git Advisory:** Publish a GitHub Security Advisory (GHSA) detailing the affected versions, financial impact, and migration steps.
