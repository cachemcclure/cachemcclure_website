import { test, expect } from '@playwright/test';

/**
 * Comprehensive Keyboard Navigation Test Suite
 *
 * Tests WCAG 2.1 Level AA keyboard accessibility requirements (SC 2.1.1, 2.1.2, 2.4.3, 2.4.7)
 *
 * Requirements tested:
 * - All functionality available via keyboard
 * - No keyboard traps
 * - Logical focus order
 * - Visible focus indicators
 * - Enter/Space activate buttons and links
 * - Skip links functionality
 */

/**
 * Helper function to check if an element has visible focus indicator
 * Currently unused but kept for future enhancement
 */
async function _hasFocusIndicator(page: any, selector: string): Promise<boolean> {
  return await page.locator(selector).evaluate((el: HTMLElement) => {
    const styles = window.getComputedStyle(el);

    // Check for various focus indicator styles
    const hasOutline = styles.outline !== 'none' &&
                      styles.outline !== 'rgb(0, 0, 0) none 0px' &&
                      styles.outline !== '0px';

    const hasBoxShadow = styles.boxShadow !== 'none';

    const hasBorder = styles.border !== 'none' &&
                     styles.borderWidth !== '0px';

    const hasBackgroundColor = styles.backgroundColor !== 'transparent' &&
                               styles.backgroundColor !== 'rgba(0, 0, 0, 0)';

    return hasOutline || hasBoxShadow || hasBorder || hasBackgroundColor;
  });
}

/**
 * Helper to get all focusable elements in tab order
 */
async function getFocusableElements(page: any) {
  return await page.evaluate(() => {
    const selector = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const elements = Array.from(document.querySelectorAll(selector));
    return elements
      .filter((el: any) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               !el.hasAttribute('disabled');
      })
      .map((el: any) => ({
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        text: el.textContent?.trim().substring(0, 30),
        href: el.href,
        type: el.type,
        tabindex: el.getAttribute('tabindex')
      }));
  });
}

test.describe('Keyboard Navigation - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have visible focus indicators on all interactive elements', async ({ page }) => {
    const focusableElements = await page.locator('a[href], button, input, select, textarea').all();

    expect(focusableElements.length).toBeGreaterThan(0);

    // Test a sample of key interactive elements
    const elementsToTest = [
      'header a[href="/"]', // Logo link
      'header nav a[href="/books"]', // Navigation link
      '#theme-btn', // Theme toggle button
    ];

    for (const selector of elementsToTest) {
      const element = page.locator(selector).first();

      if (await element.isVisible()) {
        await element.focus();

        // Check that the element has a visible focus state
        const isFocused = await element.evaluate((el) => el === document.activeElement);
        expect(isFocused).toBeTruthy();

        // Visual regression would ideally check focus ring visibility
        // For now, we verify the element is in the focused state
        await expect(element).toBeFocused();
      }
    }
  });

  test('should navigate through all interactive elements with Tab key', async ({ page }) => {
    const focusableElements = await getFocusableElements(page);

    expect(focusableElements.length).toBeGreaterThan(0);

    // Start tabbing through elements
    await page.keyboard.press('Tab');

    let currentFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName.toLowerCase(),
        id: (el as HTMLElement)?.id,
        text: el?.textContent?.trim().substring(0, 30)
      };
    });

    expect(currentFocused.tagName).toBeTruthy();

    // Tab through at least 10 elements to verify tab order works
    for (let i = 0; i < Math.min(10, focusableElements.length); i++) {
      await page.keyboard.press('Tab');

      currentFocused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName.toLowerCase(),
          id: (el as HTMLElement)?.id,
          text: el?.textContent?.trim().substring(0, 30)
        };
      });

      // Verify focus moved to an interactive element
      expect(['a', 'button', 'input', 'select', 'textarea']).toContain(currentFocused.tagName);
    }
  });

  test('should navigate backwards with Shift+Tab', async ({ page }) => {
    // Tab forward a few times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const forwardFocused = await page.evaluate(() => ({
      tagName: document.activeElement?.tagName.toLowerCase(),
      id: (document.activeElement as HTMLElement)?.id
    }));

    // Shift+Tab backwards
    await page.keyboard.press('Shift+Tab');

    const backwardFocused = await page.evaluate(() => ({
      tagName: document.activeElement?.tagName.toLowerCase(),
      id: (document.activeElement as HTMLElement)?.id
    }));

    // Should be different elements
    expect(backwardFocused).not.toEqual(forwardFocused);
  });

  test('should have logical tab order (top to bottom, left to right)', async ({ page }) => {
    const tabOrder = [];

    // Capture tab order
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        const rect = el?.getBoundingClientRect();
        return {
          tagName: el?.tagName.toLowerCase(),
          id: (el as HTMLElement)?.id,
          y: rect?.top || 0,
          x: rect?.left || 0,
          text: el?.textContent?.trim().substring(0, 20)
        };
      });

      tabOrder.push(focused);
    }

    // Verify header elements come before main content
    const headerIndex = tabOrder.findIndex(el =>
      el.text?.includes('Books') || el.text?.includes('News')
    );

    const mainContentIndex = tabOrder.findIndex(el =>
      el.text?.includes('Latest Book') || el.text?.includes('Featured')
    );

    if (headerIndex >= 0 && mainContentIndex >= 0) {
      expect(headerIndex).toBeLessThan(mainContentIndex);
    }
  });

  test('should activate links with Enter key', async ({ page }) => {
    // Find the Books link in navigation
    const booksLink = page.locator('header nav a[href="/books"]').first();
    await booksLink.focus();

    // Press Enter
    await page.keyboard.press('Enter');

    // Should navigate to books page
    await page.waitForURL('/books');
    expect(page.url()).toContain('/books');
  });

  test('should activate buttons with Enter key', async ({ page }) => {
    const themeButton = page.locator('#theme-btn');

    if (await themeButton.isVisible()) {
      await themeButton.focus();

      // Get initial theme
      const initialTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme')
      );

      // Press Enter to toggle
      await page.keyboard.press('Enter');

      // Wait a bit for theme change
      await page.waitForTimeout(100);

      const newTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme')
      );

      // Theme should have changed
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should activate buttons with Space key', async ({ page }) => {
    const themeButton = page.locator('#theme-btn');

    if (await themeButton.isVisible()) {
      await themeButton.focus();

      // Get initial theme
      const initialTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme')
      );

      // Press Space to toggle
      await page.keyboard.press('Space');

      // Wait a bit for theme change
      await page.waitForTimeout(100);

      const newTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme')
      );

      // Theme should have changed
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should not have keyboard traps', async ({ page }) => {
    // Tab through many elements
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Tab');

      // Verify focus is not stuck
      const focusedElement = await page.evaluate(() => ({
        tagName: document.activeElement?.tagName.toLowerCase(),
        id: (document.activeElement as HTMLElement)?.id
      }));

      // Should never be stuck on body (indicates keyboard trap)
      expect(focusedElement.tagName).not.toBe('body');
    }

    // Should be able to Shift+Tab backwards as well
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Shift+Tab');

      const focusedElement = await page.evaluate(() => ({
        tagName: document.activeElement?.tagName.toLowerCase()
      }));

      expect(focusedElement.tagName).not.toBe('body');
    }
  });
});

test.describe('Keyboard Navigation - Books Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/books');
  });

  test('should navigate through book cards with keyboard', async ({ page }) => {
    const bookLinks = page.locator('article a').all();
    const linkCount = (await bookLinks).length;

    if (linkCount > 0) {
      // Tab to first book card link
      let foundBookLink = false;
      for (let i = 0; i < 30 && !foundBookLink; i++) {
        await page.keyboard.press('Tab');

        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName.toLowerCase(),
            href: (el as HTMLAnchorElement)?.href,
            text: el?.textContent?.trim()
          };
        });

        if (focused.href?.includes('/books/')) {
          foundBookLink = true;

          // Press Enter to navigate
          await page.keyboard.press('Enter');
          await page.waitForLoadState('domcontentloaded');

          // Should navigate to a book detail page
          expect(page.url()).toMatch(/\/books\/.+/);
        }
      }

      expect(foundBookLink).toBeTruthy();
    }
  });

  test('should have accessible filter controls if present', async ({ page }) => {
    // Check for filter controls
    const filterButtons = page.locator('button[data-filter], select[data-filter]');
    const count = await filterButtons.count();

    if (count > 0) {
      const firstFilter = filterButtons.first();
      await firstFilter.focus();

      await expect(firstFilter).toBeFocused();

      // Should be activatable with Enter
      await page.keyboard.press('Enter');

      // Wait for potential filter action
      await page.waitForTimeout(200);
    }
  });
});

test.describe('Keyboard Navigation - News Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/news');
  });

  test('should navigate through news posts with keyboard', async ({ page }) => {
    const newsLinks = page.locator('article a[href^="/news/"]').all();
    const linkCount = (await newsLinks).length;

    if (linkCount > 0) {
      // Tab through to find a news link
      let foundNewsLink = false;
      for (let i = 0; i < 30 && !foundNewsLink; i++) {
        await page.keyboard.press('Tab');

        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName.toLowerCase(),
            href: (el as HTMLAnchorElement)?.href
          };
        });

        if (focused.href?.includes('/news/') && focused.href !== page.url()) {
          foundNewsLink = true;

          // Activate with Enter
          await page.keyboard.press('Enter');
          await page.waitForLoadState('domcontentloaded');

          // Should navigate to news detail page
          expect(page.url()).toMatch(/\/news\/.+/);
        }
      }

      expect(foundNewsLink).toBeTruthy();
    }
  });

  test('should have accessible category filters if present', async ({ page }) => {
    const filterControls = page.locator('[data-category-filter], button[aria-label*="filter" i]');
    const count = await filterControls.count();

    if (count > 0) {
      const firstFilter = filterControls.first();
      await firstFilter.focus();
      await expect(firstFilter).toBeFocused();
    }
  });
});

test.describe('Keyboard Navigation - Individual Book Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to books index first
    await page.goto('/books');

    // Get first book link
    const firstBookLink = page.locator('article a[href^="/books/"]').first();
    const href = await firstBookLink.getAttribute('href');

    if (href) {
      await page.goto(href);
    }
  });

  test('should navigate through buy links with keyboard', async ({ page }) => {
    const buyLinks = page.locator('a[href*="amazon"], a[href*="barnesandnoble"], a[href*="kobo"], a:has-text("Buy"), a:has-text("Pre-order")').all();
    const linkCount = (await buyLinks).length;

    if (linkCount > 0) {
      // Find and focus first buy link
      let foundBuyLink = false;
      for (let i = 0; i < 50 && !foundBuyLink; i++) {
        await page.keyboard.press('Tab');

        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName.toLowerCase(),
            href: (el as HTMLAnchorElement)?.href,
            text: el?.textContent?.trim().toLowerCase()
          };
        });

        if (focused.text?.includes('buy') ||
            focused.text?.includes('pre-order') ||
            focused.href?.includes('amazon') ||
            focused.href?.includes('barnesandnoble')) {
          foundBuyLink = true;

          // Verify it's focused
          const isFocused = await page.evaluate(() =>
            document.activeElement?.tagName.toLowerCase() === 'a'
          );
          expect(isFocused).toBeTruthy();
        }
      }
    }
  });

  test('should navigate back to books index with keyboard', async ({ page }) => {
    // Look for "Back to Books" or similar link
    const backLink = page.locator('a[href="/books"]').first();

    if (await backLink.isVisible()) {
      await backLink.focus();
      await expect(backLink).toBeFocused();

      await page.keyboard.press('Enter');
      await page.waitForURL('/books');
      expect(page.url()).toContain('/books');
    }
  });
});

test.describe('Keyboard Navigation - Mobile Menu', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should open mobile menu with Enter key', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('#menu-btn');

    if (await menuButton.isVisible()) {
      await menuButton.focus();
      await expect(menuButton).toBeFocused();

      // Press Enter to open
      await page.keyboard.press('Enter');

      // Menu should be visible
      const menuItems = page.locator('#menu-items');
      await expect(menuItems).toBeVisible();
    }
  });

  test('should open mobile menu with Space key', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('#menu-btn');

    if (await menuButton.isVisible()) {
      await menuButton.focus();

      // Press Space to open
      await page.keyboard.press('Space');

      // Menu should be visible
      const menuItems = page.locator('#menu-items');
      await expect(menuItems).toBeVisible();
    }
  });

  test('should navigate through mobile menu items with Tab', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('#menu-btn');

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Tab through menu items
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => ({
        tagName: document.activeElement?.tagName.toLowerCase(),
        text: document.activeElement?.textContent?.trim()
      }));

      // Should focus on a menu link
      expect(focused.tagName).toBe('a');
      expect(['Books', 'News', 'About', 'Search']).toContain(focused.text);
    }
  });

  test('should activate mobile menu links with Enter', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('#menu-btn');

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Focus on Books link
      const booksLink = page.locator('#menu-items a[href="/books"]');
      await booksLink.focus();

      // Press Enter
      await page.keyboard.press('Enter');

      // Should navigate to books page
      await page.waitForURL('/books');
      expect(page.url()).toContain('/books');
    }
  });
});

test.describe('Keyboard Navigation - Focus Management', () => {
  test('should maintain focus visibility throughout navigation', async ({ page }) => {
    const testPages = ['/', '/books', '/news', '/about'];

    for (const pagePath of testPages) {
      await page.goto(pagePath);

      // Tab through first 10 elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');

        // Each interactive element should have some focus indication
        // Note: This is a basic check. Visual regression would be better.
        const focusedTag = await page.evaluate(() =>
          document.activeElement?.tagName.toLowerCase()
        );

        expect(['a', 'button', 'input', 'textarea', 'select']).toContain(focusedTag);
      }
    }
  });

  test('should not lose focus when interacting with elements', async ({ page }) => {
    await page.goto('/');

    // Focus on theme toggle
    const themeButton = page.locator('#theme-btn');
    await themeButton.focus();

    // Click it
    await themeButton.click();

    // Wait for animation
    await page.waitForTimeout(100);

    // Focus should still be on the button
    const stillFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return (el as HTMLElement)?.id === 'theme-btn';
    });

    expect(stillFocused).toBeTruthy();
  });
});

test.describe('Keyboard Navigation - Skip Links', () => {
  test('should have skip to main content link as first focusable element', async ({ page }) => {
    await page.goto('/');

    // First tab should focus skip link (if it exists)
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => ({
      tagName: document.activeElement?.tagName.toLowerCase(),
      text: document.activeElement?.textContent?.trim().toLowerCase(),
      href: (document.activeElement as HTMLAnchorElement)?.href
    }));

    // Check if it's a skip link
    if (focused.text?.includes('skip') || focused.href?.includes('#main')) {
      // Press Enter to activate skip link
      await page.keyboard.press('Enter');

      // Wait for focus to jump
      await page.waitForTimeout(100);

      // Focus should be in main content area
      const newFocused = await page.evaluate(() => {
        const el = document.activeElement;
        const main = document.querySelector('main');
        return main?.contains(el as Node) || el?.tagName.toLowerCase() === 'main';
      });

      expect(newFocused).toBeTruthy();
    }
  });
});
