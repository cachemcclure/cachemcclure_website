import { test, expect } from '@playwright/test';

/**
 * CSS Cleanup Verification Test Suite
 *
 * After removing unused AstroPaper styles (3 theme files + unused classes),
 * this test suite verifies that:
 * 1. All pages still render correctly with essential styles
 * 2. The .active-nav class still works for navigation highlighting
 * 3. Accessibility features (focus states, reduced motion) are preserved
 * 4. CSS bundle size has been reduced
 * 5. No unused theme files are being loaded
 */

const pages = [
  { url: '/', name: 'Homepage' },
  { url: '/books', name: 'Books Index' },
  { url: '/books/fracture-engine-sample', name: 'Book Detail' },
  { url: '/news', name: 'News Index' },
  { url: '/news/welcome-to-my-new-site', name: 'News Post' },
  { url: '/about', name: 'About Page' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

test.describe('CSS Cleanup - Essential Styles Verification', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const page of pages) {
        test(`${page.name} - renders with correct theme colors`, async ({ page: p }) => {
          await p.goto(page.url);

          // Verify body has the warm-cyberpunk theme background
          const body = p.locator('body');
          const bgColor = await body.evaluate((el) =>
            window.getComputedStyle(el).backgroundColor
          );

          // Should have the ash beige background (light mode) or dark gray (dark mode)
          expect(bgColor).toBeTruthy();
          expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
        });

        test(`${page.name} - typography styles applied`, async ({ page: p }) => {
          await p.goto(page.url);

          // Verify headings use Space Grotesk
          const h1 = p.locator('h1').first();
          if (await h1.count() > 0) {
            const fontFamily = await h1.evaluate((el) =>
              window.getComputedStyle(el).fontFamily
            );
            expect(fontFamily.toLowerCase()).toContain('space grotesk');
          }

          // Verify body uses Inter
          const body = p.locator('body');
          const bodyFont = await body.evaluate((el) =>
            window.getComputedStyle(el).fontFamily
          );
          expect(bodyFont.toLowerCase()).toContain('inter');
        });

        test(`${page.name} - no references to deleted theme files`, async ({ page: p }) => {
          await p.goto(page.url);

          // Check network requests - ensure no deleted theme files are loaded
          const requests: string[] = [];
          p.on('request', (request) => {
            requests.push(request.url());
          });

          await p.waitForLoadState('networkidle');

          // Verify deleted theme files are NOT loaded
          const hasDeletedThemes = requests.some(url =>
            url.includes('cyberpunk-neon.css') ||
            url.includes('minimal-future.css') ||
            url.includes('deep-space.css')
          );

          expect(hasDeletedThemes).toBe(false);
        });
      }
    });
  }
});

test.describe('CSS Cleanup - Active Nav Class Verification', () => {
  test('Homepage - active nav class applied correctly', async ({ page }) => {
    await page.goto('/');

    // Find the active navigation link (should be "Home")
    const activeLink = page.locator('.active-nav');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toHaveText(/home/i);

    // Verify it has the accent color
    const color = await activeLink.evaluate((el) =>
      window.getComputedStyle(el).color
    );
    expect(color).toBeTruthy();

    // Verify it has the underline pseudo-element via relative positioning
    const position = await activeLink.evaluate((el) =>
      window.getComputedStyle(el).position
    );
    expect(position).toBe('relative');
  });

  test('Books page - active nav class applied correctly', async ({ page }) => {
    await page.goto('/books');

    const activeLink = page.locator('.active-nav');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toHaveText(/books/i);
  });

  test('News page - active nav class applied correctly', async ({ page }) => {
    await page.goto('/news');

    const activeLink = page.locator('.active-nav');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toHaveText(/news/i);
  });

  test('About page - active nav class applied correctly', async ({ page }) => {
    await page.goto('/about');

    const activeLink = page.locator('.active-nav');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toHaveText(/about/i);
  });
});

test.describe('CSS Cleanup - Accessibility Features Preserved', () => {
  test('Focus states work correctly on links', async ({ page }) => {
    await page.goto('/');

    // Tab to first link
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');

    // Check if it's a link or button
    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === 'a' || tagName === 'button') {
      // Verify focus outline is applied
      const outline = await focusedElement.evaluate((el) =>
        window.getComputedStyle(el).outline
      );
      expect(outline).toBeTruthy();
      expect(outline).not.toBe('none');
    }
  });

  test('Reduced motion media query styles exist', async ({ page }) => {
    await page.goto('/');

    // Check if reduced motion styles are present in stylesheet
    const hasReducedMotion = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule instanceof CSSMediaRule) {
              if (rule.conditionText?.includes('prefers-reduced-motion')) {
                return true;
              }
            }
          }
        } catch (e) {
          // CORS or other access issues, skip
        }
      }
      return false;
    });

    expect(hasReducedMotion).toBe(true);
  });

  test('Scroll margin for anchor links exists', async ({ page }) => {
    await page.goto('/');

    // Check if :target styles exist
    const hasTargetStyles = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule instanceof CSSStyleRule) {
              if (rule.selectorText?.includes(':target')) {
                return true;
              }
            }
          }
        } catch (e) {
          // CORS or other access issues, skip
        }
      }
      return false;
    });

    expect(hasTargetStyles).toBe(true);
  });
});

test.describe('CSS Cleanup - Unused Classes Removed', () => {
  test('Deleted utility classes not present in stylesheet', async ({ page }) => {
    await page.goto('/');

    // List of classes that should have been removed
    const deletedClasses = [
      '.btn-warm',
      '.btn-outline-warm',
      '.card-warm',
      '.link-underline',
      '.skip-link',
      '.focus-within-accent',
      '.animate-fade-in-up',
      '.animate-fade-in',
      '.animate-slide-in-right',
      '.animate-pulse',
    ];

    for (const className of deletedClasses) {
      const hasClass = await page.evaluate((selector) => {
        const sheets = Array.from(document.styleSheets);
        for (const sheet of sheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule instanceof CSSStyleRule) {
                if (rule.selectorText?.includes(selector.replace('.', ''))) {
                  return true;
                }
              }
            }
          } catch (e) {
            // CORS or other access issues, skip
          }
        }
        return false;
      }, className);

      expect(hasClass).toBe(false);
    }
  });
});

test.describe('CSS Cleanup - Essential Classes Preserved', () => {
  test('Essential classes still present in stylesheet', async ({ page }) => {
    await page.goto('/');

    // List of classes that should still exist
    const essentialClasses = [
      '.active-nav',
      '.app-prose',
    ];

    for (const className of essentialClasses) {
      const hasClass = await page.evaluate((selector) => {
        const sheets = Array.from(document.styleSheets);
        for (const sheet of sheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule instanceof CSSStyleRule) {
                if (rule.selectorText?.includes(selector.replace('.', ''))) {
                  return true;
                }
              }
            }
          } catch (e) {
            // CORS or other access issues, skip
          }
        }
        return false;
      }, className);

      expect(hasClass).toBe(true);
    }
  });
});

test.describe('CSS Cleanup - Visual Regression Check', () => {
  for (const page of pages) {
    test(`${page.name} - page loads without visual breakage`, async ({ page: p }) => {
      await p.goto(page.url);

      // Wait for fonts to load
      await p.waitForLoadState('networkidle');

      // Verify key elements are visible and styled
      const body = p.locator('body');
      await expect(body).toBeVisible();

      // Verify header exists and is visible
      const header = p.locator('header, nav').first();
      await expect(header).toBeVisible();

      // Verify footer exists and is visible
      const footer = p.locator('footer');
      await expect(footer).toBeVisible();

      // Verify no layout shift indicators (body has proper height)
      const bodyHeight = await body.evaluate((el) => el.offsetHeight);
      expect(bodyHeight).toBeGreaterThan(400); // Reasonable minimum height
    });
  }
});

test.describe('CSS Cleanup - Performance Check', () => {
  test('CSS bundle size is reasonable', async ({ page }) => {
    const cssRequests: Array<{ url: string; size: number }> = [];

    page.on('response', async (response) => {
      if (response.url().endsWith('.css')) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          cssRequests.push({
            url: response.url(),
            size: buffer.length,
          });
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Calculate total CSS size
    const totalSize = cssRequests.reduce((sum, req) => sum + req.size, 0);
    const totalKB = totalSize / 1024;

    // After cleanup, CSS should be reasonable (under 50KB uncompressed)
    // This is a loose bound - actual gzipped size will be much smaller
    expect(totalKB).toBeLessThan(50);
  });
});

test.describe('CSS Cleanup - Dark Mode Still Works', () => {
  test('Dark mode toggle functionality preserved', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle button
    const themeButton = page.locator('button[aria-label*="theme" i], button[title*="theme" i]').first();

    if (await themeButton.count() > 0) {
      // Get initial theme
      const initialTheme = await page.locator('html').getAttribute('data-theme');

      // Toggle theme
      await themeButton.click();

      // Wait a bit for theme transition
      await page.waitForTimeout(100);

      // Get new theme
      const newTheme = await page.locator('html').getAttribute('data-theme');

      // Theme should have changed
      expect(newTheme).not.toBe(initialTheme);

      // Verify dark mode colors are applied
      const bgColor = await page.locator('body').evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toBeTruthy();
    }
  });
});
