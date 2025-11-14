import { test, expect } from '@playwright/test';

/**
 * Books Pages Responsive Design Tests
 * Tests books index and individual book pages at all breakpoints
 */

test.describe('Books Index - Mobile (< 640px)', () => {
  test('books grid shows single column on mobile', async ({ page }) => {
    await page.goto('/books');

    const grid = page.locator('[class*="grid"]').first();
    const gridTemplateColumns = await grid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    // Should be single column
    const columns = gridTemplateColumns.split(' ').filter(c => c !== 'none').length;
    expect(columns).toBeLessThanOrEqual(1);
  });

  test('book cards are readable and not cramped', async ({ page }) => {
    await page.goto('/books');

    const bookCards = page.locator('article, [class*="book"]');
    const count = await bookCards.count();

    if (count > 0) {
      const firstCard = bookCards.first();
      await expect(firstCard).toBeVisible();

      // Card should have adequate spacing
      const box = await firstCard.boundingBox();
      expect(box!.width).toBeGreaterThan(200);

      // Should not exceed viewport
      const viewport = page.viewportSize();
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
    }
  });

  test('book covers are appropriately sized for mobile', async ({ page }) => {
    await page.goto('/books');

    const covers = page.locator('img[alt*="cover"], img[src*="cover"]');
    const count = await covers.count();

    if (count > 0) {
      const firstCover = covers.first();
      const box = await firstCover.boundingBox();

      expect(box).toBeTruthy();

      // Mobile cover size should be h-48 w-32 (192px x 128px)
      expect(box!.height).toBeGreaterThanOrEqual(150);
      expect(box!.height).toBeLessThanOrEqual(250);
      expect(box!.width).toBeGreaterThanOrEqual(100);
      expect(box!.width).toBeLessThanOrEqual(180);
    }
  });

  test('book card layout is vertical (column) on mobile', async ({ page }) => {
    await page.goto('/books');

    const bookCard = page.locator('article, [class*="book"]').first();

    if (await bookCard.count() > 0) {
      const flexDirection = await bookCard.evaluate((el) =>
        window.getComputedStyle(el).flexDirection
      );

      expect(['column', 'column-reverse']).toContain(flexDirection);
    }
  });
});

test.describe('Books Index - Tablet (640px - 1023px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('books grid shows 2 columns on tablet', async ({ page }) => {
    await page.goto('/books');

    const grid = page.locator('[class*="sm:grid-cols-2"]').first();

    if (await grid.count() > 0) {
      const gridTemplateColumns = await grid.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      const columns = gridTemplateColumns.split(' ').length;
      expect(columns).toBe(2);
    }
  });

  test('book card layout switches to horizontal on tablet', async ({ page }) => {
    await page.goto('/books');

    const bookCard = page.locator('[class*="sm:flex-row"]').first();

    if (await bookCard.count() > 0) {
      const flexDirection = await bookCard.evaluate((el) =>
        window.getComputedStyle(el).flexDirection
      );

      expect(flexDirection).toBe('row');
    }
  });

  test('book covers scale up on tablet', async ({ page }) => {
    await page.goto('/books');

    const covers = page.locator('img[alt*="cover"], img[src*="cover"]');
    const count = await covers.count();

    if (count > 0) {
      const firstCover = covers.first();
      const box = await firstCover.boundingBox();

      // Tablet cover size should be sm:h-56 sm:w-40 (224px x 160px)
      expect(box!.height).toBeGreaterThanOrEqual(200);
      expect(box!.width).toBeGreaterThanOrEqual(140);
    }
  });
});

test.describe('Books Index - Desktop (≥ 1024px)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('books grid shows 3 columns on desktop', async ({ page }) => {
    await page.goto('/books');

    const grid = page.locator('[class*="lg:grid-cols-3"]').first();

    if (await grid.count() > 0) {
      const gridTemplateColumns = await grid.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      const columns = gridTemplateColumns.split(' ').length;
      expect(columns).toBe(3);
    }
  });

  test('grid has appropriate gap spacing', async ({ page }) => {
    await page.goto('/books');

    const grid = page.locator('[class*="grid"]').first();
    const gap = await grid.evaluate((el) =>
      window.getComputedStyle(el).gap
    );

    const gapValue = parseInt(gap);
    expect(gapValue).toBeGreaterThanOrEqual(16); // At least 1rem
  });
});

test.describe('Individual Book Page - Mobile', () => {
  test('navigates to first book page', async ({ page }) => {
    await page.goto('/books');

    // Click on first book
    const firstBookLink = page.locator('article a, [class*="book"] a').first();
    if (await firstBookLink.count() > 0) {
      await firstBookLink.click();

      // Should navigate to book detail page
      await expect(page).toHaveURL(/\/books\/.+/);
    }
  });

  test('book cover displays prominently on mobile', async ({ page }) => {
    // Go to books page first to find a book
    await page.goto('/books');

    const firstBookLink = page.locator('article a, [class*="book"] a').first();
    if (await firstBookLink.count() > 0) {
      await firstBookLink.click();

      // Check cover on detail page
      const cover = page.locator('img[alt*="cover"], img[src*="cover"]').first();
      await expect(cover).toBeVisible();

      const box = await cover.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(100);
    }
  });

  test('buy links are easily tappable on mobile', async ({ page }) => {
    await page.goto('/books');

    const firstBookLink = page.locator('article a, [class*="book"] a').first();
    if (await firstBookLink.count() > 0) {
      await firstBookLink.click();

      // Check buy links
      const buyLinks = page.locator('a[href*="amazon"], a[href*="barnes"], button:has-text("Buy")');
      const count = await buyLinks.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const link = buyLinks.nth(i);
          if (await link.isVisible()) {
            const box = await link.boundingBox();
            expect(box!.height).toBeGreaterThanOrEqual(40);
          }
        }
      }
    }
  });

  test('content is readable without horizontal scroll', async ({ page }) => {
    await page.goto('/books');

    const firstBookLink = page.locator('article a, [class*="book"] a').first();
    if (await firstBookLink.count() > 0) {
      await firstBookLink.click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()!.width;

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
    }
  });
});

test.describe('Individual Book Page - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('book detail layout is well-structured', async ({ page }) => {
    await page.goto('/books');

    const firstBookLink = page.locator('article a, [class*="book"] a').first();
    if (await firstBookLink.count() > 0) {
      await firstBookLink.click();

      // Check for main content sections
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Content should be constrained
      const box = await main.boundingBox();
      const viewport = page.viewportSize();

      expect(box!.width).toBeLessThan(viewport!.width);
    }
  });
});

test.describe('Books - Filter/Sort Functionality', () => {
  test('filter controls are accessible on all screen sizes', async ({ page }) => {
    await page.goto('/books');

    // Check for any filter/sort controls
    const filters = page.locator('select, button:has-text("Filter"), [role="combobox"]');
    const count = await filters.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const filter = filters.nth(i);
        if (await filter.isVisible()) {
          await expect(filter).toBeVisible();

          // Should be tappable on mobile
          const box = await filter.boundingBox();
          expect(box!.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });
});
