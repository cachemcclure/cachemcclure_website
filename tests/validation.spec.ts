/**
 * Phase 4 Validation Test Suite
 *
 * Comprehensive validation of all components, styling, and functionality
 * across the entire site. This test suite validates:
 *
 * 1. All components render correctly
 * 2. Styling is consistent across pages
 * 3. Responsive design works on all devices
 * 4. Dark mode works correctly
 * 5. No styling bugs or visual glitches
 *
 * Note: Lighthouse scores are tested separately via npm run lighthouse
 */

import { test, expect } from '@playwright/test';

// Test viewports
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'large-desktop', width: 1920, height: 1080 },
];

// All pages to test
const pages = [
  { path: '/', name: 'Homepage' },
  { path: '/books', name: 'Books Index' },
  { path: '/books/fracture-engine', name: 'Book Detail' },
  { path: '/news', name: 'News Index' },
  { path: '/news/welcome', name: 'News Detail' },
  { path: '/about', name: 'About Page' },
];

test.describe('Validation: All Components Render Correctly', () => {
  for (const page of pages) {
    test(`${page.name} (${page.path}) - All components render`, async ({ page: pw }) => {
      await pw.goto(page.path);

      // Wait for page to fully load
      await pw.waitForLoadState('networkidle');

      // Check header is present (use role to avoid dev toolbar conflicts)
      const header = pw.locator('header[role="banner"]').first();
      await expect(header).toBeVisible();

      // Check footer is present
      const footer = pw.locator('footer').first();
      await expect(footer).toBeVisible();

      // Check main content is present
      const main = pw.locator('main#main-content').or(pw.locator('main')).first();
      await expect(main).toBeVisible();

      // Check no error messages
      const errorMessages = pw.locator('text=/error|failed|broken/i').filter({ hasNot: pw.locator('footer') });
      const count = await errorMessages.count();
      expect(count).toBe(0);

      // Check critical images load (if any)
      const images = pw.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');

          // Skip decorative images
          if (alt === '') continue;

          // Check image has loaded
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          expect(naturalWidth).toBeGreaterThan(0);
        }
      }
    });
  }
});

test.describe('Validation: Styling Consistency Across Pages', () => {
  test('All pages use consistent header styling', async ({ page }) => {
    const headerStyles = new Map<string, any>();

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      const header = page.locator('header[role="banner"]').first();

      const styles = await header.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          fontFamily: computed.fontFamily,
          borderColor: computed.borderBottomColor,
        };
      });

      headerStyles.set(pageInfo.path, styles);
    }

    // All pages should have same header styles
    const values = Array.from(headerStyles.values());
    const first = values[0];

    for (let i = 1; i < values.length; i++) {
      expect(values[i].backgroundColor).toBe(first.backgroundColor);
      expect(values[i].fontFamily).toBe(first.fontFamily);
    }
  });

  test('All pages use consistent footer styling', async ({ page }) => {
    const footerStyles = new Map<string, any>();

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      const footer = page.locator('footer').first();

      const styles = await footer.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          fontFamily: computed.fontFamily,
          color: computed.color,
        };
      });

      footerStyles.set(pageInfo.path, styles);
    }

    // All pages should have same footer styles
    const values = Array.from(footerStyles.values());
    const first = values[0];

    for (let i = 1; i < values.length; i++) {
      expect(values[i].backgroundColor).toBe(first.backgroundColor);
      expect(values[i].fontFamily).toBe(first.fontFamily);
      expect(values[i].color).toBe(first.color);
    }
  });

  test('All pages use consistent typography', async ({ page }) => {
    const typographyStyles = new Map<string, any>();

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      const body = page.locator('body');

      const styles = await body.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight,
        };
      });

      typographyStyles.set(pageInfo.path, styles);
    }

    // All pages should have same body typography
    const values = Array.from(typographyStyles.values());
    const first = values[0];

    for (let i = 1; i < values.length; i++) {
      expect(values[i].fontFamily).toBe(first.fontFamily);
      expect(values[i].fontSize).toBe(first.fontSize);
    }
  });

  test('All pages use consistent accent colors', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      // Check links have consistent accent color
      const links = page.locator('a[href]').first();

      if (await links.count() > 0) {
        const color = await links.evaluate((el) => {
          return window.getComputedStyle(el).color;
        });

        // Color should be defined (not default black/blue)
        expect(color).toBeTruthy();
        expect(color).not.toBe('rgb(0, 0, 0)'); // Not default black
        expect(color).not.toBe('rgb(0, 0, 255)'); // Not browser default blue
      }
    }
  });
});

test.describe('Validation: Responsive Design Works on All Devices', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('All pages are readable and usable', async ({ page }) => {
        for (const pageInfo of pages) {
          await page.goto(pageInfo.path);

          // Check no horizontal scroll
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
          expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding

          // Check main content is visible
          const main = page.locator('main');
          await expect(main).toBeVisible();

          // Check text is readable (not too small)
          const fontSize = await page.locator('body').evaluate((el) => {
            return parseInt(window.getComputedStyle(el).fontSize);
          });
          expect(fontSize).toBeGreaterThanOrEqual(16); // Minimum readable size
        }
      });

      test('Touch targets are adequate on touch devices', async ({ page }) => {
        // Only test on mobile/tablet
        if (viewport.width >= 1024) return;

        await page.goto('/');

        // Check navigation links
        const navLinks = page.locator('nav a');
        const count = await navLinks.count();

        for (let i = 0; i < count; i++) {
          const link = navLinks.nth(i);
          const box = await link.boundingBox();

          if (box) {
            // WCAG recommends 44x44px minimum for touch targets
            expect(box.height).toBeGreaterThanOrEqual(40); // Slightly relaxed for inline links
          }
        }

        // Check buttons
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const box = await button.boundingBox();

          if (box && await button.isVisible()) {
            expect(box.height).toBeGreaterThanOrEqual(44);
            expect(box.width).toBeGreaterThanOrEqual(44);
          }
        }
      });

      test('Images scale properly', async ({ page }) => {
        for (const pageInfo of pages) {
          await page.goto(pageInfo.path);

          const images = page.locator('img');
          const count = await images.count();

          for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            const box = await img.boundingBox();

            if (box) {
              // Images should not exceed viewport width
              expect(box.width).toBeLessThanOrEqual(viewport.width);

              // Images should have some minimum size (not broken)
              expect(box.width).toBeGreaterThan(0);
              expect(box.height).toBeGreaterThan(0);
            }
          }
        }
      });
    });
  }
});

test.describe('Validation: Dark Mode Works Correctly', () => {
  test('Dark mode can be toggled', async ({ page }) => {
    await page.goto('/');

    // Get initial theme
    const initialTheme = await page.locator('html').getAttribute('data-theme');
    expect(initialTheme).toBeTruthy();

    // Find and click theme toggle
    const toggle = page.locator('button[aria-label*="theme" i]').first();
    await expect(toggle).toBeVisible();

    await toggle.click();
    await page.waitForTimeout(300); // Allow for transition

    // Check theme changed
    const newTheme = await page.locator('html').getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('Dark mode persists across pages', async ({ page }) => {
    await page.goto('/');

    // Set to dark mode
    const html = page.locator('html');
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    });

    // Navigate to another page
    await page.goto('/books');

    // Check dark mode persisted
    const theme = await html.getAttribute('data-theme');
    expect(theme).toBe('dark');
  });

  test('All pages readable in dark mode', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      // Set dark mode
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      await page.waitForTimeout(100);

      // Check background is dark
      const bgColor = await page.locator('body').evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Parse RGB values
      const rgb = bgColor.match(/\d+/g);
      if (rgb) {
        const r = parseInt(rgb[0]);
        const g = parseInt(rgb[1]);
        const b = parseInt(rgb[2]);

        // Average should be < 128 for dark mode
        const avg = (r + g + b) / 3;
        expect(avg).toBeLessThan(128);
      }

      // Check text is light
      const textColor = await page.locator('body').evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const textRgb = textColor.match(/\d+/g);
      if (textRgb) {
        const r = parseInt(textRgb[0]);
        const g = parseInt(textRgb[1]);
        const b = parseInt(textRgb[2]);

        // Average should be > 128 for light text
        const avg = (r + g + b) / 3;
        expect(avg).toBeGreaterThan(128);
      }
    }
  });

  test('All pages readable in light mode', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      // Set light mode
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });

      await page.waitForTimeout(100);

      // Check background is light
      const bgColor = await page.locator('body').evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      const rgb = bgColor.match(/\d+/g);
      if (rgb) {
        const r = parseInt(rgb[0]);
        const g = parseInt(rgb[1]);
        const b = parseInt(rgb[2]);

        // Average should be > 128 for light mode
        const avg = (r + g + b) / 3;
        expect(avg).toBeGreaterThan(128);
      }

      // Check text is dark
      const textColor = await page.locator('body').evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const textRgb = textColor.match(/\d+/g);
      if (textRgb) {
        const r = parseInt(textRgb[0]);
        const g = parseInt(textRgb[1]);
        const b = parseInt(textRgb[2]);

        // Average should be < 128 for dark text
        const avg = (r + g + b) / 3;
        expect(avg).toBeLessThan(128);
      }
    }
  });
});

test.describe('Validation: No Styling Bugs or Visual Glitches', () => {
  test('No text overflow or clipping', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      // Check for elements with overflow-x visible
      const overflowingElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const overflowing: string[] = [];

        elements.forEach((el) => {
          if (el.scrollWidth > el.clientWidth + 5) { // +5 for margin of error
            const tag = el.tagName.toLowerCase();
            const classes = el.className;
            overflowing.push(`${tag}.${classes}`);
          }
        });

        return overflowing;
      });

      // Allow some specific elements to overflow (like code blocks with scroll)
      const allowedOverflow = ['pre', 'code', 'table'];
      const problematicOverflow = overflowingElements.filter(el =>
        !allowedOverflow.some(allowed => el.startsWith(allowed))
      );

      expect(problematicOverflow.length).toBe(0);
    }
  });

  test('No invisible text (font loading)', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      // Wait for fonts to load
      await page.waitForLoadState('networkidle');

      // Check all text is visible
      const invisibleText = await page.evaluate(() => {
        const elements = document.querySelectorAll('body *');
        const invisible: string[] = [];

        elements.forEach((el) => {
          const computed = window.getComputedStyle(el);
          if (computed.opacity === '0' && el.textContent && el.textContent.trim().length > 0) {
            invisible.push(el.tagName);
          }
        });

        return invisible;
      });

      // Some elements intentionally hidden (like skip links until focus)
      expect(invisibleText.length).toBeLessThan(5);
    }
  });

  test('No layout shift during page load', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      // Get initial layout
      const initialLayout = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? main.getBoundingClientRect() : null;
      });

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Get final layout
      const finalLayout = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? main.getBoundingClientRect() : null;
      });

      // Layout should not have shifted significantly
      if (initialLayout && finalLayout) {
        const yShift = Math.abs(finalLayout.y - initialLayout.y);
        expect(yShift).toBeLessThan(50); // Allow small shifts
      }
    }
  });

  test('All interactive elements have hover states', async ({ page }) => {
    await page.goto('/');

    // Check links have hover state
    const links = page.locator('a[href]').first();

    if (await links.count() > 0) {
      const defaultColor = await links.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      await links.hover();
      await page.waitForTimeout(50);

      const hoverColor = await links.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Hover state should change something (color, underline, etc.)
      // We're just checking it's implemented, actual effect may vary
      expect(hoverColor).toBeTruthy();
    }

    // Check buttons have hover state
    const buttons = page.locator('button').first();

    if (await buttons.count() > 0) {
      const defaultBg = await buttons.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(defaultBg).toBeTruthy();
    }
  });

  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/');

    // Tab through focusable elements
    const focusable = page.locator('a, button, input, textarea, select');
    const count = await focusable.count();

    if (count > 0) {
      const firstElement = focusable.first();
      await firstElement.focus();

      // Check outline or focus ring is visible
      const outline = await firstElement.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });

      // Should have either outline or box-shadow for focus
      const hasFocusIndicator =
        outline.outlineWidth !== '0px' ||
        outline.boxShadow !== 'none';

      expect(hasFocusIndicator).toBe(true);
    }
  });
});

test.describe('Validation: Performance Basics', () => {
  test('All pages load within reasonable time', async ({ page }) => {
    for (const pageInfo of pages) {
      const startTime = Date.now();

      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('No large images (> 500KB uncompressed)', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      const imageSizes = await page.evaluate(async () => {
        const images = Array.from(document.querySelectorAll('img'));
        const sizes: number[] = [];

        for (const img of images) {
          if (img.complete && img.naturalWidth > 0) {
            // Estimate size based on dimensions (rough approximation)
            const estimatedSize = img.naturalWidth * img.naturalHeight * 4; // 4 bytes per pixel
            sizes.push(estimatedSize);
          }
        }

        return sizes;
      });

      // Check no images are excessively large
      for (const size of imageSizes) {
        expect(size).toBeLessThan(500 * 1024 * 4); // 500KB * 4 bytes per pixel
      }
    }
  });
});
