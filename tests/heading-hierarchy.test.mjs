#!/usr/bin/env node

/**
 * Heading Hierarchy Test
 *
 * Tests that all pages follow WCAG 2.1 heading hierarchy best practices:
 * - Each page has exactly one h1 element
 * - Headings do not skip levels when opening sections (h1 → h2 → h3, not h1 → h3)
 * - Headings are properly nested
 * - Headings are descriptive (not empty)
 *
 * WCAG 2.1 Success Criteria:
 * - 1.3.1 Info and Relationships (Level A)
 * - 2.4.6 Headings and Labels (Level AA)
 */

import { JSDOM } from 'jsdom';
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;
let warnings = 0;

/**
 * Extract heading hierarchy from HTML
 */
function extractHeadingHierarchy(html, filePath) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find all heading elements (h1-h6)
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));

  return headings.map(heading => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent.trim();
    const isEmpty = text.length === 0;

    return {
      tag: heading.tagName.toLowerCase(),
      level,
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''), // Truncate long text
      isEmpty,
      html: heading.outerHTML.substring(0, 100) + (heading.outerHTML.length > 100 ? '...' : ''),
    };
  });
}

/**
 * Check if page has exactly one h1
 */
function checkSingleH1(headings, filePath) {
  const h1Count = headings.filter(h => h.level === 1).length;

  if (h1Count === 0) {
    console.log(`${colors.red}✗ FAIL${colors.reset}: ${filePath}`);
    console.log(`  ${colors.red}No h1 element found${colors.reset}`);
    console.log(`  WCAG 2.4.6: Each page should have exactly one h1 element\n`);
    testsFailed++;
    return false;
  } else if (h1Count > 1) {
    console.log(`${colors.red}✗ FAIL${colors.reset}: ${filePath}`);
    console.log(`  ${colors.red}Multiple h1 elements found (${h1Count})${colors.reset}`);
    headings.filter(h => h.level === 1).forEach((h1, index) => {
      console.log(`    ${index + 1}. "${h1.text}"`);
    });
    console.log(`  WCAG 2.4.6: Each page should have exactly one h1 element\n`);
    testsFailed++;
    return false;
  }

  return true;
}

/**
 * Check if headings skip levels inappropriately
 */
function checkHeadingSkips(headings, filePath) {
  let hasViolations = false;
  let previousLevel = 0;

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const currentLevel = heading.level;

    // Check if we're skipping levels when descending (opening sections)
    // It's OK to skip levels when ascending (closing sections)
    if (currentLevel > previousLevel + 1) {
      if (!hasViolations) {
        console.log(`${colors.red}✗ FAIL${colors.reset}: ${filePath}`);
        hasViolations = true;
      }

      console.log(`  ${colors.red}Heading level skip detected${colors.reset}`);
      console.log(`    From: <h${previousLevel}> to <h${currentLevel}>`);
      console.log(`    Text: "${heading.text}"`);
      console.log(`    WCAG 1.3.1: Do not skip heading levels when opening sections`);
      console.log();
    }

    previousLevel = currentLevel;
  }

  if (hasViolations) {
    testsFailed++;
    return false;
  }

  return true;
}

/**
 * Check for empty or non-descriptive headings
 */
function checkEmptyHeadings(headings, filePath) {
  const emptyHeadings = headings.filter(h => h.isEmpty);

  if (emptyHeadings.length > 0) {
    console.log(`${colors.yellow}⚠ WARNING${colors.reset}: ${filePath}`);
    console.log(`  ${colors.yellow}Empty heading(s) found${colors.reset}`);
    emptyHeadings.forEach(h => {
      console.log(`    <${h.tag}> (no text content)`);
    });
    console.log(`  WCAG 2.4.6: Headings should describe topic or purpose\n`);
    warnings++;
    return false;
  }

  return true;
}

/**
 * Display heading hierarchy for a page (for debugging)
 */
function displayHeadingStructure(headings) {
  console.log(`  ${colors.cyan}Heading Structure:${colors.reset}`);
  headings.forEach(heading => {
    const indent = '  '.repeat(heading.level);
    console.log(`    ${indent}<${heading.tag}> "${heading.text}"`);
  });
}

/**
 * Test a single HTML file
 */
function testFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const headings = extractHeadingHierarchy(html, filePath);

  // Skip files with no headings (like RSS feeds, redirects, etc.)
  if (headings.length === 0) {
    return;
  }

  const hasOneH1 = checkSingleH1(headings, filePath);
  const noSkips = checkHeadingSkips(headings, filePath);
  const noEmpty = checkEmptyHeadings(headings, filePath);

  // If all tests pass, show success
  if (hasOneH1 && noSkips && noEmpty) {
    console.log(`${colors.green}✓ PASS${colors.reset}: ${filePath}`);
    const h1 = headings.find(h => h.level === 1);
    console.log(`  h1: "${h1.text}"`);
    console.log(`  Total headings: ${headings.length}`);
    console.log();
    testsPassed++;
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log(`${colors.bright}${colors.blue}Running Heading Hierarchy Tests${colors.reset}\n`);
  console.log('Testing WCAG 2.1 compliance:\n');
  console.log('  • 1.3.1 Info and Relationships (Level A)');
  console.log('  • 2.4.6 Headings and Labels (Level AA)\n');
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // Find all HTML files in the dist directory
  const htmlFiles = await glob('dist/**/*.html', {
    ignore: ['**/node_modules/**', '**/.astro/**'],
  });

  if (htmlFiles.length === 0) {
    console.log(`${colors.red}✗ ERROR${colors.reset}: No HTML files found in dist/ directory`);
    console.log('Please run "npm run build" first to generate the production build.\n');
    process.exit(1);
  }

  console.log(`Found ${htmlFiles.length} HTML file(s) to test\n`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // Test each file
  htmlFiles.forEach(testFile);

  // Display summary
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  console.log(`${colors.bright}Test Summary:${colors.reset}\n`);

  const total = testsPassed + testsFailed;
  const passRate = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0;

  console.log(`  ${colors.green}Passed:${colors.reset}   ${testsPassed}/${total} (${passRate}%)`);
  console.log(`  ${colors.red}Failed:${colors.reset}   ${testsFailed}/${total}`);
  console.log(`  ${colors.yellow}Warnings:${colors.reset} ${warnings}\n`);

  // Grade assignment
  let grade = 'F';
  if (testsFailed === 0) {
    grade = warnings === 0 ? 'A+' : warnings <= 2 ? 'A' : 'A-';
  } else if (passRate >= 90) {
    grade = 'B';
  } else if (passRate >= 80) {
    grade = 'C';
  } else if (passRate >= 70) {
    grade = 'D';
  }

  console.log(`  ${colors.bright}Grade: ${grade}${colors.reset}\n`);

  // WCAG compliance status
  if (testsFailed === 0 && warnings === 0) {
    console.log(`${colors.green}${colors.bright}✓ WCAG 2.1 Level AA Compliant${colors.reset}`);
    console.log(`  All pages have proper heading hierarchy.\n`);
  } else if (testsFailed === 0) {
    console.log(`${colors.yellow}${colors.bright}⚠ WCAG 2.1 Level AA Compliant (with warnings)${colors.reset}`);
    console.log(`  All pages pass required tests, but ${warnings} warning(s) detected.\n`);
  } else {
    console.log(`${colors.red}${colors.bright}✗ NOT WCAG 2.1 Level AA Compliant${colors.reset}`);
    console.log(`  ${testsFailed} page(s) failed heading hierarchy tests.\n`);
  }

  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // Exit with error code if tests failed
  if (testsFailed > 0) {
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Test execution failed:${colors.reset}`, error);
  process.exit(1);
});
