import { test, expect } from '@playwright/test';

/**
 * News Pages Responsive Design Tests
 * Tests news index and individual news post pages at all breakpoints
 */

test.describe('News Index - Mobile (< 640px)', () => {
  test('news list is readable on mobile', async ({ page }) => {
    await page.goto('/news');

    // Check for news cards/articles
    const newsItems = page.locator('article, [class*="news"]');
    const count = await newsItems.count();

    if (count > 0) {
      const firstItem = newsItems.first();
      await expect(firstItem).toBeVisible();

      // Should fit within viewport
      const box = await firstItem.boundingBox();
      const viewport = page.viewportSize();

      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
    }
  });

  test('news cards stack vertically on mobile', async ({ page }) => {
    await page.goto('/news');

    const newsList = page.locator('[class*="grid"], [class*="flex"]').first();

    if (await newsList.count() > 0) {
      const gridTemplateColumns = await newsList.evaluate((el) => {
        const display = window.getComputedStyle(el).display;
        if (display === 'grid') {
          return window.getComputedStyle(el).gridTemplateColumns;
        }
        return 'none';
      });

      if (gridTemplateColumns !== 'none') {
        const columns = gridTemplateColumns.split(' ').filter(c => c !== 'none').length;
        expect(columns).toBeLessThanOrEqual(1);
      }
    }
  });

  test('category badges are visible and readable', async ({ page }) => {
    await page.goto('/news');

    const badges = page.locator('[class*="badge"], [class*="category"], span[class*="text"]');
    const count = await badges.count();

    if (count > 0) {
      const firstBadge = badges.first();
      if (await firstBadge.isVisible()) {
        const fontSize = await firstBadge.evaluate((el) =>
          window.getComputedStyle(el).fontSize
        );

        const fontSizeValue = parseInt(fontSize);
        expect(fontSizeValue).toBeGreaterThanOrEqual(12); // Readable minimum
      }
    }
  });

  test('publish dates are formatted and visible', async ({ page }) => {
    await page.goto('/news');

    const dates = page.locator('time, [class*="date"]');
    const count = await dates.count();

    if (count > 0) {
      const firstDate = dates.first();
      if (await firstDate.isVisible()) {
        await expect(firstDate).toBeVisible();

        const text = await firstDate.textContent();
        expect(text).toBeTruthy();
        expect(text!.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('News Index - Tablet (640px - 1023px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('news grid shows 2 columns on tablet', async ({ page }) => {
    await page.goto('/news');

    const grid = page.locator('[class*="sm:grid-cols-2"]').first();

    if (await grid.count() > 0) {
      const gridTemplateColumns = await grid.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      const columns = gridTemplateColumns.split(' ').length;
      expect(columns).toBe(2);
    }
  });

  test('news cards have appropriate spacing', async ({ page }) => {
    await page.goto('/news');

    const grid = page.locator('[class*="grid"]').first();

    if (await grid.count() > 0) {
      const gap = await grid.evaluate((el) =>
        window.getComputedStyle(el).gap
      );

      const gapValue = parseInt(gap);
      expect(gapValue).toBeGreaterThanOrEqual(16);
    }
  });
});

test.describe('News Index - Desktop (≥ 1024px)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('news grid shows 3 columns on desktop', async ({ page }) => {
    await page.goto('/news');

    const grid = page.locator('[class*="lg:grid-cols-3"]').first();

    if (await grid.count() > 0) {
      const gridTemplateColumns = await grid.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      const columns = gridTemplateColumns.split(' ').length;
      expect(columns).toBe(3);
    }
  });

  test('news layout is balanced and centered', async ({ page }) => {
    await page.goto('/news');

    const main = page.locator('main');
    const box = await main.boundingBox();

    expect(box).toBeTruthy();

    // Should be centered
    const viewport = page.viewportSize();
    const leftMargin = box!.x;
    const rightMargin = viewport!.width - (box!.x + box!.width);

    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(5);
  });
});

test.describe('Individual News Post - Mobile', () => {
  test('navigates to first news post', async ({ page }) => {
    await page.goto('/news');

    const firstNewsLink = page.locator('article a, [class*="news"] a').first();
    if (await firstNewsLink.count() > 0) {
      await firstNewsLink.click();

      // Should navigate to news detail page
      await expect(page).toHaveURL(/\/news\/.+/);
    }
  });

  test('news post title is prominent and readable', async ({ page }) => {
    await page.goto('/news');

    const firstNewsLink = page.locator('article a, [class*="news"] a').first();
    if (await firstNewsLink.count() > 0) {
      await firstNewsLink.click();

      const title = page.locator('h1').first();
      await expect(title).toBeVisible();

      const fontSize = await title.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );

      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(24);
    }
  });

  test('news post content is readable without horizontal scroll', async ({ page }) => {
    await page.goto('/news');

    const firstNewsLink = page.locator('article a, [class*="news"] a').first();
    if (await firstNewsLink.count() > 0) {
      await firstNewsLink.click();

      await page.waitForLoadState('networkidle');

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()!.width;

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
    }
  });

  test('prose content has appropriate line length', async ({ page }) => {
    await page.goto('/news');

    const firstNewsLink = page.locator('article a, [class*="news"] a').first();
    if (await firstNewsLink.count() > 0) {
      await firstNewsLink.click();

      // Check for prose container
      const prose = page.locator('[class*="prose"], article').first();

      if (await prose.count() > 0) {
        const box = await prose.boundingBox();
        const viewport = page.viewportSize();

        // On mobile, prose should have padding
        expect(box!.width).toBeLessThan(viewport!.width);
      }
    }
  });

  test('images in news posts are responsive', async ({ page }) => {
    await page.goto('/news');

    const firstNewsLink = page.locator('article a, [class*="news"] a').first();
    if (await firstNewsLink.count() > 0) {
      await firstNewsLink.click();

      const images = page.locator('article img, [class*="prose"] img');
      const count = await images.count();

      if (count > 0) {
        const firstImage = images.first();
        const box = await firstImage.boundingBox();
        const viewport = page.viewportSize();

        // Images should not overflow
        expect(box!.width).toBeLessThanOrEqual(viewport!.width);
      }
    }
  });
});

test.describe('Individual News Post - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('prose content has optimal line length for readability', async ({ page }) => {
    await page.goto('/news');

    const firstNewsLink = page.locator('article a, [class*="news"] a').first();
    if (await firstNewsLink.count() > 0) {
      await firstNewsLink.click();

      const prose = page.locator('[class*="prose"], article').first();

      if (await prose.count() > 0) {
        const box = await prose.boundingBox();

        // Prose should be constrained for readability (typically 65ch or ~700px)
        expect(box!.width).toBeLessThan(900);
        expect(box!.width).toBeGreaterThan(400);
      }
    }
  });
});

test.describe('News - Filtering & Pagination', () => {
  test('category filters are accessible', async ({ page }) => {
    await page.goto('/news');

    // Check for category filters
    const filters = page.locator('a[href*="category"], button:has-text("Release"), button:has-text("Event")');
    const count = await filters.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(3, count); i++) {
        const filter = filters.nth(i);
        if (await filter.isVisible()) {
          const box = await filter.boundingBox();

          // Should be tappable on mobile
          expect(box!.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  test('pagination controls are visible and tappable', async ({ page }) => {
    await page.goto('/news');

    // Check for pagination
    const pagination = page.locator('[class*="pagination"], a:has-text("Next"), a:has-text("Previous")');
    const count = await pagination.count();

    if (count > 0) {
      const paginationLink = pagination.first();
      if (await paginationLink.isVisible()) {
        const box = await paginationLink.boundingBox();

        expect(box!.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('News - Back Navigation', () => {
  test('back to news link is accessible on all screen sizes', async ({ page }) => {
    await page.goto('/news');

    const firstNewsLink = page.locator('article a, [class*="news"] a').first();
    if (await firstNewsLink.count() > 0) {
      await firstNewsLink.click();

      // Look for back link
      const backLink = page.locator('a:has-text("Back"), a[href="/news"]');
      const count = await backLink.count();

      if (count > 0) {
        const link = backLink.first();
        if (await link.isVisible()) {
          await expect(link).toBeVisible();

          const box = await link.boundingBox();
          expect(box!.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });
});
