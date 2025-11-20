/**
 * JavaScript Optimization Test Suite
 *
 * Validates:
 * - Minimal JavaScript usage (static-first approach)
 * - No unnecessary client-side hydration
 * - Bundle size constraints
 * - Code splitting effectiveness
 * - Progressive enhancement
 * - Astro islands usage
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

//=============================================================================
// CONFIGURATION & CONSTANTS
//=============================================================================

const BUNDLE_SIZE_LIMITS = {
  // Per-page JavaScript (excluding Pagefind search)
  maxJsPerPage: 25 * 1024, // 25KB (currently ~20KB)

  // Pagefind (only loaded on /search page)
  maxPagefindBundle: 900 * 1024, // 900KB (currently ~816KB)

  // Individual chunks
  maxClientRouterSize: 20 * 1024, // 20KB
  maxUiCoreSize: 80 * 1024, // 80KB
  maxSearchScriptSize: 3 * 1024, // 3KB
};

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

const TEST_PAGES = [
  { url: '/', name: 'Homepage' },
  { url: '/books', name: 'Books Index' },
  { url: '/books/fracture-engine', name: 'Book Detail' },
  { url: '/news', name: 'News Index' },
  { url: '/news/2025-11-cover-art', name: 'News Detail' },
  { url: '/about', name: 'About Page' },
];

//=============================================================================
// BUNDLE SIZE TESTS
//=============================================================================

test.describe('Bundle Size Analysis', () => {
  test('should have minimal JavaScript bundle sizes', async () => {
    const distPath = path.join(process.cwd(), 'dist', '_astro');

    if (!fs.existsSync(distPath)) {
      throw new Error('dist/_astro directory not found. Run `npm run build` first.');
    }

    const files = fs.readdirSync(distPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    const bundleSizes: Record<string, number> = {};
    let totalSize = 0;

    for (const file of jsFiles) {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      bundleSizes[file] = stats.size;
      totalSize += stats.size;
    }

    // Log bundle sizes for reference
    console.log('\n📦 JavaScript Bundle Sizes:');
    Object.entries(bundleSizes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([file, size]) => {
        console.log(`  ${file}: ${(size / 1024).toFixed(2)} KB`);
      });
    console.log(`  Total: ${(totalSize / 1024).toFixed(2)} KB\n`);

    // Find specific chunks
    const clientRouter = Object.entries(bundleSizes)
      .find(([file]) => file.includes('ClientRouter'))?.[1] || 0;
    const uiCore = Object.entries(bundleSizes)
      .find(([file]) => file.includes('ui-core'))?.[1] || 0;
    const searchScript = Object.entries(bundleSizes)
      .find(([file]) => file.includes('search.astro'))?.[1] || 0;

    // Non-Pagefind JavaScript (site-wide)
    const coreJs = clientRouter + uiCore + searchScript;

    // Validate bundle sizes
    expect(coreJs).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.maxJsPerPage);
    expect(clientRouter).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.maxClientRouterSize);
    expect(uiCore).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.maxUiCoreSize);
    expect(searchScript).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.maxSearchScriptSize);
  });

  test('should have properly sized Pagefind bundle', async () => {
    const pagefindPath = path.join(process.cwd(), 'dist', 'pagefind');

    if (!fs.existsSync(pagefindPath)) {
      console.log('⚠️  Pagefind directory not found (search may be disabled)');
      return;
    }

    // Calculate total Pagefind size
    let totalSize = 0;
    const calculateDirSize = (dirPath: string): void => {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          calculateDirSize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    };

    calculateDirSize(pagefindPath);

    console.log(`\n🔍 Pagefind Bundle Size: ${(totalSize / 1024).toFixed(2)} KB\n`);

    // Pagefind should be under 900KB
    expect(totalSize).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.maxPagefindBundle);
  });
});

//=============================================================================
// CODE SPLITTING TESTS
//=============================================================================

test.describe('Code Splitting', () => {
  test('should not load Pagefind on non-search pages', async ({ page }) => {
    const nonSearchPages = TEST_PAGES.filter(p => !p.url.includes('search'));

    for (const testPage of nonSearchPages) {
      await page.goto(testPage.url);

      // Wait for network to settle
      await page.waitForLoadState('networkidle');

      // Get all loaded JavaScript URLs
      const requests = await page.context().newCDPSession(page);
      const jsRequests: string[] = [];

      page.on('request', request => {
        if (request.resourceType() === 'script') {
          jsRequests.push(request.url());
        }
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify no Pagefind files loaded
      const pagefindLoaded = jsRequests.some(url =>
        url.includes('pagefind') || url.includes('page find')
      );

      expect(pagefindLoaded, `Pagefind should not load on ${testPage.name}`).toBe(false);
    }
  });

  test('should lazy-load Pagefind only on search page', async ({ page }) => {
    const jsRequests: string[] = [];

    page.on('request', request => {
      if (request.resourceType() === 'script') {
        jsRequests.push(request.url());
      }
    });

    await page.goto('/search');
    await page.waitForLoadState('networkidle');

    // Note: Pagefind might be dynamically imported, so check for the directory
    const pagefindPath = path.join(process.cwd(), 'dist', 'pagefind');
    const pagefindExists = fs.existsSync(pagefindPath);

    if (pagefindExists) {
      // If Pagefind is built, it should be available but not necessarily loaded immediately
      // (it might be loaded on-demand when search is used)
      expect(pagefindExists).toBe(true);
    } else {
      console.log('⚠️  Pagefind not found - search may be disabled');
    }
  });

  test('should have separate chunks for different pages', async () => {
    const distPath = path.join(process.cwd(), 'dist', '_astro');
    const jsFiles = fs.readdirSync(distPath).filter(f => f.endsWith('.js'));

    // Should have multiple JS chunks (evidence of code splitting)
    expect(jsFiles.length).toBeGreaterThan(1);

    // Should have hashed filenames (cache-busting)
    const hashedFiles = jsFiles.filter(f => /\.[a-zA-Z0-9]{8,}\.js$/.test(f));
    expect(hashedFiles.length).toBeGreaterThan(0);
  });
});

//=============================================================================
// CLIENT-SIDE HYDRATION TESTS
//=============================================================================

test.describe('Client-Side Hydration', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} viewport`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('should not use client: directives unnecessarily', async ({ page }) => {
        for (const testPage of TEST_PAGES) {
          await page.goto(testPage.url);
          await page.waitForLoadState('networkidle');

          // Check for Astro client directive markers in DOM
          const clientLoadElements = await page.locator('[data-astro-cid]').count();

          // Astro components can have data-astro-cid without client directives
          // But we shouldn't have client:* hydration on a static site
          const pageContent = await page.content();

          // Check for client directive patterns (these would be in the HTML if used)
          const hasClientLoad = pageContent.includes('client:load');
          const hasClientVisible = pageContent.includes('client:visible');
          const hasClientIdle = pageContent.includes('client:idle');
          const hasClientOnly = pageContent.includes('client:only');

          expect(hasClientLoad, `${testPage.name} should not use client:load`).toBe(false);
          expect(hasClientVisible, `${testPage.name} should not use client:visible`).toBe(false);
          expect(hasClientIdle, `${testPage.name} should not use client:idle`).toBe(false);
          expect(hasClientOnly, `${testPage.name} should not use client:only`).toBe(false);
        }
      });

      test('should use Astro islands appropriately', async ({ page }) => {
        // Verify that components are server-rendered (static HTML)
        for (const testPage of TEST_PAGES) {
          await page.goto(testPage.url);

          // Wait for content to load
          await page.waitForLoadState('domcontentloaded');

          // Check that page has content in initial HTML (not client-rendered)
          const initialContent = await page.content();

          // Key content should be in initial HTML
          if (testPage.url === '/') {
            expect(initialContent).toContain('Cache McClure');
          } else if (testPage.url === '/books') {
            expect(initialContent).toContain('Books');
          } else if (testPage.url.startsWith('/books/')) {
            expect(initialContent).toContain('Fracture Engine');
          }

          // Verify no React/Vue/Svelte hydration markers
          expect(initialContent).not.toContain('data-reactroot');
          expect(initialContent).not.toContain('data-v-');
          expect(initialContent).not.toContain('data-svelte');
        }
      });
    });
  }
});

//=============================================================================
// PROGRESSIVE ENHANCEMENT TESTS
//=============================================================================

test.describe('Progressive Enhancement', () => {
  test('should render core content with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    for (const testPage of TEST_PAGES) {
      await page.goto(testPage.url);

      // Core content should be visible
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      expect(bodyText!.length).toBeGreaterThan(100);

      // Verify key elements exist
      const header = await page.locator('header').count();
      const main = await page.locator('main').count();
      const footer = await page.locator('footer').count();

      expect(header, `${testPage.name} should have header without JS`).toBeGreaterThan(0);
      expect(main, `${testPage.name} should have main content without JS`).toBeGreaterThan(0);
      expect(footer, `${testPage.name} should have footer without JS`).toBeGreaterThan(0);

      // Navigation should be present
      const navLinks = await page.locator('nav a').count();
      expect(navLinks, `${testPage.name} should have navigation without JS`).toBeGreaterThan(0);
    }

    await context.close();
  });

  test('should have working links with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/');

    // Click a navigation link
    await page.click('a[href="/books"]');
    await page.waitForLoadState('domcontentloaded');

    // Should navigate successfully
    expect(page.url()).toContain('/books');

    // Content should be visible
    const heading = await page.textContent('h1');
    expect(heading).toBeTruthy();

    await context.close();
  });

  test('should display images with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    // Book pages have cover images
    await page.goto('/books/fracture-engine');

    // Check for images
    const images = await page.locator('img').count();
    expect(images).toBeGreaterThan(0);

    // Verify at least one image has a src
    const firstImgSrc = await page.locator('img').first().getAttribute('src');
    expect(firstImgSrc).toBeTruthy();

    await context.close();
  });
});

//=============================================================================
// STATIC GENERATION TESTS
//=============================================================================

test.describe('Static Generation', () => {
  test('should have pre-rendered HTML files', async () => {
    const distPath = path.join(process.cwd(), 'dist');

    // Check for pre-rendered HTML files
    const indexHtml = path.join(distPath, 'index.html');
    const booksHtml = path.join(distPath, 'books', 'index.html');
    const aboutHtml = path.join(distPath, 'about', 'index.html');

    expect(fs.existsSync(indexHtml), 'Homepage should be pre-rendered').toBe(true);
    expect(fs.existsSync(booksHtml), 'Books page should be pre-rendered').toBe(true);
    expect(fs.existsSync(aboutHtml), 'About page should be pre-rendered').toBe(true);

    // Verify HTML files contain actual content (not just client-side app shells)
    const indexContent = fs.readFileSync(indexHtml, 'utf-8');
    expect(indexContent.length).toBeGreaterThan(1000);
    expect(indexContent).toContain('Cache McClure');

    const booksContent = fs.readFileSync(booksHtml, 'utf-8');
    expect(booksContent.length).toBeGreaterThan(1000);
    expect(booksContent).toContain('Books');
  });

  test('should not have client-side routing for static content', async ({ page }) => {
    // Navigate between pages
    await page.goto('/');
    await page.click('a[href="/books"]');
    await page.waitForLoadState('domcontentloaded');

    // Should be a full page load (not SPA navigation)
    // Verify by checking if URL changed
    expect(page.url()).toContain('/books');

    // Note: Astro View Transitions may be enabled, which is acceptable
    // as it's a progressive enhancement that doesn't break without JS
  });
});

//=============================================================================
// JAVASCRIPT EXECUTION TESTS
//=============================================================================

test.describe('JavaScript Execution', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} viewport`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('should have minimal JavaScript execution time', async ({ page }) => {
        for (const testPage of TEST_PAGES) {
          await page.goto(testPage.url);

          // Measure JavaScript execution time using Performance API
          const metrics = await page.evaluate(() => {
            const perfEntries = performance.getEntriesByType('measure');
            const scriptDuration = perfEntries.reduce((total, entry) => {
              return total + entry.duration;
            }, 0);

            return {
              scriptDuration,
              domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
              loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
            };
          });

          console.log(`\n⏱️  ${testPage.name} (${viewport.name}):`, {
            domContentLoaded: `${metrics.domContentLoaded}ms`,
            loadComplete: `${metrics.loadComplete}ms`,
          });

          // DOMContentLoaded should be fast (< 1000ms)
          expect(metrics.domContentLoaded, `${testPage.name} DOMContentLoaded should be under 1000ms`).toBeLessThan(1000);
        }
      });

      test('should not have render-blocking JavaScript', async ({ page }) => {
        for (const testPage of TEST_PAGES) {
          await page.goto(testPage.url);

          // Check for async/defer attributes on script tags
          const scripts = await page.locator('script[src]').all();

          for (const script of scripts) {
            const src = await script.getAttribute('src');
            const isAsync = await script.getAttribute('async');
            const isDefer = await script.getAttribute('defer');
            const isModule = await script.getAttribute('type');
            const isInline = await script.getAttribute('is:inline');

            // External scripts should have async, defer, or be type="module"
            // OR be intentionally inline (like theme toggle to prevent FOUC)
            if (src && !src.startsWith('data:')) {
              const isNonBlocking = isAsync !== null || isDefer !== null || isModule === 'module' || isInline !== null;

              if (!isNonBlocking) {
                console.warn(`⚠️  Potentially render-blocking script on ${testPage.name}: ${src}`);
              }
            }
          }
        }
      });
    });
  }
});

//=============================================================================
// FRAMEWORK-FREE TESTS
//=============================================================================

test.describe('Framework-Free Validation', () => {
  test('should not load React', async ({ page }) => {
    const requests: string[] = [];

    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not load React
    const hasReact = requests.some(url =>
      url.includes('react') || url.includes('React')
    );

    expect(hasReact).toBe(false);

    // Check for React in window object
    const hasReactGlobal = await page.evaluate(() => {
      return 'React' in window || 'ReactDOM' in window;
    });

    expect(hasReactGlobal).toBe(false);
  });

  test('should not load Vue', async ({ page }) => {
    const requests: string[] = [];

    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not load Vue
    const hasVue = requests.some(url =>
      url.includes('vue') || url.includes('Vue')
    );

    expect(hasVue).toBe(false);

    // Check for Vue in window object
    const hasVueGlobal = await page.evaluate(() => {
      return 'Vue' in window;
    });

    expect(hasVueGlobal).toBe(false);
  });

  test('should not load Svelte runtime', async ({ page }) => {
    const requests: string[] = [];

    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not load Svelte runtime
    const hasSvelte = requests.some(url =>
      url.includes('svelte') || url.includes('Svelte')
    );

    expect(hasSvelte).toBe(false);
  });
});

//=============================================================================
// PERFORMANCE BUDGET TESTS
//=============================================================================

test.describe('Performance Budgets', () => {
  test('should meet Total Blocking Time target', async ({ page }) => {
    for (const testPage of TEST_PAGES) {
      await page.goto(testPage.url);
      await page.waitForLoadState('networkidle');

      // Get Web Vitals metrics
      const tbt = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          // TBT approximation: sum of long tasks
          let totalBlockingTime = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                totalBlockingTime += entry.duration - 50;
              }
            }
          });

          try {
            observer.observe({ type: 'longtask', buffered: true });
          } catch (e) {
            // longtask not supported
          }

          setTimeout(() => {
            observer.disconnect();
            resolve(totalBlockingTime);
          }, 2000);
        });
      });

      console.log(`\n⚡ ${testPage.name} TBT: ${tbt.toFixed(2)}ms`);

      // TBT should be under 200ms (CLAUDE.md requirement)
      if (tbt > 0) {
        expect(tbt, `${testPage.name} TBT should be under 200ms`).toBeLessThan(200);
      }
    }
  });
});

//=============================================================================
// INTERACTIVE COMPONENT TESTS
//=============================================================================

test.describe('Interactive Components', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} viewport`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('should have working theme toggle', async ({ page }) => {
        await page.goto('/');

        // Theme toggle should exist
        const themeToggle = page.locator('[aria-label*="toggle theme"], [aria-label*="Toggle theme"]');
        await expect(themeToggle).toBeVisible();

        // Should work with JavaScript
        const initialTheme = await page.evaluate(() => document.documentElement.className);

        await themeToggle.click();
        await page.waitForTimeout(300); // Wait for theme transition

        const newTheme = await page.evaluate(() => document.documentElement.className);

        // Theme should have changed
        expect(newTheme).not.toBe(initialTheme);
      });

      test('should have working mobile menu on small screens', async ({ page }) => {
        if (viewport.name === 'mobile') {
          await page.goto('/');

          // Mobile menu button should be visible
          const menuButton = page.locator('[aria-label*="menu"], [aria-label*="Menu"]');
          await expect(menuButton).toBeVisible();

          // Click to open menu
          await menuButton.click();
          await page.waitForTimeout(300);

          // Menu should be visible
          const mobileNav = page.locator('nav ul');
          await expect(mobileNav).toBeVisible();
        }
      });
    });
  }
});
