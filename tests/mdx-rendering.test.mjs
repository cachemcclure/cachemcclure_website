#!/usr/bin/env node
/**
 * MDX Rendering Tests
 *
 * Comprehensive tests for MDX content rendering, including:
 * - Typography and text formatting
 * - Code blocks with syntax highlighting
 * - Images
 * - Links (internal and external)
 * - Lists, tables, and other elements
 * - Tailwind Typography plugin integration
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const TEST_TIMEOUT = 5000;

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

let testCount = 0;
let passCount = 0;
let failCount = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition, testName) {
  testCount++;
  if (condition) {
    passCount++;
    log(`  ✓ ${testName}`, 'green');
    return true;
  } else {
    failCount++;
    log(`  ✗ ${testName}`, 'red');
    return false;
  }
}

function fetchPage(url) {
  try {
    const result = execSync(`curl -s "${url}"`, {
      encoding: 'utf-8',
      timeout: TEST_TIMEOUT,
    });
    return result;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error.message);
    return '';
  }
}

function testMDXFeatures() {
  log('\n=== MDX Rendering Tests ===\n', 'bold');

  const testUrl = `${BASE_URL}/news/mdx-feature-test/`;
  log(`Testing MDX features at: ${testUrl}\n`, 'blue');

  const html = fetchPage(testUrl);

  if (!html) {
    log('Failed to fetch test page. Make sure dev server is running.', 'red');
    return false;
  }

  log('1. Typography Tests', 'yellow');
  assert(html.includes('<h1'), 'H1 headings render');
  assert(html.includes('<h2'), 'H2 headings render');
  assert(html.includes('<h3'), 'H3 headings render');
  assert(html.includes('<h4'), 'H4 headings render');
  assert(html.includes('<h5'), 'H5 headings render');
  assert(html.includes('<h6'), 'H6 headings render');
  assert(html.includes('<strong>'), 'Bold text renders');
  assert(html.includes('<em>'), 'Italic text renders');
  assert(html.includes('class="app-prose'), 'Typography prose class applied');

  log('\n2. Code Block Tests', 'yellow');
  assert(html.includes('<code'), 'Inline code renders');
  assert(html.includes('<pre'), 'Code blocks render');
  assert(html.includes('astro-code'), 'Shiki syntax highlighting applied');
  assert(
    html.includes('function') || html.includes('const') || html.includes('def'),
    'Code content present'
  );

  log('\n3. List Tests', 'yellow');
  assert(html.includes('<ul'), 'Unordered lists render');
  assert(html.includes('<ol'), 'Ordered lists render');
  assert(html.includes('<li'), 'List items render');

  log('\n4. Link Tests', 'yellow');
  assert(html.includes('<a href="/books"'), 'Internal links render');
  assert(html.includes('<a href="/about"'), 'Internal about link renders');
  assert(html.includes('href="https://'), 'External links render');

  log('\n5. Table Tests', 'yellow');
  assert(html.includes('<table'), 'Tables render');
  assert(html.includes('<thead'), 'Table headers render');
  assert(html.includes('<tbody'), 'Table bodies render');
  assert(html.includes('<tr'), 'Table rows render');
  assert(html.includes('<td'), 'Table cells render');

  log('\n6. Blockquote Tests', 'yellow');
  assert(html.includes('<blockquote'), 'Blockquotes render');

  log('\n7. Horizontal Rule Tests', 'yellow');
  assert(html.includes('<hr'), 'Horizontal rules render');

  log('\n8. Image Tests', 'yellow');
  assert(html.includes('<img'), 'Images render');
  assert(html.includes('alt='), 'Image alt attributes present');
  assert(html.includes('src='), 'Image src attributes present');

  log('\n9. HTML Elements Tests', 'yellow');
  assert(html.includes('<div'), 'Div elements render');
  assert(html.includes('<p'), 'Paragraph elements render');

  log('\n10. Details/Summary Tests', 'yellow');
  assert(html.includes('<details'), 'Details elements render');
  assert(html.includes('<summary'), 'Summary elements render');

  return true;
}

function testBookMDXRendering() {
  log('\n=== Book MDX Rendering Tests ===\n', 'bold');

  const bookUrl = `${BASE_URL}/books/fracture-engine/`;
  log(`Testing book page at: ${bookUrl}\n`, 'blue');

  const html = fetchPage(bookUrl);

  if (!html) {
    log('Failed to fetch book page.', 'red');
    return false;
  }

  log('Book Page MDX Tests', 'yellow');
  assert(html.includes('app-prose'), 'Book page has prose styling');
  assert(html.includes('<h2'), 'Book page renders headings');
  assert(html.includes('<p'), 'Book page renders paragraphs');
  assert(html.includes('<ul') || html.includes('<ol'), 'Book page renders lists');

  return true;
}

function testBuildArtifacts() {
  log('\n=== Build Artifacts Tests ===\n', 'bold');

  log('Checking built files', 'yellow');

  const newsTestPath = 'dist/news/mdx-feature-test/index.html';
  const bookPath = 'dist/books/fracture-engine/index.html';

  assert(existsSync(newsTestPath), 'MDX test page builds successfully');
  assert(existsSync(bookPath), 'Book page builds successfully');

  if (existsSync(newsTestPath)) {
    const content = readFileSync(newsTestPath, 'utf-8');
    assert(content.length > 1000, 'Built page has substantial content');
    assert(content.includes('prose'), 'Built page includes typography classes');
    assert(content.includes('<h2'), 'Built page includes rendered headings');
  }

  return true;
}

function testTailwindTypographyIntegration() {
  log('\n=== Tailwind Typography Plugin Tests ===\n', 'bold');

  log('Checking typography CSS', 'yellow');

  const typographyPath = 'src/styles/typography.css';
  assert(existsSync(typographyPath), 'Typography CSS file exists');

  if (existsSync(typographyPath)) {
    const content = readFileSync(typographyPath, 'utf-8');
    assert(
      content.includes("@plugin '@tailwindcss/typography'"),
      'Typography plugin configured'
    );
    assert(content.includes('.app-prose'), 'Custom prose class defined');
    assert(content.includes('@apply prose'), 'Prose utility applied');
    assert(content.includes('.astro-code'), 'Syntax highlighting styles defined');
  }

  return true;
}

function printSummary() {
  log('\n' + '='.repeat(50), 'blue');
  log('Test Summary', 'bold');
  log('='.repeat(50), 'blue');
  log(`Total tests: ${testCount}`);
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
  log(`Success rate: ${((passCount / testCount) * 100).toFixed(1)}%\n`);

  if (failCount === 0) {
    log('✅ All MDX rendering tests passed!', 'green');
    return 0;
  } else {
    log(`❌ ${failCount} test(s) failed`, 'red');
    return 1;
  }
}

// Run all tests
async function runTests() {
  try {
    testTailwindTypographyIntegration();
    testBuildArtifacts();
    testMDXFeatures();
    testBookMDXRendering();

    const exitCode = printSummary();
    process.exit(exitCode);
  } catch (error) {
    log(`\nTest suite error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testMDXFeatures, testBookMDXRendering, testBuildArtifacts, testTailwindTypographyIntegration };
