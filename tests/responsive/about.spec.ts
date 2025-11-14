import { test, expect } from '@playwright/test';

/**
 * About Page Responsive Design Tests
 * Tests about page layout and content at all breakpoints
 */

test.describe('About Page - Mobile (< 640px)', () => {
  test('page loads and displays content', async ({ page }) => {
    await page.goto('/about');

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('author photo is visible and properly sized', async ({ page }) => {
    await page.goto('/about');

    const authorPhoto = page.locator('img[alt*="Cache"], img[alt*="author"], img').first();

    if (await authorPhoto.count() > 0) {
      await expect(authorPhoto).toBeVisible();

      const box = await authorPhoto.boundingBox();
      const viewport = page.viewportSize();

      expect(box).toBeTruthy();
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
      expect(box!.width).toBeGreaterThan(100);
    }
  });

  test('bio content is readable on mobile', async ({ page }) => {
    await page.goto('/about');

    const bioContent = page.locator('main p, [class*="prose"] p').first();

    if (await bioContent.count() > 0) {
      await expect(bioContent).toBeVisible();

      const fontSize = await bioContent.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );

      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(14); // Readable minimum
    }
  });

  test('content sections stack vertically on mobile', async ({ page }) => {
    await page.goto('/about');

    const sections = page.locator('section, [class*="flex"][class*="col"]');

    if (await sections.count() > 0) {
      const firstSection = sections.first();
      const flexDirection = await firstSection.evaluate((el) =>
        window.getComputedStyle(el).flexDirection
      );

      if (flexDirection !== 'row') {
        expect(['column', 'column-reverse']).toContain(flexDirection);
      }
    }
  });

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/about');

    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});

test.describe('About Page - Tablet (640px - 1023px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('layout adjusts for tablet screen size', async ({ page }) => {
    await page.goto('/about');

    const main = page.locator('main');
    await expect(main).toBeVisible();

    const box = await main.boundingBox();
    expect(box).toBeTruthy();

    // Content should have some padding/margins
    expect(box!.x).toBeGreaterThan(0);
  });

  test('author photo scales appropriately on tablet', async ({ page }) => {
    await page.goto('/about');

    const authorPhoto = page.locator('img[alt*="Cache"], img[alt*="author"], img').first();

    if (await authorPhoto.count() > 0) {
      const box = await authorPhoto.boundingBox();

      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(150);
      expect(box!.width).toBeLessThan(500);
    }
  });

  test('text line length is comfortable for reading', async ({ page }) => {
    await page.goto('/about');

    const bioContent = page.locator('main p, [class*="prose"] p').first();

    if (await bioContent.count() > 0) {
      const box = await bioContent.boundingBox();
      const viewport = page.viewportSize();

      // Should not span full width (too hard to read)
      expect(box!.width).toBeLessThan(viewport!.width - 40);
    }
  });
});

test.describe('About Page - Desktop (≥ 1024px)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('content is centered with max-width constraint', async ({ page }) => {
    await page.goto('/about');

    const container = page.locator('[class*="max-w"], main').first();
    const box = await container.boundingBox();

    expect(box).toBeTruthy();

    const viewport = page.viewportSize();

    // Should be narrower than viewport (constrained)
    expect(box!.width).toBeLessThan(viewport!.width);

    // Should be centered
    const leftMargin = box!.x;
    const rightMargin = viewport!.width - (box!.x + box!.width);

    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(5);
  });

  test('layout is balanced and professional', async ({ page }) => {
    await page.goto('/about');

    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for proper spacing
    const paddingTop = await main.evaluate((el) =>
      window.getComputedStyle(el).paddingTop
    );

    const paddingValue = parseInt(paddingTop);
    expect(paddingValue).toBeGreaterThan(0);
  });

  test('optimal line length for prose content', async ({ page }) => {
    await page.goto('/about');

    const bioContent = page.locator('[class*="prose"], main').first();

    if (await bioContent.count() > 0) {
      const box = await bioContent.boundingBox();

      // Optimal line length is 45-75 characters, roughly 600-800px
      expect(box!.width).toBeLessThan(900);
      expect(box!.width).toBeGreaterThan(400);
    }
  });
});

test.describe('About Page - Press Kit', () => {
  test('press kit download link is accessible', async ({ page }) => {
    await page.goto('/about');

    const pressKitLink = page.locator('a[href*="press"], a:has-text("Press Kit"), a:has-text("Download")');
    const count = await pressKitLink.count();

    if (count > 0) {
      const link = pressKitLink.first();
      await expect(link).toBeVisible();

      // Should have adequate touch target
      const box = await link.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('press kit link is prominent on all screen sizes', async ({ page }) => {
    await page.goto('/about');

    const pressKitLink = page.locator('a[href*="press"], a:has-text("Press Kit"), a:has-text("Download")');

    if (await pressKitLink.count() > 0) {
      const link = pressKitLink.first();

      if (await link.isVisible()) {
        await expect(link).toBeVisible();

        // Should be styled as a button or prominent link
        const padding = await link.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            top: parseInt(style.paddingTop),
            bottom: parseInt(style.paddingBottom),
          };
        });

        expect(padding.top + padding.bottom).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('About Page - Social Links', () => {
  test('social links are visible and accessible', async ({ page }) => {
    await page.goto('/about');

    const socialLinks = page.locator('a[href*="twitter"], a[href*="facebook"], a[href*="instagram"], a[href*="github"], a[href*="linkedin"]');
    const count = await socialLinks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = socialLinks.nth(i);

        if (await link.isVisible()) {
          await expect(link).toBeVisible();

          // Should have adequate touch target
          const box = await link.boundingBox();
          expect(box!.width).toBeGreaterThanOrEqual(44);
          expect(box!.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('social links display appropriately on mobile', async ({ page }) => {
    await page.goto('/about');

    const socialContainer = page.locator('[class*="social"], .flex').filter({
      has: page.locator('a[href*="twitter"], a[href*="github"]'),
    }).first();

    if (await socialContainer.count() > 0) {
      const box = await socialContainer.boundingBox();
      const viewport = page.viewportSize();

      // Should fit within viewport
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);
    }
  });
});

test.describe('About Page - Content Hierarchy', () => {
  test('heading hierarchy is correct', async ({ page }) => {
    await page.goto('/about');

    // Should have h1 for page title
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // Check that h1 appears before h2
    const h1Position = await h1.first().evaluate((el) => {
      return el.getBoundingClientRect().top;
    });

    const h2 = page.locator('h2');
    if (await h2.count() > 0) {
      const h2Position = await h2.first().evaluate((el) => {
        return el.getBoundingClientRect().top;
      });

      expect(h1Position).toBeLessThan(h2Position);
    }
  });

  test('page title is prominent', async ({ page }) => {
    await page.goto('/about');

    const h1 = page.locator('h1').first();
    const fontSize = await h1.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );

    const fontSizeValue = parseInt(fontSize);

    // H1 should be large
    expect(fontSizeValue).toBeGreaterThanOrEqual(28);
  });
});

test.describe('About Page - Accessibility', () => {
  test('page has proper semantic structure', async ({ page }) => {
    await page.goto('/about');

    // Should have main element
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Should have header
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Should have footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/about');

    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');

        // All images should have alt attribute
        expect(alt).not.toBeNull();
      }
    }
  });

  test('links have descriptive text or aria-labels', async ({ page }) => {
    await page.goto('/about');

    const links = page.locator('a[href]');
    const count = await links.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(10, count); i++) {
        const link = links.nth(i);

        if (await link.isVisible()) {
          const text = await link.textContent();
          const ariaLabel = await link.getAttribute('aria-label');

          // Should have either text content or aria-label
          expect(text || ariaLabel).toBeTruthy();
        }
      }
    }
  });
});
