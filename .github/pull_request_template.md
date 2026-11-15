<!--
  TRIVIO PULL REQUEST TEMPLATE
  All 13 sections below are mandatory for every Pull Request.
  If a particular section is not applicable to your change, explicitly state "Not applicable" along with a brief explanation of why.
  Unfilled placeholders or empty sections will cause the automated PR description validation gate to fail.
-->

## 1. Executive Summary

<!-- Provide a high-level summary of what this PR does and why it was created. -->

## 2. Business Purpose

<!-- Describe the merchant, developer, or operational problem this pull request addresses. -->

## 3. Scope and Requirements

### Included in this PR
- [x] Feature / change 1

### Excluded / Out of Scope
- Out of scope item 1 (deferred to future milestone)

## 4. Technical Implementation

<!-- Detail module-by-module modifications and new components created. -->
- `packages/...` or `apps/...`:

## 5. Architecture and Design Decisions

<!-- Explain significant design choices, patterns adopted, and architectural trade-offs evaluated. -->

## 6. API, Database and Configuration Changes

### Public API / SDK Contracts
- [ ] Breaking changes
- [ ] Non-breaking additions
- [ ] No API changes

### Database & Persistence
- Schema changes / Prisma migrations (or "Not applicable: pure SDK changes"):

### Configuration & Environment
- Environment variables or build configuration updates:

## 7. Security and Financial Integrity

### Financial Precision & Rounding
- Rounding behavior and zero-float verification:

### PCI Boundaries & Sensitive Data
- Confirmation that no raw cardholder data (PAN, CVV, PIN) or banking credentials are processed or stored:

### Secrets & Access Controls
- Confirmation that no credentials or secrets are committed:

## 8. Testing and Verification

### Commands Executed
```bash
npm run check
npm test
npm run typecheck
npm run build
```

### Test Results
- Total tests executed:
- Tests passed:
- Known test limitations (if any):

## 9. Screenshots or Usage Examples

<!-- Provide TypeScript/JavaScript code snippets showing usage, or UI screenshots for frontend packages. -->

```typescript
// Example usage
```

## 10. Risks and Limitations

<!-- Identify potential edge cases, performance considerations, or unresolved technical debt. -->

## 11. Acceptance Criteria

- [ ] All package builds compile cleanly (`npm run build`)
- [ ] Strict TypeScript checks pass with zero errors (`npm run typecheck`)
- [ ] Automated tests pass (`npm test`)
- [ ] Single root `package-lock.json` is consistent
- [ ] Documentation and architectural records updated
- [ ] PR description satisfies all required governance sections

## 12. Deployment and Rollback

### Deployment Considerations
- Packaging or deployment impacts:

### Rollback Strategy
- Steps required to revert changes safely if issues arise post-merge:

## 13. Next Steps

<!-- Describe immediate follow-up tasks or the subsequent platform milestone. -->
