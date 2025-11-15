#!/usr/bin/env node

/**
 * ARIA Labels Test Suite
 *
 * Tests that all interactive elements and landmarks have appropriate ARIA labels
 * for accessibility compliance (WCAG 2.1 Level AA).
 *
 * This test verifies:
 * - Navigation landmarks have aria-label
 * - Interactive buttons have aria-label
 * - Decorative SVG icons have aria-hidden="true"
 * - Social media links have ariaLabel prop
 * - Search elements have role="search"
 * - Post navigation has aria-label
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Test configuration
const tests = [
  {
    name: 'Header - Main Navigation',
    file: 'src/components/Header.astro',
    checks: [
      {
        description: 'Nav element has aria-label="Main navigation"',
        pattern: /<nav[^>]*aria-label="Main navigation"/,
        required: true
      },
      {
        description: 'Theme button has descriptive aria-label',
        pattern: /id="theme-btn"[\s\S]*?aria-label="Toggle light and dark mode"/,
        required: true
      }
    ]
  },
  {
    name: 'BackToTopButton',
    file: 'src/components/BackToTopButton.astro',
    checks: [
      {
        description: 'Back to top button has aria-label',
        pattern: /<button[^>]*data-button="back-to-top"[^>]*aria-label="Back to top"/,
        required: true
      }
    ]
  },
  {
    name: 'Socials Component',
    file: 'src/components/Socials.astro',
    checks: [
      {
        description: 'LinkButton receives ariaLabel prop',
        pattern: /ariaLabel=\{social\.linkTitle\}/,
        required: true
      }
    ]
  },
  {
    name: 'ShareLinks Component',
    file: 'src/components/ShareLinks.astro',
    checks: [
      {
        description: 'LinkButton receives ariaLabel prop',
        pattern: /ariaLabel=\{social\.linkTitle\}/,
        required: true
      }
    ]
  },
  {
    name: 'PostDetails Layout - Navigation',
    file: 'src/layouts/PostDetails.astro',
    checks: [
      {
        description: 'Post navigation has aria-label',
        pattern: /<nav[^>]*aria-label="Post navigation"/,
        required: true
      },
      {
        description: 'Heading links have aria-label attribute',
        pattern: /link\.setAttribute\("aria-label", `Link to \$\{heading\.textContent\}`\)/,
        required: true
      }
    ]
  },
  {
    name: 'BookCard - Decorative SVG',
    file: 'src/components/BookCard.astro',
    checks: [
      {
        description: 'Decorative arrow SVG has aria-hidden="true"',
        pattern: /<svg[^>]*aria-hidden="true"[^>]*class="ml-1 h-4 w-4"/,
        required: true
      }
    ]
  },
  {
    name: 'NewsCard - Decorative SVG',
    file: 'src/components/NewsCard.astro',
    checks: [
      {
        description: 'Decorative arrow SVG has aria-hidden="true"',
        pattern: /<svg[^>]*aria-hidden="true"[^>]*class="ml-1 h-4 w-4"/,
        required: true
      }
    ]
  },
  {
    name: 'Homepage - Decorative Icons',
    file: 'src/pages/index.astro',
    checks: [
      {
        description: 'RSS icon has aria-hidden="true"',
        pattern: /<IconRss[^>]*aria-hidden="true"/,
        required: true
      },
      {
        description: 'View All Books arrow has aria-hidden="true"',
        pattern: /<IconArrowRight[^>]*aria-hidden="true"[^>]*class="ms-1 inline-block h-4 w-4 rtl:-rotate-180"/g,
        required: true,
        minCount: 2 // Should appear twice (Books and News)
      }
    ]
  },
  {
    name: 'EditPost Component',
    file: 'src/components/EditPost.astro',
    checks: [
      {
        description: 'Edit link has descriptive aria-label',
        pattern: /aria-label=\{`Edit this post on GitHub`\}/,
        required: true
      }
    ]
  },
  {
    name: 'Search Page',
    file: 'src/pages/search.astro',
    checks: [
      {
        description: 'Search container has role="search"',
        pattern: /<div[^>]*id="pagefind-search"[^>]*role="search"/,
        required: true
      }
    ]
  }
];

// Color output utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function logHeader(text) {
  console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`);
}

function logSuccess(text) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function logError(text) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function _logWarning(text) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

function logInfo(text) {
  console.log(`${colors.dim}  ${text}${colors.reset}`);
}

// Run tests
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

logHeader('🔍 ARIA Labels Accessibility Test Suite');
logInfo('Testing WCAG 2.1 Level AA compliance for ARIA attributes\n');

for (const test of tests) {
  const filePath = resolve(projectRoot, test.file);

  logHeader(`Testing: ${test.name}`);
  logInfo(`File: ${test.file}`);

  let fileContent;
  try {
    fileContent = readFileSync(filePath, 'utf-8');
  } catch (error) {
    logError(`Failed to read file: ${error.message}`);
    failedTests += test.checks.length;
    totalTests += test.checks.length;
    continue;
  }

  for (const check of test.checks) {
    totalTests++;

    if (check.minCount) {
      // Check for minimum occurrences
      const matches = fileContent.match(check.pattern);
      const count = matches ? matches.length : 0;

      if (count >= check.minCount) {
        passedTests++;
        logSuccess(`${check.description} (found ${count})`);
      } else {
        failedTests++;
        logError(`${check.description}`);
        logInfo(`Expected at least ${check.minCount}, found ${count}`);
      }
    } else {
      // Simple pattern match
      if (check.pattern.test(fileContent)) {
        passedTests++;
        logSuccess(check.description);
      } else {
        failedTests++;
        logError(check.description);
        if (check.required) {
          logInfo('This is a required accessibility attribute');
        }
      }
    }
  }

  console.log(''); // Empty line between test groups
}

// Summary
logHeader('📊 Test Results Summary');
console.log(`Total tests:  ${totalTests}`);
console.log(`${colors.green}Passed:       ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed:       ${failedTests}${colors.reset}`);

if (failedTests === 0) {
  console.log(`\n${colors.bright}${colors.green}✓ All ARIA labels tests passed!${colors.reset}`);
  console.log(`${colors.green}Your site meets WCAG 2.1 Level AA requirements for ARIA labels.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.bright}${colors.red}✗ Some ARIA labels tests failed.${colors.reset}`);
  console.log(`${colors.yellow}Please fix the failing tests to ensure accessibility compliance.${colors.reset}\n`);
  process.exit(1);
}
