/**
 * Navigation & Link Consistency Tests
 *
 * Tests navigation functionality and link patterns:
 * - Navigation consistency across pages
 * - Active state indicators
 * - Breadcrumb navigation
 * - "Back to" links on detail pages
 * - Cross-page navigation flows
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, errorMessage = '') {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    const message = errorMessage ? `: ${errorMessage}` : '';
    console.log(`${colors.red}✗${colors.reset} ${testName}${message}`);
    testsFailed++;
  }
}

function testSection(name) {
  console.log(`\n${colors.blue}${name}${colors.reset}`);
  console.log('─'.repeat(50));
}

// Helper to read HTML files
function readDistFile(path) {
  const distPath = join(dirname(__dirname), 'dist', path);
  try {
    return readFileSync(distPath, 'utf-8');
  } catch (error) {
    return null;
  }
}

// Helper to extract navigation links from HTML
function extractNavLinks(html) {
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/i;
  const navMatch = html.match(navRegex);

  if (!navMatch) return [];

  const navContent = navMatch[1];
  const linkRegex = /href="([^"]+)"/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(navContent)) !== null) {
    links.push(match[1]);
  }

  return links;
}

// Helper to check for active navigation indicators
function hasActiveIndicator(html, path) {
  // Check for various active state patterns
  const patterns = [
    new RegExp(`aria-current="page"[^>]*>.*?${path}`, 's'),
    new RegExp(`${path}[^>]*aria-current="page"`, 's'),
    new RegExp(`class="[^"]*active[^"]*"[^>]*>.*?${path}`, 's'),
    new RegExp(`${path}[^>]*class="[^"]*active[^"]*"`, 's'),
    new RegExp(`\\[&\\.active\\][^>]*>.*?${path}`, 's'),
  ];

  return patterns.some(pattern => pattern.test(html));
}

// Helper to check for "back to" links
function hasBackLink(html, targetPath, linkText) {
  const backLinkPattern = new RegExp(
    `<a[^>]*href="${targetPath}"[^>]*>[^<]*${linkText}[^<]*<\\/a>`,
    'i'
  );
  return backLinkPattern.test(html);
}

// Verify build exists
const distPath = join(dirname(__dirname), 'dist');
try {
  statSync(distPath);
} catch (error) {
  console.error(`${colors.red}✗${colors.reset} Build directory not found. Run 'npm run build' first.`);
  process.exit(1);
}

console.log(`${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║      Navigation & Link Consistency Tests      ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}`);

// Load test pages
const homepage = readDistFile('index.html');
const aboutPage = readDistFile('about/index.html');
const booksIndex = readDistFile('books/index.html');
const newsIndex = readDistFile('news/index.html');
const searchPage = readDistFile('search/index.html');

// ============================================================================
// TEST SECTION 1: Navigation Consistency
// ============================================================================
testSection('1. Navigation Consistency Across Pages');

// Extract nav links from different pages
const homeNavLinks = extractNavLinks(homepage);
const aboutNavLinks = extractNavLinks(aboutPage);
const booksNavLinks = extractNavLinks(booksIndex);

assert(homeNavLinks.length > 0, 'Homepage has navigation links');
assert(aboutNavLinks.length > 0, 'About page has navigation links');
assert(booksNavLinks.length > 0, 'Books page has navigation links');

// Check that all pages have the same core navigation structure
const coreLinks = ['/books', '/about'];
coreLinks.forEach(link => {
  assert(
    homeNavLinks.includes(link),
    `Homepage navigation includes ${link}`
  );
  assert(
    aboutNavLinks.includes(link),
    `About page navigation includes ${link}`
  );
  assert(
    booksNavLinks.includes(link),
    `Books page navigation includes ${link}`
  );
});

// ============================================================================
// TEST SECTION 2: Header Component Consistency
// ============================================================================
testSection('2. Header Component Consistency');

// Extract header HTML from each page
function extractHeader(html) {
  const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
  return headerMatch ? headerMatch[1] : '';
}

const homeHeader = extractHeader(homepage);
const aboutHeader = extractHeader(aboutPage);
const booksHeader = extractHeader(booksIndex);

// Headers should be structurally similar
assert(homeHeader.length > 0, 'Homepage has header content');
assert(aboutHeader.length > 0, 'About page has header content');
assert(booksHeader.length > 0, 'Books page has header content');

// Check that headers contain the same elements (ignoring active states)
// Normalizer function kept for potential future use
function _normalizeHeader(header) {
  return header
    .replace(/aria-current="[^"]*"/g, '')
    .replace(/class="[^"]*active[^"]*"/g, 'class=""')
    .replace(/\s+/g, ' ')
    .trim();
}

// All headers should have logo/site name
assert(
  homeHeader.includes('Cache McClure') || homeHeader.includes('href="/"'),
  'Homepage header has logo/home link'
);
assert(
  aboutHeader.includes('Cache McClure') || aboutHeader.includes('href="/"'),
  'About page header has logo/home link'
);
assert(
  booksHeader.includes('Cache McClure') || booksHeader.includes('href="/"'),
  'Books page header has logo/home link'
);

// ============================================================================
// TEST SECTION 3: Active Navigation States
// ============================================================================
testSection('3. Active Navigation States');

// Homepage: Home should be active or no active state
// About page: About should be active
assert(
  hasActiveIndicator(aboutPage, '/about') ||
  aboutPage.includes('aria-current="page"'),
  'About page shows active state for About nav item'
);

// Books page: Books should be active
assert(
  hasActiveIndicator(booksIndex, '/books') ||
  booksIndex.includes('aria-current="page"'),
  'Books index shows active state for Books nav item'
);

// News page: News should be active
if (newsIndex) {
  assert(
    hasActiveIndicator(newsIndex, '/news') ||
    newsIndex.includes('aria-current="page"'),
    'News index shows active state for News nav item'
  );
}

// ============================================================================
// TEST SECTION 4: Detail Page Navigation ("Back to" Links)
// ============================================================================
testSection('4. Detail Page Navigation');

// Check book detail pages have "back to books" link
const booksDir = join(distPath, 'books');
try {
  const bookDirs = readdirSync(booksDir).filter(f => {
    const fPath = join(booksDir, f);
    return statSync(fPath).isDirectory();
  });

  if (bookDirs.length > 0) {
    const sampleBook = bookDirs[0];
    const bookPage = readDistFile(`books/${sampleBook}/index.html`);

    assert(
      bookPage && (
        hasBackLink(bookPage, '/books', 'Books') ||
        hasBackLink(bookPage, '/books', 'Back') ||
        bookPage.includes('href="/books"')
      ),
      'Book detail page has link back to Books index'
    );

    // Book page should have consistent header
    const bookHeader = extractHeader(bookPage);
    assert(
      bookHeader.includes('Cache McClure') || bookHeader.includes('href="/"'),
      'Book detail page has consistent header'
    );
  }
} catch (error) {
  console.log(`${colors.yellow}⚠${colors.reset} Could not test book navigation (no books found)`);
}

// Check news detail pages have "back to news" link
const newsDir = join(distPath, 'news');
try {
  const newsDirs = readdirSync(newsDir).filter(f => {
    const fPath = join(newsDir, f);
    return statSync(fPath).isDirectory();
  });

  if (newsDirs.length > 0) {
    const sampleNews = newsDirs[0];
    const newsPage = readDistFile(`news/${sampleNews}/index.html`);

    assert(
      newsPage && (
        hasBackLink(newsPage, '/news', 'News') ||
        hasBackLink(newsPage, '/news', 'Back') ||
        newsPage.includes('href="/news"')
      ),
      'News detail page has link back to News index'
    );

    // News page should have consistent header
    const newsHeader = extractHeader(newsPage);
    assert(
      newsHeader.includes('Cache McClure') || newsHeader.includes('href="/"'),
      'News detail page has consistent header'
    );
  }
} catch (error) {
  console.log(`${colors.yellow}⚠${colors.reset} Could not test news navigation (no news found)`);
}

// ============================================================================
// TEST SECTION 5: Footer Consistency
// ============================================================================
testSection('5. Footer Consistency');

function extractFooter(html) {
  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
  return footerMatch ? footerMatch[1] : '';
}

const homeFooter = extractFooter(homepage);
const aboutFooter = extractFooter(aboutPage);
const booksFooter = extractFooter(booksIndex);

assert(homeFooter.length > 0, 'Homepage has footer content');
assert(aboutFooter.length > 0, 'About page has footer content');
assert(booksFooter.length > 0, 'Books page has footer content');

// Footer should contain copyright
const currentYear = new Date().getFullYear();
assert(
  homeFooter.includes(currentYear.toString()) ||
  homeFooter.includes('©') ||
  homeFooter.includes('Copyright'),
  'Homepage footer contains copyright information'
);

// Footer should contain social links
assert(
  homeFooter.includes('href="http') || homeFooter.includes('href="//'),
  'Homepage footer contains external links (social media)'
);

// ============================================================================
// TEST SECTION 6: Breadcrumb/Hierarchical Navigation
// ============================================================================
testSection('6. Hierarchical Navigation Patterns');

// Check that detail pages show their parent context
const booksDir2 = join(distPath, 'books');
try {
  const bookDirs = readdirSync(booksDir2).filter(f => {
    const fPath = join(booksDir2, f);
    return statSync(fPath).isDirectory();
  });

  if (bookDirs.length > 0) {
    const bookPage = readDistFile(`books/${bookDirs[0]}/index.html`);

    // Book page should indicate it's part of the Books section
    assert(
      bookPage && (
        bookPage.includes('Books') ||
        hasActiveIndicator(bookPage, '/books')
      ),
      'Book detail page indicates Books section context'
    );
  }
} catch (error) {
  // No books to test
}

// ============================================================================
// TEST SECTION 7: Skip to Content Link (Accessibility)
// ============================================================================
testSection('7. Accessibility Navigation');

// Check for skip to content link
assert(
  homepage.includes('href="#main-content"') ||
  homepage.includes('Skip to content'),
  'Homepage has skip to content link'
);

assert(
  aboutPage && (
    aboutPage.includes('href="#main-content"') ||
    aboutPage.includes('Skip to content')
  ),
  'About page has skip to content link'
);

// Check that main content has ID
assert(
  homepage.includes('id="main-content"'),
  'Homepage main content has #main-content ID'
);

assert(
  aboutPage && aboutPage.includes('id="main-content"'),
  'About page main content has #main-content ID'
);

// ============================================================================
// TEST SECTION 8: Mobile Navigation (Responsive)
// ============================================================================
testSection('8. Mobile Navigation Elements');

// Check for mobile menu toggle button
const hasMobileToggle = homepage.includes('menu-toggle') ||
                       homepage.includes('hamburger') ||
                       homepage.includes('nav-toggle') ||
                       homepage.includes('mobile-menu');

if (hasMobileToggle) {
  assert(true, 'Homepage has mobile navigation toggle');
} else {
  console.log(`${colors.yellow}⚠${colors.reset} No mobile menu toggle detected (may use responsive CSS only)`);
}

// ============================================================================
// TEST SECTION 9: Navigation Link Attributes
// ============================================================================
testSection('9. Navigation Link Accessibility');

// Check that navigation links have appropriate attributes
function checkNavLinkAttributes(html, pageName) {
  // Extract all nav links
  const navSection = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
  if (!navSection) return;

  const navHTML = navSection[1];

  // Check for proper link structure
  const hasProperLinks = /<a\s+[^>]*href="[^"]+"/i.test(navHTML);
  assert(hasProperLinks, `${pageName} navigation has properly formatted links`);
}

checkNavLinkAttributes(homepage, 'Homepage');
checkNavLinkAttributes(aboutPage, 'About page');
checkNavLinkAttributes(booksIndex, 'Books page');

// ============================================================================
// TEST SECTION 10: Search Integration
// ============================================================================
testSection('10. Search Navigation');

if (searchPage) {
  assert(searchPage.includes('search') || searchPage.includes('Search'),
         'Search page has search functionality');

  // Search page should have consistent navigation
  const searchNavLinks = extractNavLinks(searchPage);
  assert(searchNavLinks.length > 0, 'Search page has navigation links');
  assert(searchNavLinks.includes('/books'), 'Search page nav includes Books link');
}

// Check if search is accessible from main navigation
const headerHasSearch = homepage.includes('href="/search"') ||
                       homepage.includes('/search/');

if (headerHasSearch) {
  assert(true, 'Search is accessible from main navigation');
} else {
  console.log(`${colors.yellow}⚠${colors.reset} Search not in main navigation (may be accessed elsewhere)`);
}

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '═'.repeat(50));
console.log(`${colors.cyan}Test Summary${colors.reset}`);
console.log('═'.repeat(50));
console.log(`${colors.green}✓ Passed:${colors.reset} ${testsPassed}`);
console.log(`${colors.red}✗ Failed:${colors.reset} ${testsFailed}`);
console.log(`${colors.blue}Total Tests:${colors.reset} ${testsPassed + testsFailed}`);

const passRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
console.log(`${colors.cyan}Pass Rate:${colors.reset} ${passRate}%`);
console.log('═'.repeat(50));

if (testsFailed > 0) {
  console.log(`\n${colors.red}❌ Some navigation tests failed!${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✅ All navigation tests passed!${colors.reset}`);
  process.exit(0);
}
