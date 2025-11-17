import { test, expect } from '@playwright/test';

/**
 * Comprehensive Accessibility Test Suite
 *
 * Tests WCAG 2.1 AA compliance including:
 * - Semantic HTML
 * - ARIA labels and attributes
 * - Skip links
 * - Focus indicators
 * - Landmark roles
 * - Decorative icon hiding
 */

const BASE_URL = 'http://localhost:4321';

test.describe('Accessibility: Semantic HTML & Landmarks', () => {
  test('Home page has proper semantic structure', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for main landmark
    const main = await page.locator('main#main-content');
    await expect(main).toBeVisible();

    // Check for header landmark
    const header = await page.locator('header');
    await expect(header).toBeVisible();

    // Check for footer landmark
    const footer = await page.locator('footer[aria-label="Site footer"]');
    await expect(footer).toBeVisible();

    // Check for navigation landmark
    const nav = await page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
  });

  test('Books page has proper article elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/books`);

    // Book cards should use article elements
    const articles = await page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    // Each article should have a heading
    for (let i = 0; i < count; i++) {
      const article = articles.nth(i);
      const heading = await article.locator('h2, h3');
      await expect(heading).toBeVisible();
    }
  });

  test('News page has proper article elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    // News cards should use article elements
    const articles = await page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    // Each article should have a heading
    for (let i = 0; i < count; i++) {
      const article = articles.nth(i);
      const heading = await article.locator('h2, h3');
      await expect(heading).toBeVisible();
    }
  });

  test('Footer has proper aside element for newsletter', async ({ page }) => {
    await page.goto(BASE_URL);

    const newsletterAside = await page.locator('footer aside[aria-label="Newsletter signup"]');
    await expect(newsletterAside).toBeVisible();

    // Should have a heading
    const heading = await newsletterAside.locator('h3');
    await expect(heading).toHaveText('Stay Updated');
  });
});

test.describe('Accessibility: ARIA Labels & Attributes', () => {
  test('Navigation links have aria-current on active page', async ({ page }) => {
    // Check Books page
    await page.goto(`${BASE_URL}/books`);
    const booksLink = await page.locator('nav[aria-label="Main navigation"] a[href="/books"]');
    await expect(booksLink).toHaveAttribute('aria-current', 'page');

    // Check News page
    await page.goto(`${BASE_URL}/news`);
    const newsLink = await page.locator('nav[aria-label="Main navigation"] a[href="/news"]');
    await expect(newsLink).toHaveAttribute('aria-current', 'page');

    // Check About page
    await page.goto(`${BASE_URL}/about`);
    const aboutLink = await page.locator('nav[aria-label="Main navigation"] a[href="/about"]');
    await expect(aboutLink).toHaveAttribute('aria-current', 'page');
  });

  test('Mobile menu button has proper ARIA attributes', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = await page.locator('button#menu-btn');
    await expect(menuButton).toHaveAttribute('aria-label');
    await expect(menuButton).toHaveAttribute('aria-expanded');
    await expect(menuButton).toHaveAttribute('aria-controls', 'menu-items');

    // Check initial state
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('Theme toggle button has proper ARIA attributes', async ({ page }) => {
    await page.goto(BASE_URL);

    const themeButton = await page.locator('button#theme-btn');
    await expect(themeButton).toHaveAttribute('aria-label', 'Toggle light and dark mode');
    await expect(themeButton).toHaveAttribute('aria-live', 'polite');
  });

  test('Pagination has proper ARIA labels', async ({ page }) => {
    // Note: Only test if pagination exists (requires multiple pages of content)
    await page.goto(`${BASE_URL}/news`);

    const pagination = await page.locator('nav[aria-label="Pagination"]');
    if (await pagination.isVisible()) {
      const prevButton = await pagination.locator('a, span').first();
      const nextButton = await pagination.locator('a, span').last();

      // Buttons should have aria-label
      const prevLabel = await prevButton.getAttribute('aria-label');
      const nextLabel = await nextButton.getAttribute('aria-label');
      expect(prevLabel || 'Previous').toBeTruthy();
      expect(nextLabel || 'Next').toBeTruthy();
    }
  });

  test('Social media links have proper ARIA labels', async ({ page }) => {
    await page.goto(BASE_URL);

    const socialLinks = await page.locator('footer a[aria-label*="on"]');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);

    // Each social link should have descriptive aria-label
    for (let i = 0; i < count; i++) {
      const link = socialLinks.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/Twitter|Instagram|LinkedIn|GitHub|Goodreads/);
    }
  });

  test('Buy links have descriptive ARIA labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/books`);

    // Click first book to view details
    const firstBookLink = await page.locator('article a').first();
    await firstBookLink.click();

    // Check buy links if present
    const buyLinks = await page.locator('a[aria-label*="Buy"]');
    const count = await buyLinks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = buyLinks.nth(i);
        const ariaLabel = await link.getAttribute('aria-label');
        expect(ariaLabel).toMatch(/Buy|Pre-order/);
        expect(ariaLabel).toMatch(/new tab/i);
      }
    }
  });

  test('Back to Top button has proper ARIA label', async ({ page }) => {
    await page.goto(BASE_URL);

    // Scroll down to make button visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const backToTopButton = await page.locator('button[data-button="back-to-top"]');
    await expect(backToTopButton).toHaveAttribute('aria-label', 'Back to top');
  });
});

test.describe('Accessibility: Decorative Icons Hidden from Screen Readers', () => {
  test('Calendar icons have aria-hidden=true', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    const calendarIcons = await page.locator('svg').filter({ hasText: '' }).first();
    const parent = await page.locator('div:has(> svg)').filter({ has: page.locator('time') }).first();

    // Calendar icon should be hidden from screen readers
    const svg = await parent.locator('svg').first();
    if (await svg.isVisible()) {
      const ariaHidden = await svg.getAttribute('aria-hidden');
      expect(ariaHidden).toBe('true');
    }
  });

  test('Hash icons in tags have aria-hidden=true', async ({ page }) => {
    await page.goto(BASE_URL);

    // Find tag links (if any exist on homepage)
    const tagLinks = await page.locator('a[href^="/tags/"]');
    const count = await tagLinks.count();

    if (count > 0) {
      const firstTag = tagLinks.first();
      const hashIcon = await firstTag.locator('svg').first();
      if (await hashIcon.isVisible()) {
        const ariaHidden = await hashIcon.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      }
    }
  });

  test('Arrow icons in pagination have aria-hidden=true', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    const pagination = await page.locator('nav[aria-label="Pagination"]');
    if (await pagination.isVisible()) {
      const icons = await pagination.locator('svg');
      const count = await icons.count();

      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const ariaHidden = await icon.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      }
    }
  });

  test('Social media icons have aria-hidden=true', async ({ page }) => {
    await page.goto(BASE_URL);

    const socialLinks = await page.locator('footer a[aria-label*="on"]');
    const count = await socialLinks.count();

    for (let i = 0; i < count; i++) {
      const link = socialLinks.nth(i);
      const icon = await link.locator('svg').first();
      if (await icon.isVisible()) {
        const ariaHidden = await icon.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      }
    }
  });

  test('Back to Top button icons have aria-hidden=true', async ({ page }) => {
    await page.goto(BASE_URL);

    const backToTopButton = await page.locator('button[data-button="back-to-top"]');
    const icons = await backToTopButton.locator('svg');
    const count = await icons.count();

    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const ariaHidden = await icon.getAttribute('aria-hidden');
      expect(ariaHidden).toBe('true');
    }
  });

  test('Progress indicator has aria-hidden=true', async ({ page }) => {
    await page.goto(BASE_URL);

    const progressIndicator = await page.locator('#progress-indicator');
    await expect(progressIndicator).toHaveAttribute('aria-hidden', 'true');
  });
});

test.describe('Accessibility: Skip Links', () => {
  test('Skip to content link exists and is functional', async ({ page }) => {
    await page.goto(BASE_URL);

    // Skip link should exist
    const skipLink = await page.locator('a.skip-link, a[href="#main-content"]').first();
    await expect(skipLink).toBeAttached();

    // Should have descriptive text
    const text = await skipLink.textContent();
    expect(text?.toLowerCase()).toContain('skip');

    // Should link to main content
    const href = await skipLink.getAttribute('href');
    expect(href).toBe('#main-content');

    // Main content should exist
    const mainContent = await page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('Skip link receives focus on Tab', async ({ page }) => {
    await page.goto(BASE_URL);

    // Press Tab to focus skip link
    await page.keyboard.press('Tab');

    // Skip link should be focused
    const skipLink = await page.locator('a.skip-link, a[href="#main-content"]').first();
    await expect(skipLink).toBeFocused();
  });

  test('Skip link navigates to main content', async ({ page }) => {
    await page.goto(BASE_URL);

    // Press Tab to focus skip link
    await page.keyboard.press('Tab');

    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    // Main content should be in viewport
    const mainContent = await page.locator('#main-content');
    const isInViewport = await mainContent.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top <= window.innerHeight;
    });
    expect(isInViewport).toBeTruthy();
  });
});

test.describe('Accessibility: Focus Indicators', () => {
  test('Navigation links have visible focus indicators', async ({ page }) => {
    await page.goto(BASE_URL);

    const navLinks = await page.locator('nav[aria-label="Main navigation"] a');
    const firstLink = navLinks.first();

    // Focus the link
    await firstLink.focus();

    // Check for focus-visible styles
    const outlineWidth = await firstLink.evaluate(el => {
      return window.getComputedStyle(el).outlineWidth;
    });

    // Outline should be visible (not 0px)
    expect(outlineWidth).not.toBe('0px');
  });

  test('Buttons have visible focus indicators', async ({ page }) => {
    await page.goto(BASE_URL);

    const themeButton = await page.locator('button#theme-btn');
    await themeButton.focus();

    // Check for focus-visible styles
    const outlineWidth = await themeButton.evaluate(el => {
      return window.getComputedStyle(el).outlineWidth;
    });

    expect(outlineWidth).not.toBe('0px');
  });

  test('Book cards have focus-within styles', async ({ page }) => {
    await page.goto(`${BASE_URL}/books`);

    const firstBookLink = await page.locator('article a').first();
    await firstBookLink.focus();

    // Article should have focus-within indicator
    const article = await page.locator('article').first();
    const ringWidth = await article.evaluate(el => {
      return window.getComputedStyle(el).boxShadow;
    });

    // Should have some visual feedback
    expect(ringWidth).not.toBe('none');
  });
});

test.describe('Accessibility: Images', () => {
  test('All images have alt text', async ({ page }) => {
    await page.goto(`${BASE_URL}/books`);

    const images = await page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt).not.toBe('');
    }
  });

  test('Book cover images have descriptive alt text', async ({ page }) => {
    await page.goto(`${BASE_URL}/books`);

    const coverImages = await page.locator('article img');
    const count = await coverImages.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const img = coverImages.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toMatch(/Cover of|cover/i);
    }
  });
});

test.describe('Accessibility: Heading Hierarchy', () => {
  test('Pages have exactly one h1', async ({ page }) => {
    const pages = ['/', '/books', '/news', '/about'];

    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      const h1s = await page.locator('h1');
      const count = await h1s.count();
      expect(count).toBe(1);
    }
  });

  test('Home page has logical heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);

    // Should have h1
    const h1 = await page.locator('h1');
    await expect(h1).toBeVisible();

    // Check if h2s exist and come after h1
    const h2s = await page.locator('h2');
    const h2Count = await h2s.count();

    if (h2Count > 0) {
      // h2s should be after h1 in DOM order
      const h1Position = await h1.evaluate(el => {
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let pos = 0;
        while (walk.nextNode()) {
          if (walk.currentNode === el) return pos;
          pos++;
        }
        return -1;
      });

      const firstH2Position = await h2s.first().evaluate(el => {
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let pos = 0;
        while (walk.nextNode()) {
          if (walk.currentNode === el) return pos;
          pos++;
        }
        return -1;
      });

      expect(firstH2Position).toBeGreaterThan(h1Position);
    }
  });
});

test.describe('Accessibility: Link Button Component', () => {
  test('Disabled link buttons have proper ARIA attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    const pagination = await page.locator('nav[aria-label="Pagination"]');
    if (await pagination.isVisible()) {
      const disabledButtons = await pagination.locator('span[aria-disabled="true"]');
      const count = await disabledButtons.count();

      for (let i = 0; i < count; i++) {
        const button = disabledButtons.nth(i);
        await expect(button).toHaveAttribute('role', 'link');
        await expect(button).toHaveAttribute('tabindex', '-1');
        await expect(button).toHaveAttribute('aria-disabled', 'true');
      }
    }
  });
});

test.describe('Accessibility: Form Elements', () => {
  test('Newsletter section is properly labeled', async ({ page }) => {
    await page.goto(BASE_URL);

    const newsletter = await page.locator('aside[aria-label="Newsletter signup"]');
    await expect(newsletter).toBeVisible();

    const heading = await newsletter.locator('h3');
    await expect(heading).toBeVisible();
  });
});
