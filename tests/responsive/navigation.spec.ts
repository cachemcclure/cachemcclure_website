import { test, expect } from '@playwright/test';

/**
 * Navigation Responsive Design Tests
 * Tests header navigation behavior across all viewport sizes
 */

test.describe('Navigation - Mobile (< 640px)', () => {
  test('shows hamburger menu button on mobile', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('#menu-btn');
    await expect(menuBtn).toBeVisible();

    // Verify menu items are hidden initially
    const menuItems = page.locator('#menu-items');
    await expect(menuItems).toBeHidden();
  });

  test('hamburger menu toggles open and closed', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('#menu-btn');
    const menuItems = page.locator('#menu-items');

    // Initially hidden
    await expect(menuItems).toBeHidden();

    // Click to open
    await menuBtn.click();
    await expect(menuItems).toBeVisible();

    // Click to close
    await menuBtn.click();
    await expect(menuItems).toBeHidden();
  });

  test('menu button has adequate touch target size (44x44px minimum)', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('#menu-btn');
    const box = await menuBtn.boundingBox();

    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('navigation links are vertically stacked on mobile', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('#menu-btn');
    await menuBtn.click();

    const menuItems = page.locator('#menu-items');
    const flexDirection = await menuItems.evaluate((el) =>
      window.getComputedStyle(el).flexDirection
    );

    expect(flexDirection).toBe('column');
  });

  test('all navigation links are accessible in mobile menu', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('#menu-btn');
    await menuBtn.click();

    // Check for main navigation links
    await expect(page.locator('#menu-items a:has-text("Books")')).toBeVisible();
    await expect(page.locator('#menu-items a:has-text("News")')).toBeVisible();
    await expect(page.locator('#menu-items a:has-text("About")')).toBeVisible();
  });
});

test.describe('Navigation - Tablet & Desktop (≥ 640px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('hides hamburger menu on tablet/desktop', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('#menu-btn');
    await expect(menuBtn).toBeHidden();
  });

  test('shows full navigation menu inline', async ({ page }) => {
    await page.goto('/');

    const menuItems = page.locator('#menu-items');
    await expect(menuItems).toBeVisible();

    // Check that items are displayed horizontally
    const flexDirection = await menuItems.evaluate((el) =>
      window.getComputedStyle(el).flexDirection
    );

    expect(flexDirection).toBe('row');
  });

  test('navigation items have proper spacing', async ({ page }) => {
    await page.goto('/');

    const navLinks = page.locator('#menu-items > li');
    const count = await navLinks.count();

    expect(count).toBeGreaterThan(0);

    // Check that links have gap between them
    const menuItems = page.locator('#menu-items');
    const gap = await menuItems.evaluate((el) =>
      window.getComputedStyle(el).gap
    );

    expect(gap).not.toBe('0px');
  });
});

test.describe('Navigation - Cross-Page Consistency', () => {
  const pages = ['/', '/books', '/news', '/about'];

  for (const pagePath of pages) {
    test(`navigation works correctly on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);

      // On mobile, check hamburger exists
      if (page.viewportSize()!.width < 640) {
        const menuBtn = page.locator('#menu-btn');
        await expect(menuBtn).toBeVisible();
      } else {
        // On desktop, check full menu is visible
        const menuItems = page.locator('#menu-items');
        await expect(menuItems).toBeVisible();
      }
    });
  }
});

test.describe('Navigation - Accessibility', () => {
  test('logo link is accessible and functional', async ({ page }) => {
    await page.goto('/books');

    const logoLink = page.locator('header a[href="/"]').first();
    await expect(logoLink).toBeVisible();

    // Verify it navigates to homepage
    await logoLink.click();
    await expect(page).toHaveURL('/');
  });

  test('current page is indicated in navigation', async ({ page }) => {
    await page.goto('/books');

    const menuBtn = page.locator('#menu-btn');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
    }

    // Check if Books link has aria-current or special styling
    const booksLink = page.locator('#menu-items a[href="/books"]');
    const ariaCurrent = await booksLink.getAttribute('aria-current');

    expect(ariaCurrent).toBeTruthy();
  });

  test('navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to activate hamburger with Enter/Space on mobile
    const menuBtn = page.locator('#menu-btn');
    if (await menuBtn.isVisible()) {
      await menuBtn.focus();
      await page.keyboard.press('Enter');

      const menuItems = page.locator('#menu-items');
      await expect(menuItems).toBeVisible();
    }
  });
});
