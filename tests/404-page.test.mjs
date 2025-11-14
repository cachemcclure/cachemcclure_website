/**
 * Test suite for 404 Error Page
 * Tests navigation links, accessibility, and content
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    testsFailed++;
  }
}

function testSection(name) {
  console.log(`\n${colors.blue}${name}${colors.reset}`);
}

// Read the built 404.html file
const distPath = join(dirname(__dirname), 'dist', '404.html');
let html;

try {
  html = readFileSync(distPath, 'utf-8');
} catch (error) {
  console.error(`${colors.red}✗${colors.reset} Could not read 404.html. Make sure to run 'npm run build' first.`);
  process.exit(1);
}

console.log(`${colors.blue}Testing 404 Error Page${colors.reset}`);
console.log('='.repeat(50));

// Test 1: Basic Structure
testSection('Basic Structure');
assert(html.includes('<!DOCTYPE html>'), 'Has DOCTYPE declaration');
assert(html.includes('<html'), 'Has HTML element');
assert(html.includes('<head>'), 'Has head element');
assert(html.includes('<body'), 'Has body element');

// Test 2: Meta Tags
testSection('Meta Tags and SEO');
assert(html.includes('<title>404 Not Found'), 'Has correct title');
assert(html.includes('charset="UTF-8"'), 'Has UTF-8 charset');
assert(html.includes('viewport'), 'Has viewport meta tag');
assert(html.includes('og:title'), 'Has Open Graph title');
assert(html.includes('twitter:card'), 'Has Twitter Card meta tag');

// Test 3: Navigation Links
testSection('Navigation Links');
assert(html.includes('href="/"'), 'Has link to home page');
assert(html.includes('href="/books"'), 'Has link to books page');
assert(html.includes('href="/news"'), 'Has link to news page');
assert(html.includes('href="/about"'), 'Has link to about page');

// Test 4: Content
testSection('Content and Messaging');
assert(html.includes('404'), 'Displays 404 error code');
assert(
  html.includes('Navigation Error') || html.includes('Coordinates Not Found'),
  'Has sci-fi themed error message'
);
assert(
  html.includes('Chart a New Course') || html.includes('navigation'),
  'Has helpful navigation prompt'
);

// Test 5: Accessibility
testSection('Accessibility');
assert(html.includes('id="main-content"'), 'Has main content landmark');
assert(html.includes('<main'), 'Uses semantic main element');
assert(html.includes('aria-hidden="true"'), 'Uses aria-hidden for decorative elements');

// SVG icons should have aria-hidden
const svgMatches = html.match(/<svg[^>]*>/g) || [];
const hasAriaHiddenSvgs = svgMatches.some(svg => svg.includes('aria-hidden="true"'));
assert(hasAriaHiddenSvgs, 'SVG icons have aria-hidden attribute');

// Test 6: Layout Components
testSection('Layout Components');
assert(html.includes('Header') || html.includes('<header'), 'Includes header');
assert(html.includes('Footer') || html.includes('<footer'), 'Includes footer');

// Test 7: Styling
testSection('Styling and Design');
assert(html.includes('text-accent'), 'Uses theme accent color');
assert(html.includes('border-border'), 'Uses theme border color');
assert(html.includes('hover:'), 'Has hover states for interactivity');
assert(html.includes('focus-outline'), 'Has focus states for accessibility');
assert(html.includes('sm:') || html.includes('md:') || html.includes('lg:'), 'Has responsive design classes');

// Test 8: Navigation Card Structure
testSection('Navigation Cards');
const homeCardPattern = /<a[^>]*href="\/"[^>]*>[\s\S]*?Home[\s\S]*?<\/a>/i;
const booksCardPattern = /<a[^>]*href="\/books"[^>]*>[\s\S]*?Books[\s\S]*?<\/a>/i;
const newsCardPattern = /<a[^>]*href="\/news"[^>]*>[\s\S]*?News[\s\S]*?<\/a>/i;
const aboutCardPattern = /<a[^>]*href="\/about"[^>]*>[\s\S]*?About[\s\S]*?<\/a>/i;

assert(homeCardPattern.test(html), 'Has Home navigation card');
assert(booksCardPattern.test(html), 'Has Books navigation card');
assert(newsCardPattern.test(html), 'Has News navigation card');
assert(aboutCardPattern.test(html), 'Has About navigation card');

// Test 9: Icons
testSection('Icons');
const svgCount = (html.match(/<svg/g) || []).length;
assert(svgCount >= 4, `Has SVG icons for navigation (found ${svgCount})`);

// Test 10: No JavaScript Required
testSection('Progressive Enhancement');
assert(!html.includes('onclick='), 'No inline JavaScript (progressive enhancement)');
assert(!html.includes('javascript:'), 'No javascript: links');

// Summary
console.log('\n' + '='.repeat(50));
console.log(`${colors.blue}Test Summary${colors.reset}`);
console.log(`${colors.green}Passed:${colors.reset} ${testsPassed}`);
console.log(`${colors.red}Failed:${colors.reset} ${testsFailed}`);

if (testsFailed > 0) {
  console.log(`\n${colors.red}Some tests failed!${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}All tests passed!${colors.reset}`);
  process.exit(0);
}
