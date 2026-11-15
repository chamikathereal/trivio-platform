import { describe, it, expect } from 'vitest';
import {
  validatePrDescription,
  stripHtmlComments,
  isMeaningfulContent,
  REQUIRED_SECTIONS,
} from '../scripts/validate-pr-description.mjs';

const VALID_SAMPLE_PR = `
## 1. Executive Summary
This PR implements stage 1.1 development governance, establishing permanent agent guidelines and PR description checks.

## 2. Business Purpose
Ensures that all future code contributions satisfy strict payment settlement intelligence standards and documentation policies.

## 3. Scope and Requirements
### Included in this PR
- [x] AGENTS.md instructions
- [x] Automated PR validator
- [x] 13-section PR template

### Excluded / Out of Scope
- Stage 2 financial settlement calculations

## 4. Technical Implementation
- \`scripts/validate-pr-description.mjs\`: Lightweight Node.js PR description validation script
- \`.github/workflows/pr-description.yml\`: GitHub Actions workflow
- \`AGENTS.md\`: Coding agent rules

## 5. Architecture and Design Decisions
Chose a zero-dependency Node.js validator over third-party actions to maintain minimal attack surface and fast execution in CI.

## 6. API, Database and Configuration Changes
### Public API / SDK Contracts
- [x] No API changes

### Database & Persistence
Not applicable: Pure development governance and CI tooling updates.

### Configuration & Environment
Added GitHub Actions workflow for PR description validation.

## 7. Security and Financial Integrity
### Financial Precision & Rounding
Not applicable: Governance changes, no financial arithmetic altered.

### PCI Boundaries & Sensitive Data
Confirmed no cardholder data or credentials are processed.

### Secrets & Access Controls
Verified least-privilege GitHub Actions permissions (contents: read, pull-requests: read).

## 8. Testing and Verification
### Commands Executed
\`\`\`bash
npm run check
npm test
\`\`\`
### Test Results
- Total tests executed: 40
- Tests passed: 40
- Known limitations: None

## 9. Screenshots or Usage Examples
\`\`\`bash
node scripts/validate-pr-description.mjs --file pr_body.md
\`\`\`

## 10. Risks and Limitations
Workflow runs only on pull_request events; forks must permit read-only actions to execute.

## 11. Acceptance Criteria
- [x] AGENTS.md established
- [x] PR template updated with 13 sections
- [x] Validator tested and passing

## 12. Deployment and Rollback
### Deployment Considerations
No production deployment impact; changes affect CI workflow only.

### Rollback Strategy
Revert commit if validation script disrupts development cadence.

## 13. Next Steps
Proceed to Stage 2: Dynamic Merchant Fee and Settlement Calculation Engine.
`;

describe('PR Description Validator (Stage 1.1)', () => {
  it('identifies all 13 required governance sections', () => {
    expect(REQUIRED_SECTIONS).toHaveLength(13);
  });

  it('passes a fully documented and valid PR description', () => {
    const result = validatePrDescription(VALID_SAMPLE_PR);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts required sections when top-level headings use level-3 markdown', () => {
    const level3SectionHeadingsPR = VALID_SAMPLE_PR.replace(/^### /gm, '#### ').replace(/^## /gm, '### ');

    const result = validatePrDescription(level3SectionHeadingsPR);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects an empty PR body', () => {
    const result = validatePrDescription('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/empty or missing/i);
  });

  it('rejects null or undefined input', () => {
    // @ts-expect-error testing null input
    const resultNull = validatePrDescription(null);
    expect(resultNull.valid).toBe(false);

    // @ts-expect-error testing undefined input
    const resultUndefined = validatePrDescription(undefined);
    expect(resultUndefined.valid).toBe(false);
  });

  it('rejects a PR body with missing required sections', () => {
    // Remove Executive Summary and Next Steps
    const prunedPR = VALID_SAMPLE_PR
      .replace(/## 1\. Executive Summary[\s\S]*?(?=## 2\.)/, '')
      .replace(/## 13\. Next Steps[\s\S]*$/, '');

    const result = validatePrDescription(prunedPR);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Executive Summary'))).toBe(true);
    expect(result.errors.some((e) => e.includes('Next Steps'))).toBe(true);
  });

  it('rejects a PR body where a section is empty', () => {
    const emptySectionPR = VALID_SAMPLE_PR.replace(
      /## 2\. Business Purpose[\s\S]*?(?=## 3\.)/,
      '## 2. Business Purpose\n\n'
    );

    const result = validatePrDescription(emptySectionPR);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Business Purpose') && e.includes('no meaningful content'))).toBe(true);
  });

  it('rejects unmodified template placeholders with only HTML comments', () => {
    const templatePR = `
## 1. Executive Summary
<!-- Provide a high-level summary of what this PR does and why it was created. -->

## 2. Business Purpose
<!-- Describe the merchant, developer, or operational problem this pull request addresses. -->

## 3. Scope and Requirements
<!-- Detail scope -->

## 4. Technical Implementation
<!-- Detail module-by-module modifications and new components created. -->

## 5. Architecture and Design Decisions
<!-- Design decisions -->

## 6. API, Database and Configuration Changes
<!-- Changes -->

## 7. Security and Financial Integrity
<!-- Security -->

## 8. Testing and Verification
<!-- Testing -->

## 9. Screenshots or Usage Examples
<!-- Examples -->

## 10. Risks and Limitations
<!-- Risks -->

## 11. Acceptance Criteria
<!-- Checklist -->

## 12. Deployment and Rollback
<!-- Deployment -->

## 13. Next Steps
<!-- Next steps -->
`;

    const result = validatePrDescription(templatePR);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('accepts properly explained non-applicable sections', () => {
    const prWithNA = VALID_SAMPLE_PR.replace(
      /## 5\. Architecture and Design Decisions[\s\S]*?(?=## 6\.)/,
      '## 5. Architecture and Design Decisions\nNot applicable: Minor documentation fix with no architectural impact.\n\n'
    );

    const result = validatePrDescription(prWithNA);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  describe('Helper utilities', () => {
    it('correctly strips HTML comments from text', () => {
      const input = 'Header <!-- comment here --> and content <!-- another comment -->';
      expect(stripHtmlComments(input)).toBe('Header  and content');
    });

    it('identifies meaningful vs meaningless content', () => {
      expect(isMeaningfulContent('   ')).toBe(false);
      expect(isMeaningfulContent('<!-- only comments -->')).toBe(false);
      expect(isMeaningfulContent('A'.repeat(5))).toBe(false);
      expect(isMeaningfulContent('This is a thorough explanation of changes.')).toBe(true);
    });
  });
});
