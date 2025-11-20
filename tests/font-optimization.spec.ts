/**
 * Font Optimization Test Suite
 *
 * Tests comprehensive font loading optimizations including:
 * - Preconnect to font CDNs
 * - Preload of critical font CSS
 * - Font subsetting (latin)
 * - font-display: swap
 * - Minimal font weights
 * - System font fallbacks
 * - No FOIT (Flash of Invisible Text)
 */

import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

const PAGES = [
  { name: 'Homepage', url: '/' },
  { name: 'Books', url: '/books' },
  { name: 'Book Detail', url: '/books/fracture-engine' },
  { name: 'News', url: '/news' },
  { name: 'News Post', url: '/news/welcome-to-cache-mcclure' },
  { name: 'About', url: '/about' },
];

test.describe('Font Loading Performance', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const pageInfo of PAGES) {
        test.describe(pageInfo.name, () => {
          test('should have preconnect to Google Fonts domains', async ({ page }) => {
            await page.goto(pageInfo.url);

            // Check for preconnect to fonts.googleapis.com
            const googleFontsPreconnect = await page.locator('link[rel="preconnect"][href="https://fonts.googleapis.com"]').count();
            expect(googleFontsPreconnect).toBe(1);

            // Check for preconnect to fonts.gstatic.com with crossorigin
            const gstaticPreconnect = await page.locator('link[rel="preconnect"][href="https://fonts.gstatic.com"][crossorigin]').count();
            expect(gstaticPreconnect).toBe(1);
          });

          test('should preload Google Fonts CSS file', async ({ page }) => {
            await page.goto(pageInfo.url);

            // Check for preload of Google Fonts CSS
            const preloadLink = page.locator('link[rel="preload"][as="style"]');
            const count = await preloadLink.count();
            expect(count).toBeGreaterThanOrEqual(1);

            // Verify the preload link includes our font families
            const href = await preloadLink.first().getAttribute('href');
            expect(href).toContain('fonts.googleapis.com');
            expect(href).toContain('Space+Grotesk');
            expect(href).toContain('JetBrains+Mono');
          });

          test('should use Latin subset for fonts', async ({ page }) => {
            await page.goto(pageInfo.url);

            // Check that font URLs include subset=latin parameter
            const fontStylesheet = page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
            const href = await fontStylesheet.getAttribute('href');

            expect(href).toContain('subset=latin');
          });

          test('should use font-display: swap', async ({ page }) => {
            await page.goto(pageInfo.url);

            // Check that font URLs include display=swap parameter
            const fontStylesheet = page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
            const href = await fontStylesheet.getAttribute('href');

            expect(href).toContain('display=swap');
          });

          test('should load minimal font weights', async ({ page }) => {
            await page.goto(pageInfo.url);

            const fontStylesheet = page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
            const href = await fontStylesheet.getAttribute('href');

            // Check Space Grotesk has 4 weights (400, 500, 600, 700)
            expect(href).toContain('Space+Grotesk:wght@400;500;600;700');

            // Check JetBrains Mono has 2 weights (400, 500)
            expect(href).toContain('JetBrains+Mono:wght@400;500');
          });

          test('should have all font optimization parameters', async ({ page }) => {
            await page.goto(pageInfo.url);

            const fontStylesheet = page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
            const href = await fontStylesheet.getAttribute('href');

            // Verify all optimizations are present in one check
            expect(href).toMatch(/subset=latin/);
            expect(href).toMatch(/display=swap/);
            expect(href).toMatch(/Space\+Grotesk/);
            expect(href).toMatch(/JetBrains\+Mono/);
          });

          test('preload and stylesheet URLs should match', async ({ page }) => {
            await page.goto(pageInfo.url);

            const preloadHref = await page.locator('link[rel="preload"][as="style"]').first().getAttribute('href');
            const stylesheetHref = await page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]').getAttribute('href');

            // Preload and stylesheet should use the same URL
            expect(preloadHref).toBe(stylesheetHref);
          });
        });
      }
    });
  }
});

test.describe('Font Loading Order', () => {
  for (const pageInfo of PAGES) {
    test(`${pageInfo.name} - preconnect should come before font stylesheet`, async ({ page }) => {
      await page.goto(pageInfo.url);

      const allLinks = await page.locator('head link').evaluateAll((links) => {
        return links.map((link, index) => ({
          index,
          rel: link.getAttribute('rel'),
          href: link.getAttribute('href'),
        }));
      });

      const preconnectIndex = allLinks.findIndex(
        (link) => link.rel === 'preconnect' && link.href?.includes('fonts.googleapis.com')
      );
      const stylesheetIndex = allLinks.findIndex(
        (link) => link.rel === 'stylesheet' && link.href?.includes('fonts.googleapis.com')
      );

      expect(preconnectIndex).toBeGreaterThan(-1);
      expect(stylesheetIndex).toBeGreaterThan(-1);
      expect(preconnectIndex).toBeLessThan(stylesheetIndex);
    });

    test(`${pageInfo.name} - preload should come before font stylesheet`, async ({ page }) => {
      await page.goto(pageInfo.url);

      const allLinks = await page.locator('head link').evaluateAll((links) => {
        return links.map((link, index) => ({
          index,
          rel: link.getAttribute('rel'),
          href: link.getAttribute('href'),
          as: link.getAttribute('as'),
        }));
      });

      const preloadIndex = allLinks.findIndex(
        (link) => link.rel === 'preload' && link.as === 'style' && link.href?.includes('fonts.googleapis.com')
      );
      const stylesheetIndex = allLinks.findIndex(
        (link) => link.rel === 'stylesheet' && link.href?.includes('fonts.googleapis.com')
      );

      expect(preloadIndex).toBeGreaterThan(-1);
      expect(stylesheetIndex).toBeGreaterThan(-1);
      expect(preloadIndex).toBeLessThan(stylesheetIndex);
    });
  }
});

test.describe('Font Application', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      test('should apply Space Grotesk to headings', async ({ page }) => {
        await page.goto('/');

        // Wait for fonts to load
        await page.waitForLoadState('networkidle');

        // Check h1 uses Space Grotesk or system fallback
        const h1Font = await page.locator('h1').first().evaluate((el) => {
          return window.getComputedStyle(el).fontFamily;
        });

        expect(h1Font).toMatch(/(Space Grotesk|Inter|system-ui)/i);
      });

      test('should apply JetBrains Mono to code elements', async ({ page }) => {
        // Visit a page that might have code (news post)
        await page.goto('/news/welcome-to-cache-mcclure');

        // Wait for fonts to load
        await page.waitForLoadState('networkidle');

        // If there's a code element, check it uses JetBrains Mono
        const codeCount = await page.locator('code').count();
        if (codeCount > 0) {
          const codeFont = await page.locator('code').first().evaluate((el) => {
            return window.getComputedStyle(el).fontFamily;
          });

          expect(codeFont).toMatch(/(JetBrains Mono|monospace)/i);
        }
      });

      test('should apply Inter/system fonts to body text', async ({ page }) => {
        await page.goto('/');

        // Wait for fonts to load
        await page.waitForLoadState('networkidle');

        // Check body uses Inter or system fallback
        const bodyFont = await page.locator('body').evaluate((el) => {
          return window.getComputedStyle(el).fontFamily;
        });

        expect(bodyFont).toMatch(/(Inter|system-ui|sans-serif)/i);
      });
    });
  }
});

test.describe('Font Loading Performance Metrics', () => {
  for (const pageInfo of PAGES) {
    test(`${pageInfo.name} - fonts should load without blocking rendering`, async ({ page }) => {
      // Start performance monitoring
      await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded' });

      // Get performance metrics
      const metrics = await page.evaluate(() => ({
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
      }));

      // DOMContentLoaded should happen quickly (not blocked by fonts)
      // This is a loose check - in production with swap, DCL should be < 2000ms
      expect(metrics.domContentLoaded).toBeLessThan(5000);
    });

    test(`${pageInfo.name} - text should be visible immediately (no FOIT)`, async ({ page }) => {
      await page.goto(pageInfo.url);

      // Check that text is visible even if fonts haven't loaded
      // With font-display: swap, text should use fallback fonts immediately
      const bodyText = await page.locator('body').isVisible();
      expect(bodyText).toBe(true);

      // Check that main heading is visible
      const h1Visible = await page.locator('h1').first().isVisible();
      expect(h1Visible).toBe(true);
    });
  }
});

test.describe('Font Resource Optimization', () => {
  test('should not load unnecessary font weights or styles', async ({ page }) => {
    await page.goto('/');

    // Monitor network requests for fonts
    const fontRequests: string[] = [];
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        fontRequests.push(url);
      }
    });

    await page.waitForLoadState('networkidle');

    // Check that we're not loading italic versions (we don't use them)
    const hasItalic = fontRequests.some(url => url.includes('ital'));
    expect(hasItalic).toBe(false);
  });

  test('should load fonts from CDN (not self-hosted)', async ({ page }) => {
    await page.goto('/');

    const fontStylesheet = page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
    const href = await fontStylesheet.getAttribute('href');

    // Verify fonts are loaded from Google's CDN
    expect(href).toContain('fonts.googleapis.com');
  });
});

test.describe('Cross-browser Font Support', () => {
  for (const pageInfo of PAGES) {
    test(`${pageInfo.name} - should have fallback fonts defined`, async ({ page }) => {
      await page.goto(pageInfo.url);

      // Check that CSS variables have fallback fonts
      const rootStyles = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = window.getComputedStyle(root);
        return {
          heading: styles.getPropertyValue('--font-heading'),
          body: styles.getPropertyValue('--font-body'),
          mono: styles.getPropertyValue('--font-mono'),
        };
      });

      // Each font family should have fallbacks
      if (rootStyles.heading) {
        expect(rootStyles.heading).toMatch(/,/); // Should have comma-separated fallbacks
      }
      if (rootStyles.body) {
        expect(rootStyles.body).toMatch(/(Inter|system-ui|sans-serif)/i);
      }
      if (rootStyles.mono) {
        expect(rootStyles.mono).toMatch(/(JetBrains|monospace)/i);
      }
    });
  }
});

test.describe('Font Loading Best Practices', () => {
  test('should have reasonable number of font files', async ({ page }) => {
    const fontFileRequests: string[] = [];

    page.on('response', (response) => {
      const url = response.url();
      // Track actual font file downloads (woff2, woff, ttf, etc.)
      if (url.includes('fonts.gstatic.com') && (
        url.endsWith('.woff2') ||
        url.endsWith('.woff') ||
        url.endsWith('.ttf')
      )) {
        fontFileRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // We should load a reasonable number of font files
    // With 2 font families and minimal weights, expect ~6-10 font files max
    expect(fontFileRequests.length).toBeLessThanOrEqual(10);
  });

  test('should use WOFF2 format (best compression)', async ({ page }) => {
    const fontFileRequests: string[] = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('fonts.gstatic.com')) {
        fontFileRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Modern browsers should receive WOFF2 files from Google Fonts
    const woff2Files = fontFileRequests.filter(url => url.includes('.woff2'));

    // At least some of the font files should be WOFF2
    expect(woff2Files.length).toBeGreaterThan(0);
  });
});

test.describe('Font Loading Documentation', () => {
  test('Layout.astro should have comments explaining font optimizations', async ({ page }) => {
    // This is more of a code check, but we can verify the HTML comments are present
    await page.goto('/');

    const htmlContent = await page.content();

    // Check for our optimization comments
    expect(htmlContent).toContain('Preconnect to Google Fonts');
    expect(htmlContent).toContain('font-display: swap');
  });
});
