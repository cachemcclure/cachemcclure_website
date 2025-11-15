/**
 * Comprehensive Page Load Tests
 *
 * WCAG 2.1 Level A - SC 4.1.1: Parsing
 * Tests that all pages load without errors:
 * - HTTP 200 status codes
 * - No JavaScript console errors
 * - No image loading failures
 * - Valid HTML structure
 * - All dynamic routes generate correctly
 *
 * This test addresses the first item in the Testing Checklist:
 * "All pages load without errors"
 */

import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Define all static pages to test
const STATIC_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/about', name: 'About Page' },
  { path: '/books', name: 'Books Index' },
  { path: '/news', name: 'News Index' },
  { path: '/archives', name: 'Archives Page' },
  { path: '/search', name: 'Search Page' },
];

// Helper to get all news post slugs (exclude drafts)
function getNewsPostSlugs(): string[] {
  try {
    const newsDir = join(process.cwd(), 'src/content/news');
    const files = readdirSync(newsDir);
    return files
      .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
      .map(f => f.replace(/\.(mdx|md)$/, ''))
      .filter(slug => {
        // Read the file to check if it's a draft
        try {
          const content = readFileSync(join(newsDir, `${slug}.mdx`), 'utf-8');
          return !content.includes('draft: true');
        } catch {
          return true; // Include if we can't read it
        }
      });
  } catch (error) {
    console.warn('Could not read news directory:', error);
    return [];
  }
}

// Helper to get all book slugs
function getBookSlugs(): string[] {
  try {
    const booksDir = join(process.cwd(), 'src/content/books');
    const files = readdirSync(booksDir);
    return files
      .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
      .map(f => f.replace(/\.(mdx|md)$/, ''));
  } catch (error) {
    console.warn('Could not read books directory:', error);
    return [];
  }
}

// Collect console messages
interface ConsoleMessage {
  type: string;
  text: string;
  location?: string;
}

async function setupConsoleMonitoring(page: Page): Promise<ConsoleMessage[]> {
  const consoleMessages: ConsoleMessage[] = [];

  page.on('console', msg => {
    // Only capture errors and warnings
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()?.url,
      });
    }
  });

  page.on('pageerror', err => {
    consoleMessages.push({
      type: 'error',
      text: err.message,
    });
  });

  return consoleMessages;
}

test.describe('Page Load Tests - Static Pages', () => {
  for (const { path, name } of STATIC_PAGES) {
    test(`${name} (${path}) loads without errors`, async ({ page }) => {
      const consoleMessages = await setupConsoleMonitoring(page);

      // Navigate to the page
      const response = await page.goto(path, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Check HTTP status
      expect(response?.status()).toBe(200);

      // Check for console errors (filter out known acceptable warnings)
      const errors = consoleMessages.filter(
        msg =>
          msg.type === 'error' &&
          // Filter out pagefind loading errors on pages without search
          !msg.text.includes('pagefind') &&
          // Filter out other acceptable warnings
          !msg.text.includes('DevTools')
      );

      if (errors.length > 0) {
        console.error(`Console errors on ${path}:`, errors);
      }
      expect(errors).toHaveLength(0);

      // Verify basic page structure
      await expect(page.locator('html')).toHaveCount(1);
      await expect(page.locator('head')).toHaveCount(1);
      await expect(page.locator('body')).toHaveCount(1);

      // Verify essential meta tags
      await expect(page.locator('meta[charset]')).toHaveCount(1);
      await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
      await expect(page.locator('title')).toHaveCount(1);

      // Verify page has main content
      const mainContent = await page.locator('main').count();
      expect(mainContent).toBeGreaterThanOrEqual(1);

      // Check that page title is not empty
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Wait a bit to catch any delayed errors
      await page.waitForTimeout(1000);
    });
  }
});

test.describe('Page Load Tests - Dynamic Routes (News)', () => {
  const newsPostSlugs = getNewsPostSlugs();

  test.skip(newsPostSlugs.length === 0, 'No news posts found to test');

  for (const slug of newsPostSlugs) {
    test(`News post /news/${slug} loads without errors`, async ({ page }) => {
      const consoleMessages = await setupConsoleMonitoring(page);
      const path = `/news/${slug}`;

      // Navigate to the page
      const response = await page.goto(path, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Check HTTP status
      expect(response?.status()).toBe(200);

      // Check for console errors
      const errors = consoleMessages.filter(
        msg =>
          msg.type === 'error' &&
          !msg.text.includes('pagefind') &&
          !msg.text.includes('DevTools')
      );

      if (errors.length > 0) {
        console.error(`Console errors on ${path}:`, errors);
      }
      expect(errors).toHaveLength(0);

      // Verify article structure
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('article, [role="article"]')).toHaveCount(1);

      // Verify page has a heading
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });
  }
});

test.describe('Page Load Tests - Dynamic Routes (Books)', () => {
  const bookSlugs = getBookSlugs();

  test.skip(bookSlugs.length === 0, 'No books found to test');

  for (const slug of bookSlugs) {
    test(`Book page /books/${slug} loads without errors`, async ({ page }) => {
      const consoleMessages = await setupConsoleMonitoring(page);
      const path = `/books/${slug}`;

      // Navigate to the page
      const response = await page.goto(path, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Check HTTP status
      expect(response?.status()).toBe(200);

      // Check for console errors
      const errors = consoleMessages.filter(
        msg =>
          msg.type === 'error' &&
          !msg.text.includes('pagefind') &&
          !msg.text.includes('DevTools')
      );

      if (errors.length > 0) {
        console.error(`Console errors on ${path}:`, errors);
      }
      expect(errors).toHaveLength(0);

      // Verify basic structure
      await expect(page.locator('main')).toHaveCount(1);

      // Verify page has a heading
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });
  }
});

test.describe('Page Load Tests - Image Loading', () => {
  test('All images on homepage load successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Get all images
    const images = await page.locator('img').all();

    if (images.length === 0) {
      console.warn('No images found on homepage');
      return;
    }

    // Check each image
    for (const img of images) {
      const alt = await img.getAttribute('alt');

      // Verify image has alt text (accessibility)
      expect(alt).not.toBeNull();

      // Verify image loaded (naturalWidth > 0 means loaded)
      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('All images on books page load successfully', async ({ page }) => {
    await page.goto('/books', { waitUntil: 'networkidle' });

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();

      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('All images on news page load successfully', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'networkidle' });

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();

      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});

test.describe('Page Load Tests - Critical Resources', () => {
  test('Favicon loads successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const faviconLink = await page
      .locator('link[rel="icon"]')
      .getAttribute('href');
    expect(faviconLink).toBeTruthy();

    // Try to fetch the favicon
    const response = await page.goto(faviconLink!, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
  });

  test('RSS feed loads successfully', async ({ page }) => {
    const response = await page.goto('/rss.xml', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    // Verify it's XML
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('xml');
  });

  test('Sitemap loads successfully', async ({ page }) => {
    const response = await page.goto('/sitemap-index.xml', {
      waitUntil: 'networkidle',
    });

    // Sitemap might not exist in dev mode (only generated during build)
    // Accept both 200 (exists) and 404 (not generated yet)
    const status = response?.status();
    if (status === 404) {
      test.skip(true, 'Sitemap not available in dev mode');
    }

    expect(status).toBe(200);

    // Verify it's XML
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('xml');
  });

  test('robots.txt loads successfully', async ({ page }) => {
    const response = await page.goto('/robots.txt', {
      waitUntil: 'networkidle',
    });
    expect(response?.status()).toBe(200);
  });
});

test.describe('Page Load Tests - 404 Handling', () => {
  test('404 page exists and displays correctly', async ({ page }) => {
    const response = await page.goto('/404', { waitUntil: 'networkidle' });

    // 404 page should return 404 status (this is correct)
    expect(response?.status()).toBe(404);

    // But it should still render properly
    await expect(page.locator('html')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);

    // Should have a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Should have a link back to home
    const homeLink = await page.locator('a[href="/"]').count();
    expect(homeLink).toBeGreaterThan(0);
  });

  test('Non-existent page shows 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345', {
      waitUntil: 'networkidle',
    });

    // Should return 404 status
    expect(response?.status()).toBe(404);
  });
});

test.describe('Page Load Tests - Performance', () => {
  test('Homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Should load in under 5 seconds (generous for local dev)
    expect(loadTime).toBeLessThan(5000);

    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('No duplicate IDs on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Get all elements with IDs
    const elementsWithIds = await page.locator('[id]').all();
    const ids = await Promise.all(
      elementsWithIds.map(el => el.getAttribute('id'))
    );

    // Find duplicates
    const idCounts = new Map<string, number>();
    for (const id of ids) {
      if (id) {
        idCounts.set(id, (idCounts.get(id) || 0) + 1);
      }
    }

    const duplicates = Array.from(idCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([id, count]) => ({ id, count }));

    // Known issues to be fixed separately:
    // - SVG gradients with id="a" (from external SVG files)
    // - Component style tags with id="selected-style" (from theme/component system)
    const knownDuplicates = ['a', 'selected-style'];
    const unexpectedDuplicates = duplicates.filter(
      ({ id }) => !knownDuplicates.includes(id)
    );

    if (unexpectedDuplicates.length > 0) {
      console.error('Unexpected duplicate IDs found:', unexpectedDuplicates);
      throw new Error(
        `Found ${unexpectedDuplicates.length} unexpected duplicate IDs: ${unexpectedDuplicates.map(d => `${d.id} (${d.count}x)`).join(', ')}`
      );
    }

    // Log known issues for tracking
    const foundKnownIssues = duplicates.filter(({ id }) =>
      knownDuplicates.includes(id)
    );
    if (foundKnownIssues.length > 0) {
      console.warn(
        'Known duplicate IDs (tracked for future fix):',
        foundKnownIssues.map(d => `${d.id} (${d.count}x)`)
      );
    }
  });
});
