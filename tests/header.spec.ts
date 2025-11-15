import { test, expect } from '@playwright/test';

/**
 * Header Component Test Suite
 *
 * Tests all aspects of the header component including:
 * - Site title and branding
 * - Navigation links
 * - Mobile menu functionality
 * - Active state indicators
 * - Dark mode toggle
 * - Responsive behavior
 * - Accessibility features
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:4321';

test.describe('Header Component', () => {

  test.describe('Site Title and Branding', () => {
    test('should display site title "Cache McClure"', async ({ page }) => {
      await page.goto(BASE_URL);

      const siteTitle = page.locator('header a[href="/"]');
      await expect(siteTitle).toBeVisible();
      await expect(siteTitle).toContainText('Cache McClure');
    });

    test('should link to homepage when site title is clicked', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);

      const siteTitle = page.locator('header a[href="/"]');
      await siteTitle.click();

      await page.waitForURL(BASE_URL + '/');
      expect(page.url()).toBe(BASE_URL + '/');
    });
  });

  test.describe('Navigation Links', () => {
    test('should display all required navigation links', async ({ page }) => {
      await page.goto(BASE_URL);

      // Check for Books link
      const booksLink = page.locator('header nav a[href="/books"]');
      await expect(booksLink).toBeVisible();
      await expect(booksLink).toContainText('Books');

      // Check for News link
      const newsLink = page.locator('header nav a[href="/news"]');
      await expect(newsLink).toBeVisible();
      await expect(newsLink).toContainText('News');

      // Check for About link
      const aboutLink = page.locator('header nav a[href="/about"]');
      await expect(aboutLink).toBeVisible();
      await expect(aboutLink).toContainText('About');
    });

    test('should NOT display search link (not needed until 50+ posts)', async ({ page }) => {
      await page.goto(BASE_URL);

      const searchLink = page.locator('header nav a[href="/search"]');
      await expect(searchLink).not.toBeVisible();
    });

    test('should NOT display archives link (disabled for v1.0)', async ({ page }) => {
      await page.goto(BASE_URL);

      const archivesLink = page.locator('header nav a[href="/archives"]');
      await expect(archivesLink).not.toBeVisible();
    });

    test('should navigate to Books page when Books link is clicked', async ({ page }) => {
      await page.goto(BASE_URL);

      const booksLink = page.locator('header nav a[href="/books"]');
      await booksLink.click();

      await page.waitForURL(`${BASE_URL}/books`);
      expect(page.url()).toContain('/books');
    });

    test('should navigate to News page when News link is clicked', async ({ page }) => {
      await page.goto(BASE_URL);

      const newsLink = page.locator('header nav a[href="/news"]');
      await newsLink.click();

      await page.waitForURL(`${BASE_URL}/news`);
      expect(page.url()).toContain('/news');
    });

    test('should navigate to About page when About link is clicked', async ({ page }) => {
      await page.goto(BASE_URL);

      const aboutLink = page.locator('header nav a[href="/about"]');
      await aboutLink.click();

      await page.waitForURL(`${BASE_URL}/about`);
      expect(page.url()).toContain('/about');
    });
  });

  test.describe('Active State Indicators', () => {
    test('should show active state on Books page', async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const booksLink = page.locator('header nav a[href="/books"]');
      await expect(booksLink).toHaveClass(/active-nav/);
    });

    test('should show active state on News page', async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsLink = page.locator('header nav a[href="/news"]');
      await expect(newsLink).toHaveClass(/active-nav/);
    });

    test('should show active state on About page', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);

      const aboutLink = page.locator('header nav a[href="/about"]');
      await expect(aboutLink).toHaveClass(/active-nav/);
    });

    test('should maintain active state on nested pages', async ({ page }) => {
      // Navigate to a book detail page (which is under /books/)
      await page.goto(BASE_URL);
      const firstBookLink = page.locator('a[href*="/books/"]').first();

      // Only run this test if there are books
      const bookLinkCount = await firstBookLink.count();
      if (bookLinkCount > 0) {
        await firstBookLink.click();
        await page.waitForURL(/\/books\//);

        const booksLink = page.locator('header nav a[href="/books"]');
        await expect(booksLink).toHaveClass(/active-nav/);
      }
    });

    test('should not show active state on non-current pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const newsLink = page.locator('header nav a[href="/news"]');
      await expect(newsLink).not.toHaveClass(/active-nav/);

      const aboutLink = page.locator('header nav a[href="/about"]');
      await expect(aboutLink).not.toHaveClass(/active-nav/);
    });
  });

  test.describe('Mobile Menu Functionality', () => {
    test('should show hamburger menu button on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      await page.goto(BASE_URL);

      const menuButton = page.locator('#menu-btn');
      await expect(menuButton).toBeVisible();
    });

    test('should hide menu items initially on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      const menuItems = page.locator('#menu-items');
      await expect(menuItems).toHaveClass(/hidden/);
    });

    test('should show menu items when hamburger is clicked', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      const menuButton = page.locator('#menu-btn');
      await menuButton.click();

      const menuItems = page.locator('#menu-items');
      await expect(menuItems).not.toHaveClass(/hidden/);
    });

    test('should toggle menu icon to close icon when opened', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      const menuButton = page.locator('#menu-btn');
      const menuIcon = page.locator('#menu-icon');
      const closeIcon = page.locator('#close-icon');

      // Initially menu icon should be visible, close icon hidden
      await expect(menuIcon).toBeVisible();
      await expect(closeIcon).toHaveClass(/hidden/);

      // After click, menu icon hidden, close icon visible
      await menuButton.click();
      await expect(menuIcon).toHaveClass(/hidden/);
      await expect(closeIcon).not.toHaveClass(/hidden/);
    });

    test('should close menu when hamburger is clicked again', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      const menuButton = page.locator('#menu-btn');

      // Open menu
      await menuButton.click();
      let menuItems = page.locator('#menu-items');
      await expect(menuItems).not.toHaveClass(/hidden/);

      // Close menu
      await menuButton.click();
      menuItems = page.locator('#menu-items');
      await expect(menuItems).toHaveClass(/hidden/);
    });

    test('should update aria-expanded attribute when toggling menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      const menuButton = page.locator('#menu-btn');

      // Initially closed
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      // After opening
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // After closing
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should update aria-label when toggling menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      const menuButton = page.locator('#menu-btn');

      // Initially "Open Menu"
      await expect(menuButton).toHaveAttribute('aria-label', 'Open Menu');

      // After opening: "Close Menu"
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-label', 'Close Menu');

      // After closing: "Open Menu"
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-label', 'Open Menu');
    });

    test('should hide hamburger menu on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(BASE_URL);

      const menuButton = page.locator('#menu-btn');
      await expect(menuButton).not.toBeVisible();
    });

    test('should show menu items by default on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(BASE_URL);

      const menuItems = page.locator('#menu-items');
      await expect(menuItems).toBeVisible();
    });
  });

  test.describe('Dark Mode Toggle', () => {
    test('should display dark mode toggle button', async ({ page }) => {
      await page.goto(BASE_URL);

      const themeButton = page.locator('#theme-btn');
      await expect(themeButton).toBeVisible();
    });

    test('should have proper aria-label for accessibility', async ({ page }) => {
      await page.goto(BASE_URL);

      const themeButton = page.locator('#theme-btn');
      await expect(themeButton).toHaveAttribute('aria-label', 'Toggle light and dark mode');
    });

    test('should toggle between light and dark mode when clicked', async ({ page }) => {
      await page.goto(BASE_URL);

      const htmlElement = page.locator('html');
      const themeButton = page.locator('#theme-btn');

      // Get initial theme
      const initialClass = await htmlElement.getAttribute('class');

      // Click to toggle
      await themeButton.click();
      await page.waitForTimeout(100); // Wait for transition

      // Check theme changed
      const newClass = await htmlElement.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    });

    test('should display moon icon in light mode', async ({ page }) => {
      await page.goto(BASE_URL);

      // Ensure we're in light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      });
      await page.reload();

      const moonIcon = page.locator('#theme-btn svg').first();
      await expect(moonIcon).toBeVisible();
    });
  });

  test.describe('Responsive Behavior', () => {
    const viewports = [
      { name: 'Mobile (iPhone SE)', width: 375, height: 667 },
      { name: 'Mobile (iPhone 12)', width: 390, height: 844 },
      { name: 'Tablet (iPad)', width: 768, height: 1024 },
      { name: 'Desktop (1080p)', width: 1920, height: 1080 },
      { name: 'Desktop (4K)', width: 3840, height: 2160 },
    ];

    for (const viewport of viewports) {
      test(`should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL);

        const header = page.locator('header');
        await expect(header).toBeVisible();

        // Site title should always be visible
        const siteTitle = page.locator('header a[href="/"]');
        await expect(siteTitle).toBeVisible();
      });
    }

    test('should maintain header layout across different pages', async ({ page }) => {
      const pages = ['/', '/books', '/news', '/about'];

      for (const pagePath of pages) {
        await page.goto(BASE_URL + pagePath);

        const header = page.locator('header');
        await expect(header).toBeVisible();

        const nav = page.locator('header nav');
        await expect(nav).toBeVisible();
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('should include skip to content link', async ({ page }) => {
      await page.goto(BASE_URL);

      const skipLink = page.locator('#skip-to-content');
      await expect(skipLink).toBeInViewport();
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    test('should show skip to content link on focus', async ({ page }) => {
      await page.goto(BASE_URL);

      // Tab to focus the skip link
      await page.keyboard.press('Tab');

      const skipLink = page.locator('#skip-to-content');
      await expect(skipLink).toBeVisible();
    });

    test('should have proper navigation landmark', async ({ page }) => {
      await page.goto(BASE_URL);

      const nav = page.locator('nav[aria-label="Main navigation"]');
      await expect(nav).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(BASE_URL);

      // Tab through header elements
      await page.keyboard.press('Tab'); // Skip to content
      await page.keyboard.press('Tab'); // Site title

      // Check focus is on the site title
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('A');
    });

    test('should have focus indicators on interactive elements', async ({ page }) => {
      await page.goto(BASE_URL);

      const booksLink = page.locator('header nav a[href="/books"]');
      await booksLink.focus();

      // Verify the element can be focused
      const isFocused = await booksLink.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    });

    test('should have proper ARIA attributes on menu button', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      const menuButton = page.locator('#menu-btn');

      await expect(menuButton).toHaveAttribute('aria-label', 'Open Menu');
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await expect(menuButton).toHaveAttribute('aria-controls', 'menu-items');
    });
  });

  test.describe('Layout and Styling', () => {
    test('should have proper spacing and alignment', async ({ page }) => {
      await page.goto(BASE_URL);

      const header = page.locator('header');
      const boundingBox = await header.boundingBox();

      expect(boundingBox).not.toBeNull();
      expect(boundingBox!.height).toBeGreaterThan(0);
    });

    test('should have horizontal rule separator after header', async ({ page }) => {
      await page.goto(BASE_URL);

      // The Hr component should be present after the nav
      const hr = page.locator('header hr, header + hr').first();
      await expect(hr).toBeVisible();
    });

    test('should maintain consistent header across page navigations', async ({ page }) => {
      await page.goto(BASE_URL);

      // Get header height on home page
      const header = page.locator('header');
      const homeHeight = await header.evaluate((el) => (el as HTMLElement).offsetHeight);

      // Navigate to Books page
      await page.goto(`${BASE_URL}/books`);
      const booksHeight = await header.evaluate((el) => (el as HTMLElement).offsetHeight);

      // Heights should be similar (allowing for minor differences)
      expect(Math.abs(homeHeight - booksHeight)).toBeLessThan(10);
    });
  });

  test.describe('Performance', () => {
    test('should load header quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);

      const header = page.locator('header');
      await expect(header).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should not cause layout shift', async ({ page }) => {
      await page.goto(BASE_URL);

      const header = page.locator('header');
      const initialBox = await header.boundingBox();

      // Wait a bit for any potential shifts
      await page.waitForTimeout(500);

      const finalBox = await header.boundingBox();

      expect(initialBox?.y).toBe(finalBox?.y);
      expect(initialBox?.height).toBe(finalBox?.height);
    });
  });

  test.describe('Integration with View Transitions', () => {
    test('should reinitialize mobile menu after view transition', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);

      // Open menu
      const menuButton = page.locator('#menu-btn');
      await menuButton.click();

      // Navigate to another page
      const booksLink = page.locator('header nav a[href="/books"]');
      await booksLink.click();
      await page.waitForURL(`${BASE_URL}/books`);

      // Menu should be closed after navigation
      const menuItems = page.locator('#menu-items');
      await expect(menuItems).toHaveClass(/hidden/);

      // Menu button should still be functional
      await menuButton.click();
      await expect(menuItems).not.toHaveClass(/hidden/);
    });
  });
});
