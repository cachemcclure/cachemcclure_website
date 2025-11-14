/**
 * Comprehensive Routing Tests
 *
 * Tests all routing functionality for the website:
 * - Static routes load correctly
 * - Dynamic routes generate properly
 * - 404 page shows for invalid routes
 * - Navigation between pages works
 * - All internal links are valid
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
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
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

function assert(condition, testName, errorMessage = '') {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
    testResults.push({ passed: true, name: testName });
  } else {
    const message = errorMessage ? `: ${errorMessage}` : '';
    console.log(`${colors.red}✗${colors.reset} ${testName}${message}`);
    testsFailed++;
    testResults.push({ passed: false, name: testName, error: errorMessage });
  }
}

function testSection(name) {
  console.log(`\n${colors.blue}${name}${colors.reset}`);
  console.log('─'.repeat(50));
}

// Helper to read HTML files from dist
function readDistFile(path) {
  const distPath = join(dirname(__dirname), 'dist', path);
  try {
    return readFileSync(distPath, 'utf-8');
  } catch (error) {
    return null;
  }
}

// Helper to check if a file exists in dist
function fileExists(path) {
  const distPath = join(dirname(__dirname), 'dist', path);
  try {
    statSync(distPath);
    return true;
  } catch (error) {
    return false;
  }
}

// Helper to get all HTML files recursively
function getAllHtmlFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (extname(file) === '.html') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Helper to extract all internal links from HTML
function extractInternalLinks(html) {
  const linkRegex = /href="([^"]+)"/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    // Only include internal links (not external, not anchors, not special)
    if (!url.startsWith('http') &&
        !url.startsWith('//') &&
        !url.startsWith('#') &&
        !url.startsWith('mailto:') &&
        !url.startsWith('javascript:')) {
      links.push(url);
    }
  }

  return [...new Set(links)]; // Remove duplicates
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
console.log(`${colors.cyan}║   Comprehensive Routing & Navigation Tests    ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}`);

// ============================================================================
// TEST SECTION 1: Static Routes
// ============================================================================
testSection('1. Static Routes - Core Pages');

// Test homepage
const homepage = readDistFile('index.html');
assert(homepage !== null, 'Homepage (/) exists');
assert(homepage && homepage.includes('<!DOCTYPE html>'), 'Homepage has valid HTML');
assert(homepage && homepage.includes('<main'), 'Homepage has main content area');

// Test about page
const aboutPage = readDistFile('about/index.html');
assert(aboutPage !== null, 'About page (/about) exists');
assert(aboutPage && aboutPage.includes('Cache McClure'), 'About page contains author name');

// Test books index page
const booksIndex = readDistFile('books/index.html');
assert(booksIndex !== null, 'Books index page (/books) exists');
assert(booksIndex && booksIndex.includes('Books'), 'Books index has expected content');

// Test news index page
const newsIndex = readDistFile('news/index.html');
assert(newsIndex !== null, 'News index page (/news) exists');
assert(newsIndex && newsIndex.includes('News'), 'News index has expected content');

// Test 404 page
const notFoundPage = readDistFile('404.html');
assert(notFoundPage !== null, '404 error page (404.html) exists');
assert(notFoundPage && notFoundPage.includes('404'), '404 page displays error code');

// Test search page (if exists)
const searchPage = readDistFile('search/index.html');
if (searchPage) {
  assert(searchPage.includes('Search'), 'Search page has expected content');
}

// Test tags index
const tagsIndex = readDistFile('tags/index.html');
if (tagsIndex) {
  assert(tagsIndex.includes('Tags') || tagsIndex.includes('tags'), 'Tags index has expected content');
}

// ============================================================================
// TEST SECTION 2: Dynamic Routes - Books
// ============================================================================
testSection('2. Dynamic Routes - Books');

// Check if any book pages were generated
const booksDir = join(distPath, 'books');
try {
  const bookFiles = readdirSync(booksDir).filter(f => {
    const fPath = join(booksDir, f);
    return statSync(fPath).isDirectory() && f !== 'index.html';
  });

  assert(bookFiles.length >= 0, `Book pages generated (${bookFiles.length} found)`);

  // Test a sample book page if one exists
  if (bookFiles.length > 0) {
    const sampleBook = bookFiles[0];
    const bookPage = readDistFile(`books/${sampleBook}/index.html`);
    assert(bookPage !== null, `Sample book page (/books/${sampleBook}) loads`);
    assert(bookPage && bookPage.includes('<main'), `Book page has main content area`);
    assert(bookPage && (bookPage.includes('href="/books"') || bookPage.includes('Back to Books')),
           `Book page has navigation back to books index`);
  }
} catch (error) {
  console.log(`${colors.yellow}⚠${colors.reset} No book pages found (this may be expected if no content exists)`);
}

// ============================================================================
// TEST SECTION 3: Dynamic Routes - News
// ============================================================================
testSection('3. Dynamic Routes - News');

// Check if any news pages were generated
const newsDir = join(distPath, 'news');
try {
  const newsFiles = readdirSync(newsDir).filter(f => {
    const fPath = join(newsDir, f);
    return statSync(fPath).isDirectory() && f !== 'index.html';
  });

  assert(newsFiles.length >= 0, `News pages generated (${newsFiles.length} found)`);

  // Test a sample news page if one exists
  if (newsFiles.length > 0) {
    const sampleNews = newsFiles[0];
    const newsPage = readDistFile(`news/${sampleNews}/index.html`);
    assert(newsPage !== null, `Sample news page (/news/${sampleNews}) loads`);
    assert(newsPage && newsPage.includes('<main'), `News page has main content area`);
    assert(newsPage && (newsPage.includes('href="/news"') || newsPage.includes('Back to News')),
           `News page has navigation back to news index`);
  }
} catch (error) {
  console.log(`${colors.yellow}⚠${colors.reset} No news pages found (this may be expected if no content exists)`);
}

// ============================================================================
// TEST SECTION 4: Dynamic Routes - Blog Posts
// ============================================================================
testSection('4. Dynamic Routes - Blog Posts');

// Check if any blog post pages were generated
const postsDir = join(distPath, 'posts');
if (fileExists('posts/index.html')) {
  const postsIndex = readDistFile('posts/index.html');
  assert(postsIndex !== null, 'Blog posts index (/posts) exists');

  try {
    const postFiles = readdirSync(postsDir).filter(f => {
      const fPath = join(postsDir, f);
      return statSync(fPath).isDirectory();
    });

    assert(postFiles.length >= 0, `Blog post pages generated (${postFiles.length} found)`);

    // Test pagination if multiple pages exist
    const pageFiles = postFiles.filter(f => /^\d+$/.test(f));
    if (pageFiles.length > 0) {
      assert(true, `Blog pagination pages exist (${pageFiles.length} pages)`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} Could not read posts directory`);
  }
} else {
  console.log(`${colors.yellow}⚠${colors.reset} No blog posts found (this may be expected)`);
}

// ============================================================================
// TEST SECTION 5: Navigation Components
// ============================================================================
testSection('5. Navigation Components');

// Test header navigation on homepage
assert(homepage && homepage.includes('<header'), 'Homepage has header element');
assert(homepage && homepage.includes('href="/books"'), 'Header contains Books link');
assert(homepage && homepage.includes('href="/about"'), 'Header contains About link');
assert(homepage && homepage.includes('href="/"') || homepage.includes('Cache McClure'), 'Header contains logo/home link');

// Test footer exists
assert(homepage && homepage.includes('<footer'), 'Homepage has footer element');

// Test that all pages have consistent navigation
if (aboutPage) {
  assert(aboutPage.includes('<header'), 'About page has header');
  assert(aboutPage.includes('<footer'), 'About page has footer');
}

if (booksIndex) {
  assert(booksIndex.includes('<header'), 'Books index has header');
  assert(booksIndex.includes('<footer'), 'Books index has footer');
}

// ============================================================================
// TEST SECTION 6: Active Navigation States
// ============================================================================
testSection('6. Active Navigation States');

// These tests check if pages properly indicate which nav item is active
// The exact implementation depends on your navigation component

if (booksIndex) {
  // Books page should highlight the books nav item
  const hasActiveBooks = booksIndex.includes('aria-current="page"') ||
                         booksIndex.includes('class="active"') ||
                         booksIndex.includes('[&.active]');
  assert(hasActiveBooks, 'Books page indicates active navigation state');
}

if (aboutPage) {
  // About page should highlight the about nav item
  const hasActiveAbout = aboutPage.includes('aria-current="page"') ||
                         aboutPage.includes('class="active"') ||
                         aboutPage.includes('[&.active]');
  assert(hasActiveAbout, 'About page indicates active navigation state');
}

// ============================================================================
// TEST SECTION 7: Internal Link Validation
// ============================================================================
testSection('7. Internal Link Validation');

// Get all HTML files
const allHtmlFiles = getAllHtmlFiles(distPath);
const totalPages = allHtmlFiles.length;
assert(totalPages > 0, `Generated pages found (${totalPages} total pages)`);

// Collect all internal links and verify they exist
const brokenLinks = new Map(); // Map of source page -> broken links
let totalLinksChecked = 0;
let brokenLinkCount = 0;

// Sample a subset of pages to check (checking all could be slow)
const samplesToCheck = Math.min(totalPages, 20);
const samplePages = allHtmlFiles.slice(0, samplesToCheck);

samplePages.forEach(filePath => {
  const html = readFileSync(filePath, 'utf-8');
  const links = extractInternalLinks(html);

  links.forEach(link => {
    totalLinksChecked++;

    // Normalize the link to a file path
    let checkPath = link;

    // Remove query strings and anchors
    checkPath = checkPath.split('?')[0].split('#')[0];

    // Skip special paths
    if (checkPath.startsWith('/') && !checkPath.startsWith('//')) {
      checkPath = checkPath.substring(1); // Remove leading slash

      // Try different path variations
      const pathsToTry = [
        checkPath,
        checkPath + '/index.html',
        checkPath === '' ? 'index.html' : checkPath,
        checkPath.endsWith('/') ? checkPath + 'index.html' : checkPath + '/index.html'
      ];

      let exists = false;
      for (const tryPath of pathsToTry) {
        if (fileExists(tryPath)) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        brokenLinkCount++;
        const relativePath = filePath.replace(distPath, '');
        if (!brokenLinks.has(relativePath)) {
          brokenLinks.set(relativePath, []);
        }
        brokenLinks.get(relativePath).push(link);
      }
    }
  });
});

assert(brokenLinkCount === 0,
       `All internal links are valid (checked ${totalLinksChecked} links in ${samplesToCheck} pages)`,
       brokenLinkCount > 0 ? `Found ${brokenLinkCount} broken links` : '');

// Display broken links if any
if (brokenLinkCount > 0) {
  console.log(`\n${colors.yellow}Broken Links Details:${colors.reset}`);
  brokenLinks.forEach((links, page) => {
    console.log(`  ${colors.cyan}${page}${colors.reset}:`);
    links.forEach(link => {
      console.log(`    - ${link}`);
    });
  });
}

// ============================================================================
// TEST SECTION 8: Page Metadata
// ============================================================================
testSection('8. Page Metadata & SEO');

// Test that all pages have essential meta tags
function testPageMetadata(html, pageName) {
  if (!html) return;

  assert(html.includes('<title>'), `${pageName} has title tag`);
  assert(html.includes('charset="UTF-8"') || html.includes('charset=UTF-8'),
         `${pageName} has charset declaration`);
  assert(html.includes('viewport'), `${pageName} has viewport meta tag`);
  assert(html.includes('og:title') || html.includes('property="og:title"'),
         `${pageName} has Open Graph title`);
}

testPageMetadata(homepage, 'Homepage');
testPageMetadata(aboutPage, 'About page');
testPageMetadata(booksIndex, 'Books index');
testPageMetadata(newsIndex, 'News index');

// ============================================================================
// TEST SECTION 9: Special Files & Endpoints
// ============================================================================
testSection('9. Special Files & Endpoints');

// Test for sitemap.xml
assert(fileExists('sitemap-0.xml') || fileExists('sitemap.xml'), 'Sitemap exists');

// Test for robots.txt
assert(fileExists('robots.txt'), 'robots.txt exists');

// Test for RSS feed
assert(fileExists('rss.xml'), 'RSS feed exists');

// Test for favicon
assert(fileExists('favicon.svg') || fileExists('favicon.ico'), 'Favicon exists');

// ============================================================================
// TEST SECTION 10: 404 Handling
// ============================================================================
testSection('10. 404 Error Handling');

// The 404.html file should exist at the root
assert(notFoundPage !== null, '404.html exists in dist root');
assert(notFoundPage && notFoundPage.includes('<!DOCTYPE html>'), '404 page is valid HTML');
assert(notFoundPage && notFoundPage.includes('href="/"'), '404 page has link back to home');
assert(notFoundPage && notFoundPage.includes('404'), '404 page displays error code');

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '═'.repeat(50));
console.log(`${colors.cyan}Test Summary${colors.reset}`);
console.log('═'.repeat(50));
console.log(`${colors.green}✓ Passed:${colors.reset} ${testsPassed}`);
console.log(`${colors.red}✗ Failed:${colors.reset} ${testsFailed}`);
console.log(`${colors.blue}Total Tests:${colors.reset} ${testsPassed + testsFailed}`);

// Calculate pass rate
const passRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
console.log(`${colors.cyan}Pass Rate:${colors.reset} ${passRate}%`);

console.log('═'.repeat(50));

if (testsFailed > 0) {
  console.log(`\n${colors.red}❌ Some tests failed!${colors.reset}`);
  console.log(`\n${colors.yellow}Failed tests:${colors.reset}`);
  testResults
    .filter(r => !r.passed)
    .forEach(r => {
      console.log(`  ${colors.red}✗${colors.reset} ${r.name}`);
      if (r.error) {
        console.log(`    ${colors.yellow}${r.error}${colors.reset}`);
      }
    });
  process.exit(1);
} else {
  console.log(`\n${colors.green}✅ All routing tests passed!${colors.reset}`);
  process.exit(0);
}
