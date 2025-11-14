import { test, expect } from '@playwright/test';

/**
 * Homepage Responsive Design Tests
 * Tests homepage layout and content at all breakpoints
 */

test.describe('Homepage - Mobile (< 640px)', () => {
  test('hero section displays correctly on mobile', async ({ page }) => {
    await page.goto('/');

    // Check hero heading is visible
    const heading = page.locator('h1:has-text("Cache McClure")');
    await expect(heading).toBeVisible();

    // Verify responsive text size
    const fontSize = await heading.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );
    const fontSizeValue = parseInt(fontSize);

    // Mobile should use text-4xl (2.25rem = 36px)
    expect(fontSizeValue).toBeGreaterThanOrEqual(32);
    expect(fontSizeValue).toBeLessThanOrEqual(40);
  });

  test('social links stack vertically on mobile', async ({ page }) => {
    await page.goto('/');

    const socialSection = page.locator('.social-links, [class*="flex"][class*="col"]').first();

    if (await socialSection.count() > 0) {
      const flexDirection = await socialSection.evaluate((el) =>
        window.getComputedStyle(el).flexDirection
      );

      expect(['column', 'column-reverse']).toContain(flexDirection);
    }
  });

  test('content sections are full width on mobile', async ({ page }) => {
    await page.goto('/');

    const mainContent = page.locator('main');
    const padding = await mainContent.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseInt(style.paddingLeft),
        right: parseInt(style.paddingRight),
      };
    });

    // Should have some padding but not excessive
    expect(padding.left).toBeGreaterThan(0);
    expect(padding.right).toBeGreaterThan(0);
    expect(padding.left).toBeLessThanOrEqual(32);
  });

  test('featured book section is readable on mobile', async ({ page }) => {
    await page.goto('/');

    // Check if there's a featured book section
    const bookSection = page.locator('[class*="book"], article').first();

    if (await bookSection.count() > 0) {
      await expect(bookSection).toBeVisible();

      // Verify it's not cut off
      const box = await bookSection.boundingBox();
      expect(box).toBeTruthy();

      const viewport = page.viewportSize();
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
    }
  });
});

test.describe('Homepage - Tablet (640px - 1023px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('hero heading scales up on tablet', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h1:has-text("Cache McClure")');
    const fontSize = await heading.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );
    const fontSizeValue = parseInt(fontSize);

    // Tablet should use sm:text-6xl (3.75rem = 60px)
    expect(fontSizeValue).toBeGreaterThanOrEqual(56);
    expect(fontSizeValue).toBeLessThanOrEqual(64);
  });

  test('social links display horizontally on tablet', async ({ page }) => {
    await page.goto('/');

    const socialSection = page.locator('.social-links, [class*="sm:flex-row"]').first();

    if (await socialSection.count() > 0) {
      const flexDirection = await socialSection.evaluate((el) =>
        window.getComputedStyle(el).flexDirection
      );

      expect(flexDirection).toBe('row');
    }
  });

  test('news grid shows 2 columns on tablet', async ({ page }) => {
    await page.goto('/');

    // Look for news section grid
    const newsGrid = page.locator('[class*="grid"][class*="sm:grid-cols-2"]').first();

    if (await newsGrid.count() > 0) {
      const gridTemplateColumns = await newsGrid.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 2 columns
      const columns = gridTemplateColumns.split(' ').length;
      expect(columns).toBe(2);
    }
  });
});

test.describe('Homepage - Desktop (≥ 1024px)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('news grid shows 3 columns on desktop', async ({ page }) => {
    await page.goto('/');

    const newsGrid = page.locator('[class*="lg:grid-cols-3"]').first();

    if (await newsGrid.count() > 0) {
      const gridTemplateColumns = await newsGrid.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 3 columns
      const columns = gridTemplateColumns.split(' ').length;
      expect(columns).toBe(3);
    }
  });

  test('content respects max-width constraint', async ({ page }) => {
    await page.goto('/');

    const container = page.locator('[class*="max-w"]').first();
    const box = await container.boundingBox();

    expect(box).toBeTruthy();

    // Max width should be constrained (not full viewport width)
    const viewport = page.viewportSize();
    expect(box!.width).toBeLessThan(viewport!.width);

    // Should be centered with margin auto
    const marginLeft = await container.evaluate((el) =>
      window.getComputedStyle(el).marginLeft
    );
    expect(marginLeft).toBe('auto');
  });

  test('layout is balanced and centered', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('main');
    const box = await main.boundingBox();

    expect(box).toBeTruthy();

    // Content should be centered with equal margins
    const viewport = page.viewportSize();
    const leftMargin = box!.x;
    const rightMargin = viewport!.width - (box!.x + box!.width);

    // Margins should be roughly equal (within 5px tolerance)
    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(5);
  });
});

test.describe('Homepage - All Breakpoints', () => {
  test('page loads without horizontal scroll', async ({ page }) => {
    await page.goto('/');

    // Check that body width doesn't exceed viewport
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('all interactive elements are accessible', async ({ page }) => {
    await page.goto('/');

    // Check for any buttons or links
    const buttons = page.locator('button, a[href]');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);

    // Verify first few are visible
    for (let i = 0; i < Math.min(3, count); i++) {
      const isVisible = await buttons.nth(i).isVisible();
      if (isVisible) {
        const box = await buttons.nth(i).boundingBox();
        expect(box).toBeTruthy();
      }
    }
  });

  test('images load and are properly sized', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      // Check first image
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();

      // Verify image doesn't overflow viewport
      const box = await firstImage.boundingBox();
      const viewport = page.viewportSize();

      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
    }
  });
});
