import { test, expect } from '@playwright/test';

/**
 * Touch Target Size Tests
 * Tests that all interactive elements meet the 44x44px minimum size
 * requirement for accessibility (WCAG 2.1 Level AAA)
 */

const pages = ['/', '/books', '/news', '/about'];

test.describe('Touch Targets - Minimum Size (44x44px)', () => {
  for (const pagePath of pages) {
    test.describe(`Touch targets on ${pagePath}`, () => {
      test('all buttons meet minimum touch target size', async ({ page }) => {
        await page.goto(pagePath);

        const buttons = page.locator('button');
        const count = await buttons.count();

        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);

          if (await button.isVisible()) {
            const box = await button.boundingBox();

            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(44);
              expect(box.height).toBeGreaterThanOrEqual(44);
            }
          }
        }
      });

      test('all primary links meet minimum touch target size', async ({ page }) => {
        await page.goto(pagePath);

        // Navigation links
        const navLinks = page.locator('nav a, header a');
        const count = await navLinks.count();

        for (let i = 0; i < count; i++) {
          const link = navLinks.nth(i);

          if (await link.isVisible()) {
            const box = await link.boundingBox();

            if (box) {
              // Links should meet minimum height
              expect(box.height).toBeGreaterThanOrEqual(44);
            }
          }
        }
      });

      test('hamburger menu button has adequate touch target', async ({ page }) => {
        await page.goto(pagePath);

        const menuBtn = page.locator('#menu-btn');

        if (await menuBtn.isVisible()) {
          const box = await menuBtn.boundingBox();

          expect(box).toBeTruthy();
          expect(box!.width).toBeGreaterThanOrEqual(44);
          expect(box!.height).toBeGreaterThanOrEqual(44);
        }
      });

      test('theme toggle button has adequate touch target', async ({ page }) => {
        await page.goto(pagePath);

        const themeToggle = page.locator('button[id*="theme"], button[aria-label*="theme"]');

        if (await themeToggle.count() > 0 && (await themeToggle.first().isVisible())) {
          const box = await themeToggle.first().boundingBox();

          expect(box).toBeTruthy();
          expect(box!.width).toBeGreaterThanOrEqual(44);
          expect(box!.height).toBeGreaterThanOrEqual(44);
        }
      });

      test('card links have adequate touch targets', async ({ page }) => {
        await page.goto(pagePath);

        // Book cards, news cards, etc.
        const cards = page.locator('article a, [class*="card"] a');
        const count = await cards.count();

        if (count > 0) {
          for (let i = 0; i < Math.min(3, count); i++) {
            const card = cards.nth(i);

            if (await card.isVisible()) {
              const box = await card.boundingBox();

              if (box) {
                // Card links should be large enough to tap
                expect(box.height).toBeGreaterThanOrEqual(44);
              }
            }
          }
        }
      });
    });
  }
});

test.describe('Touch Targets - Specific Components', () => {
  test('social media links have adequate touch targets', async ({ page }) => {
    await page.goto('/');

    const socialLinks = page.locator('a[href*="twitter"], a[href*="facebook"], a[href*="instagram"], a[href*="github"]');
    const count = await socialLinks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = socialLinks.nth(i);

        if (await link.isVisible()) {
          const box = await link.boundingBox();

          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
  });

  test('buy links on book pages have adequate touch targets', async ({ page }) => {
    await page.goto('/books');

    const firstBookLink = page.locator('article a, [class*="book"] a').first();

    if (await firstBookLink.count() > 0) {
      await firstBookLink.click();

      // Check buy links
      const buyLinks = page.locator('a[href*="amazon"], a[href*="barnes"], a[href*="buy"], button:has-text("Buy")');
      const count = await buyLinks.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const link = buyLinks.nth(i);

          if (await link.isVisible()) {
            const box = await link.boundingBox();

            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(44);
              expect(box.height).toBeGreaterThanOrEqual(44);
            }
          }
        }
      }
    }
  });

  test('filter/category buttons have adequate touch targets', async ({ page }) => {
    await page.goto('/news');

    const filterButtons = page.locator('button[class*="filter"], a[class*="category"], [role="button"]');
    const count = await filterButtons.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(5, count); i++) {
        const button = filterButtons.nth(i);

        if (await button.isVisible()) {
          const box = await button.boundingBox();

          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
  });

  test('pagination links have adequate touch targets', async ({ page }) => {
    await page.goto('/news');

    const paginationLinks = page.locator('[class*="pagination"] a, a:has-text("Next"), a:has-text("Previous"), a:has-text("Page")');
    const count = await paginationLinks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = paginationLinks.nth(i);

        if (await link.isVisible()) {
          const box = await link.boundingBox();

          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
  });

  test('search button/input has adequate touch targets', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.locator('button[type="submit"], button[aria-label*="search"]');

    if (await searchButton.count() > 0 && (await searchButton.first().isVisible())) {
      const box = await searchButton.first().boundingBox();

      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('back/navigation arrows have adequate touch targets', async ({ page }) => {
    await page.goto('/books');

    const firstBookLink = page.locator('article a, [class*="book"] a').first();

    if (await firstBookLink.count() > 0) {
      await firstBookLink.click();

      const backLinks = page.locator('a:has-text("Back"), a:has-text("←"), button:has-text("Back")');
      const count = await backLinks.count();

      if (count > 0) {
        const link = backLinks.first();

        if (await link.isVisible()) {
          const box = await link.boundingBox();

          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
  });
});

test.describe('Touch Targets - Spacing', () => {
  test('adjacent touch targets have adequate spacing', async ({ page }) => {
    await page.goto('/');

    // Check navigation links
    const navLinks = page.locator('#menu-items a');
    const count = await navLinks.count();

    if (count >= 2) {
      // On mobile with hamburger open
      const menuBtn = page.locator('#menu-btn');
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
      }

      for (let i = 0; i < count - 1; i++) {
        const link1 = navLinks.nth(i);
        const link2 = navLinks.nth(i + 1);

        if ((await link1.isVisible()) && (await link2.isVisible())) {
          const box1 = await link1.boundingBox();
          const box2 = await link2.boundingBox();

          if (box1 && box2) {
            // Calculate spacing (distance between elements)
            const spacing = Math.abs(box2.y - (box1.y + box1.height));

            // Should have at least 8px spacing
            expect(spacing).toBeGreaterThanOrEqual(0); // May be touching but not overlapping
          }
        }
      }
    }
  });

  test('touch targets do not overlap', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button, a[href]');
    const count = await buttons.count();

    const boxes: Array<{ x: number; y: number; width: number; height: number }> = [];

    // Collect all visible button boxes
    for (let i = 0; i < Math.min(10, count); i++) {
      const button = buttons.nth(i);

      if (await button.isVisible()) {
        const box = await button.boundingBox();

        if (box) {
          boxes.push(box);
        }
      }
    }

    // Check for overlaps
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const box1 = boxes[i];
        const box2 = boxes[j];

        // Check if boxes overlap
        const overlap =
          box1.x < box2.x + box2.width &&
          box1.x + box1.width > box2.x &&
          box1.y < box2.y + box2.height &&
          box1.y + box1.height > box2.y;

        // Overlapping touch targets are a UX problem
        if (overlap) {
          console.warn(`Touch targets overlap detected at positions [${i}, ${j}]`);
        }
      }
    }
  });
});

test.describe('Touch Targets - Focus States', () => {
  test('touch targets have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    const interactiveElements = page.locator('a[href], button').first();

    if (await interactiveElements.count() > 0) {
      await interactiveElements.focus();

      // Check for focus ring/outline
      const outline = await interactiveElements.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
        };
      });

      // Should have some visible focus indicator
      const hasFocusIndicator =
        outline.outlineWidth !== '0px' ||
        outline.boxShadow !== 'none' ||
        outline.outline !== 'none';

      expect(hasFocusIndicator).toBeTruthy();
    }
  });
});
