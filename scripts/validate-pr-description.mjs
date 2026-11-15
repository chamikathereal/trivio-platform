#!/usr/bin/env node

/**
 * @file scripts/validate-pr-description.mjs
 * @description Validates that a Pull Request description satisfies Trivio development governance standards.
 * Zero external runtime dependencies - uses Node.js standard library.
 */

import fs from 'node:fs';

/**
 * The 13 required sections in order.
 */
export const REQUIRED_SECTIONS = [
  {
    id: 1,
    title: 'Executive Summary',
    pattern: /##+\s*(?:1[.)]\s*)?Executive Summary/i,
  },
  {
    id: 2,
    title: 'Business Purpose',
    pattern: /##+\s*(?:2[.)]\s*)?Business Purpose/i,
  },
  {
    id: 3,
    title: 'Scope and Requirements',
    pattern: /##+\s*(?:3[.)]\s*)?Scope (?:and|&) Requirements/i,
  },
  {
    id: 4,
    title: 'Technical Implementation',
    pattern: /##+\s*(?:4[.)]\s*)?Technical Implementation/i,
  },
  {
    id: 5,
    title: 'Architecture and Design Decisions',
    pattern: /##+\s*(?:5[.)]\s*)?Architecture (?:and|&) Design Decisions/i,
  },
  {
    id: 6,
    title: 'API, Database and Configuration Changes',
    pattern: /##+\s*(?:6[.)]\s*)?API,?\s*(?:Database\s*(?:and|&)\s*)?Configuration Changes/i,
  },
  {
    id: 7,
    title: 'Security and Financial Integrity',
    pattern: /##+\s*(?:7[.)]\s*)?Security (?:and|&) Financial Integrity/i,
  },
  {
    id: 8,
    title: 'Testing and Verification',
    pattern: /##+\s*(?:8[.)]\s*)?Testing (?:and|&) Verification/i,
  },
  {
    id: 9,
    title: 'Screenshots or Usage Examples',
    pattern: /##+\s*(?:9[.)]\s*)?Screenshots (?:or|and) Usage Examples/i,
  },
  {
    id: 10,
    title: 'Risks and Limitations',
    pattern: /##+\s*(?:10[.)]\s*)?Risks (?:and|&) Limitations/i,
  },
  {
    id: 11,
    title: 'Acceptance Criteria',
    pattern: /##+\s*(?:11[.)]\s*)?Acceptance Criteria/i,
  },
  {
    id: 12,
    title: 'Deployment and Rollback',
    pattern: /##+\s*(?:12[.)]\s*)?Deployment (?:and|&) Rollback/i,
  },
  {
    id: 13,
    title: 'Next Steps',
    pattern: /##+\s*(?:13[.)]\s*)?Next Steps/i,
  },
];

/**
 * Strips HTML comments from markdown text.
 */
export function stripHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '').trim();
}

/**
 * Checks whether content is meaningful (not empty, not just punctuation/comments).
 */
export function isMeaningfulContent(content) {
  const stripped = stripHtmlComments(content);
  // Remove markdown headers, checkboxes, and whitespace
  const clean = stripped
    .replace(/^#+\s+.*$/gm, '')
    .replace(/[-*]\s*\[[ xX]\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return clean.length >= 10;
}

/**
 * Validates a PR description markdown string.
 *
 * @param {string | null | undefined} body - Raw PR description markdown text.
 * @returns {{ valid: boolean; errors: string[]; warnings: string[] }}
 */
export function validatePrDescription(body) {
  const errors = [];
  const warnings = [];

  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return {
      valid: false,
      errors: ['Pull request description is completely empty or missing.'],
      warnings: [],
    };
  }

  // Normalize CRLF and CR to standard LF line terminators
  // Web form submissions and Windows environments submit descriptions with CRLF
  const normalizedBody = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const rawClean = stripHtmlComments(normalizedBody);
  if (rawClean.length < 50) {
    return {
      valid: false,
      errors: [
        'Pull request description contains insufficient content (only comments or fewer than 50 characters).',
      ],
      warnings: [],
    };
  }

  // Parse markdown headings and section boundaries using heading hierarchy
  const lines = normalizedBody.split('\n');
  const headings = lines
    .map((line, lineIndex) => {
      // Support markdown headings level 1 to 6 with optional leading indentation (up to 3 spaces per CommonMark)
      const headerMatch = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
      if (!headerMatch) {
        return null;
      }

      return {
        lineIndex,
        level: headerMatch[1].length,
        // Trim trailing closing hashes (e.g., '## Title ##') and whitespace
        title: headerMatch[2].replace(/\s+#+\s*$/, '').trim(),
      };
    })
    .filter(Boolean);

  // Verify each required section
  for (const req of REQUIRED_SECTIONS) {
    const matchedSection = headings.find((h) => req.pattern.test(`## ${h.title}`));

    if (!matchedSection) {
      errors.push(`Missing required section: "${req.title}" (Section ${req.id})`);
      continue;
    }

    const nextSiblingOrParentHeading = headings.find(
      (h) => h.lineIndex > matchedSection.lineIndex && h.level <= matchedSection.level
    );

    const contentStart = matchedSection.lineIndex + 1;
    const contentEnd = nextSiblingOrParentHeading ? nextSiblingOrParentHeading.lineIndex : lines.length;
    const content = lines.slice(contentStart, contentEnd).join('\n');

    if (!isMeaningfulContent(content)) {
      errors.push(
        `Section "${req.title}" (Section ${req.id}) contains no meaningful content or only unfilled placeholder comments.`
      );
    } else {
      // Check for unchanged template instructions
      if (
        content.includes('Provide a high-level summary') ||
        content.includes('Describe the merchant, developer, or operational problem') ||
        content.includes('Detail module-by-module modifications')
      ) {
        errors.push(
          `Section "${req.title}" (Section ${req.id}) contains unresolved template placeholder text.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Main execution logic for CLI & GitHub Actions runner.
 */
export function run() {
  let prBody = null;

  // 1. Check CLI arguments
  const args = process.argv.slice(2);
  const fileArgIndex = args.indexOf('--file');
  const bodyArgIndex = args.indexOf('--body');

  if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
    try {
      prBody = fs.readFileSync(args[fileArgIndex + 1], 'utf8');
    } catch (err) {
      console.error(`Failed to read file ${args[fileArgIndex + 1]}:`, err.message);
      process.exit(1);
    }
  } else if (bodyArgIndex !== -1 && args[bodyArgIndex + 1]) {
    prBody = args[bodyArgIndex + 1];
  } else if (process.env.GITHUB_EVENT_PATH) {
    // 2. Read from GitHub Actions event payload
    try {
      const eventJson = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
      prBody = eventJson.pull_request ? eventJson.pull_request.body : null;
    } catch (err) {
      console.error('Failed to parse GITHUB_EVENT_PATH:', err.message);
      process.exit(1);
    }
  }

  if (prBody === null) {
    console.error('Error: No pull request body provided.');
    console.error('Usage: node scripts/validate-pr-description.mjs [--file <path>] [--body "<text>"]');
    console.error('Or run within GitHub Actions with GITHUB_EVENT_PATH set.');
    process.exit(1);
  }

  console.log('--- Trivio Pull Request Description Validator ---');
  const result = validatePrDescription(prBody);

  if (!result.valid) {
    console.error('\n❌ Pull request description validation FAILED with the following errors:\n');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    console.error('\nPlease update the pull request description to adhere to .github/pull_request_template.md');
    process.exit(1);
  }

  console.log('\n✅ Pull request description satisfies all 13 governance sections.');
  process.exit(0);
}

// Execute if run directly from command line
if (process.argv[1] && process.argv[1].endsWith('validate-pr-description.mjs')) {
  run();
}
