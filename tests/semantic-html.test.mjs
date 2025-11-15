/**
 * Test suite for Semantic HTML Structure
 * Tests that all pages use proper HTML5 semantic elements
 * Verifies WCAG 2.1 compliance and SEO best practices
 */

import { readFileSync, readdirSync, statSync } from 'fs';
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
const issues = [];

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (details) {
      console.log(`  ${colors.yellow}${details}${colors.reset}`);
      issues.push({ test: testName, details });
    }
    testsFailed++;
  }
}

function testSection(name) {
  console.log(`\n${colors.blue}${name}${colors.reset}`);
}

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Count occurrences of an element in HTML
 */
function countElement(html, element) {
  const regex = new RegExp(`<${element}[\\s>]`, 'gi');
  const matches = html.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Check if HTML contains an element
 */
function hasElement(html, element) {
  const regex = new RegExp(`<${element}[\\s>]`, 'i');
  return regex.test(html);
}

/**
 * Check if HTML contains time elements with datetime attribute
 * Currently unused but kept for potential future use
 */
function _hasTimeWithDatetime(html) {
  const timeRegex = /<time[^>]*datetime=["'][^"']*["'][^>]*>/i;
  return timeRegex.test(html);
}

/**
 * Extract all time elements
 */
function extractTimeElements(html) {
  const timeRegex = /<time[^>]*>/gi;
  const matches = html.match(timeRegex) || [];

  return matches.map(timeTag => {
    const datetimeMatch = timeTag.match(/datetime=["']([^"']*)["']/i);
    const datetime = datetimeMatch ? datetimeMatch[1] : null;
    return { timeTag, datetime };
  });
}

/**
 * Determine page type from path
 */
function getPageType(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  if (normalized.includes('/books/') && !normalized.endsWith('/books/index.html')) {
    return 'book-detail';
  } else if (normalized.includes('/news/') && !normalized.endsWith('/news/index.html')) {
    return 'news-detail';
  } else if (normalized.endsWith('/about/index.html') || normalized.endsWith('/about.html')) {
    return 'about';
  } else if (normalized.endsWith('/books/index.html')) {
    return 'books-index';
  } else if (normalized.endsWith('/news/index.html')) {
    return 'news-index';
  } else if (normalized.includes('/404')) {
    return '404';
  } else if (normalized.endsWith('/index.html') && !normalized.includes('/books/') && !normalized.includes('/news/')) {
    return 'homepage';
  }

  return 'other';
}

// Find all HTML files in dist directory
const distPath = join(dirname(__dirname), 'dist');
let htmlFiles;

try {
  htmlFiles = findHtmlFiles(distPath);
} catch (error) {
  console.error(`${colors.red}✗${colors.reset} Could not read dist directory. Make sure to run 'npm run build' first.`);
  console.error(error.message);
  process.exit(1);
}

console.log(`${colors.blue}Testing Semantic HTML Structure${colors.reset}`);
console.log('='.repeat(50));
console.log(`Found ${htmlFiles.length} HTML files to test\n`);

let stats = {
  pagesWithMain: 0,
  pagesWithHeader: 0,
  pagesWithFooter: 0,
  pagesWithNav: 0,
  pagesWithArticle: 0,
  pagesWithSection: 0,
  pagesWithTime: 0,
  multipleMainElements: 0,
};

// Test each HTML file
htmlFiles.forEach(filePath => {
  const relativePath = filePath.replace(distPath, '').replace(/\\/g, '/');
  const html = readFileSync(filePath, 'utf-8');
  const pageType = getPageType(filePath);

  testSection(`${relativePath} [${pageType}]`);

  // Test 1: Page has exactly one <main> element
  const mainCount = countElement(html, 'main');
  if (mainCount === 1) {
    stats.pagesWithMain++;
    assert(true, 'Has exactly one <main> element');
  } else if (mainCount === 0) {
    assert(false, 'Has exactly one <main> element', 'No <main> element found. Every page should have exactly one <main> element.');
  } else {
    stats.multipleMainElements++;
    assert(false, 'Has exactly one <main> element', `Found ${mainCount} <main> elements. Each page should have exactly one <main> element.`);
  }

  // Test 2: Page has <header> element
  const hasHeader = hasElement(html, 'header');
  if (hasHeader) {
    stats.pagesWithHeader++;
    assert(true, 'Has <header> element');
  } else {
    assert(false, 'Has <header> element', 'No <header> element found. Add a semantic <header> element for the site header.');
  }

  // Test 3: Page has <footer> element
  const hasFooter = hasElement(html, 'footer');
  if (hasFooter) {
    stats.pagesWithFooter++;
    assert(true, 'Has <footer> element');
  } else {
    assert(false, 'Has <footer> element', 'No <footer> element found. Add a semantic <footer> element for the site footer.');
  }

  // Test 4: Page has <nav> element
  const hasNav = hasElement(html, 'nav');
  if (hasNav) {
    stats.pagesWithNav++;
    assert(true, 'Has <nav> element');
  } else {
    assert(false, 'Has <nav> element', 'No <nav> element found. Navigation should be wrapped in a <nav> element.');
  }

  // Test 5: Book and news detail pages should have <article> elements
  if (pageType === 'book-detail' || pageType === 'news-detail') {
    const hasArticle = hasElement(html, 'article');
    if (hasArticle) {
      stats.pagesWithArticle++;
      assert(true, 'Has <article> element (for content)');
    } else {
      assert(false, 'Has <article> element (for content)', `${pageType} pages should wrap main content in an <article> element.`);
    }
  }

  // Test 6: About page should have <section> elements
  if (pageType === 'about') {
    const hasSection = hasElement(html, 'section');
    if (hasSection) {
      stats.pagesWithSection++;
      assert(true, 'Has <section> elements (for content organization)');
    } else {
      assert(false, 'Has <section> elements (for content organization)', 'About page should use <section> elements to organize content.');
    }
  }

  // Test 7: News detail pages should have <time> elements with datetime attribute
  if (pageType === 'news-detail') {
    const timeElements = extractTimeElements(html);

    if (timeElements.length > 0) {
      stats.pagesWithTime++;

      // Check each time element has datetime attribute
      const allHaveDatetime = timeElements.every(t => t.datetime !== null);

      if (allHaveDatetime) {
        assert(true, `Has <time> elements with datetime attribute (${timeElements.length} found)`);
      } else {
        const missingDatetime = timeElements.filter(t => t.datetime === null).length;
        assert(false, 'All <time> elements have datetime attribute', `${missingDatetime} <time> element(s) missing datetime attribute.`);
      }
    } else {
      assert(false, 'Has <time> elements for dates', 'News detail pages should use <time> elements with datetime attributes for publish dates.');
    }
  }

  // Test 8: Book and news index pages should have <article> elements for cards
  if (pageType === 'books-index' || pageType === 'news-index') {
    const hasArticle = hasElement(html, 'article');
    if (hasArticle) {
      assert(true, 'Has <article> elements (for cards/listings)');
    } else {
      // This is a warning, not a failure, since the page might be empty
      console.log(`  ${colors.yellow}⚠${colors.reset} No <article> elements found. Book/news cards should be wrapped in <article> elements.`);
    }
  }

  // Test 9: Homepage should have <section> elements
  if (pageType === 'homepage') {
    const hasSection = hasElement(html, 'section');
    if (hasSection) {
      stats.pagesWithSection++;
      assert(true, 'Has <section> elements (for content organization)');
    } else {
      assert(false, 'Has <section> elements (for content organization)', 'Homepage should use <section> elements to organize content areas.');
    }
  }
});

// Summary Statistics
testSection('Summary Statistics');
console.log(`Total pages tested: ${htmlFiles.length}`);
console.log(`Pages with <main>: ${stats.pagesWithMain} (${Math.round(stats.pagesWithMain / htmlFiles.length * 100)}%)`);
console.log(`Pages with <header>: ${stats.pagesWithHeader} (${Math.round(stats.pagesWithHeader / htmlFiles.length * 100)}%)`);
console.log(`Pages with <footer>: ${stats.pagesWithFooter} (${Math.round(stats.pagesWithFooter / htmlFiles.length * 100)}%)`);
console.log(`Pages with <nav>: ${stats.pagesWithNav} (${Math.round(stats.pagesWithNav / htmlFiles.length * 100)}%)`);
console.log(`Pages with <article>: ${stats.pagesWithArticle}`);
console.log(`Pages with <section>: ${stats.pagesWithSection}`);
console.log(`Pages with <time>: ${stats.pagesWithTime}`);

if (stats.multipleMainElements > 0) {
  console.log(`${colors.yellow}⚠ Pages with multiple <main> elements: ${stats.multipleMainElements}${colors.reset}`);
}

// Semantic HTML Compliance Check
testSection('Semantic HTML Compliance');
const requiredElements = [
  { name: 'main', count: stats.pagesWithMain, threshold: htmlFiles.length },
  { name: 'header', count: stats.pagesWithHeader, threshold: htmlFiles.length },
  { name: 'footer', count: stats.pagesWithFooter, threshold: htmlFiles.length },
  { name: 'nav', count: stats.pagesWithNav, threshold: htmlFiles.length },
];

requiredElements.forEach(element => {
  const compliant = element.count === element.threshold;

  assert(
    compliant,
    `All pages have <${element.name}> element`,
    compliant ? '' : `${element.threshold - element.count} page(s) missing <${element.name}> element.`
  );
});

// Detailed Issues Report
if (issues.length > 0) {
  testSection('Detailed Issues Report');
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.test}`);
    console.log(`   ${issue.details}`);
  });
}

// Final Summary
console.log('\n' + '='.repeat(50));
console.log(`${colors.blue}Test Summary${colors.reset}`);
console.log(`${colors.green}Passed:${colors.reset} ${testsPassed}`);
console.log(`${colors.red}Failed:${colors.reset} ${testsFailed}`);

if (testsFailed > 0) {
  console.log(`\n${colors.red}Some tests failed! Fix the issues above to ensure proper semantic HTML structure.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}All tests passed! Your site uses proper semantic HTML5 elements.${colors.reset}`);
  process.exit(0);
}
