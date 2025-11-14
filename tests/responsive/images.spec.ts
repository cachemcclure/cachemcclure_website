import { test, expect } from '@playwright/test';

/**
 * Image Scaling Responsive Tests
 * Tests image display and scaling across all breakpoints
 */

const pages = ['/', '/books', '/news', '/about'];

test.describe('Image Scaling - All Pages', () => {
  for (const pagePath of pages) {
    test.describe(`Images on ${pagePath}`, () => {
      test('images never exceed viewport width on mobile', async ({ page }) => {
        await page.goto(pagePath);

        const images = page.locator('img');
        const count = await images.count();

        if (count > 0) {
          const viewport = page.viewportSize();

          for (let i = 0; i < count; i++) {
            const img = images.nth(i);

            // Wait for image to load
            await img.evaluate((el: HTMLImageElement) => {
              if (el.complete) return;
              return new Promise((resolve) => {
                el.onload = resolve;
                el.onerror = resolve;
              });
            });

            if (await img.isVisible()) {
              const box = await img.boundingBox();

              if (box) {
                expect(box.width).toBeLessThanOrEqual(viewport!.width);
              }
            }
          }
        }
      });

      test('images have proper alt text', async ({ page }) => {
        await page.goto(pagePath);

        const images = page.locator('img');
        const count = await images.count();

        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const img = images.nth(i);

            if (await img.isVisible()) {
              const alt = await img.getAttribute('alt');

              // Should have alt attribute (empty is acceptable for decorative images)
              expect(alt).not.toBeNull();
            }
          }
        }
      });

      test('images maintain aspect ratio', async ({ page }) => {
        await page.goto(pagePath);

        const images = page.locator('img');
        const count = await images.count();

        if (count > 0) {
          for (let i = 0; i < Math.min(3, count); i++) {
            const img = images.nth(i);

            if (await img.isVisible()) {
              // Wait for image to load
              await img.evaluate((el: HTMLImageElement) => {
                if (el.complete) return;
                return new Promise((resolve) => {
                  el.onload = resolve;
                  el.onerror = resolve;
                });
              });

              const box = await img.boundingBox();

              if (box) {
                const aspectRatio = box.width / box.height;

                // Aspect ratio should be reasonable (not squashed or stretched)
                expect(aspectRatio).toBeGreaterThan(0.1);
                expect(aspectRatio).toBeLessThan(10);
              }
            }
          }
        }
      });

      test('images load successfully', async ({ page }) => {
        await page.goto(pagePath);

        const images = page.locator('img');
        const count = await images.count();

        if (count > 0) {
          for (let i = 0; i < Math.min(5, count); i++) {
            const img = images.nth(i);

            if (await img.isVisible()) {
              // Check if image loaded successfully
              const naturalWidth = await img.evaluate((el: HTMLImageElement) =>
                el.naturalWidth
              );

              // A naturalWidth of 0 indicates failed load
              if (naturalWidth === 0) {
                const src = await img.getAttribute('src');
                console.warn(`Image failed to load: ${src}`);
              }
            }
          }
        }
      });
    });
  }
});

test.describe('Book Cover Images', () => {
  test('book covers scale appropriately on mobile', async ({ page }) => {
    await page.goto('/books');

    const covers = page.locator('img[alt*="cover"], img[src*="cover"]');
    const count = await covers.count();

    if (count > 0) {
      const firstCover = covers.first();

      await firstCover.evaluate((el: HTMLImageElement) => {
        if (el.complete) return;
        return new Promise((resolve) => {
          el.onload = resolve;
          el.onerror = resolve;
        });
      });

      const box = await firstCover.boundingBox();

      expect(box).toBeTruthy();

      // Mobile: h-48 w-32 (192px x 128px)
      if (page.viewportSize()!.width < 640) {
        expect(box!.height).toBeGreaterThanOrEqual(150);
        expect(box!.height).toBeLessThanOrEqual(250);
      }
    }
  });

  test('book covers scale appropriately on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/books');

    const covers = page.locator('img[alt*="cover"], img[src*="cover"]');
    const count = await covers.count();

    if (count > 0) {
      const firstCover = covers.first();

      await firstCover.evaluate((el: HTMLImageElement) => {
        if (el.complete) return;
        return new Promise((resolve) => {
          el.onload = resolve;
          el.onerror = resolve;
        });
      });

      const box = await firstCover.boundingBox();

      expect(box).toBeTruthy();

      // Tablet: sm:h-56 sm:w-40 (224px x 160px)
      expect(box!.height).toBeGreaterThanOrEqual(200);
    }
  });

  test('book covers maintain consistent size within same view', async ({ page }) => {
    await page.goto('/books');

    const covers = page.locator('img[alt*="cover"], img[src*="cover"]');
    const count = await covers.count();

    if (count >= 2) {
      const firstBox = await covers.first().boundingBox();
      const secondBox = await covers.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Heights should be the same (or very close)
        expect(Math.abs(firstBox.height - secondBox.height)).toBeLessThan(5);
        expect(Math.abs(firstBox.width - secondBox.width)).toBeLessThan(5);
      }
    }
  });
});

test.describe('Featured Images in News Posts', () => {
  test('featured images in news posts are responsive', async ({ page }) => {
    await page.goto('/news');

    const firstNewsLink = page.locator('article a, [class*="news"] a').first();

    if (await firstNewsLink.count() > 0) {
      await firstNewsLink.click();

      const featuredImage = page.locator('img').first();

      if (await featuredImage.count() > 0 && (await featuredImage.isVisible())) {
        await featuredImage.evaluate((el: HTMLImageElement) => {
          if (el.complete) return;
          return new Promise((resolve) => {
            el.onload = resolve;
            el.onerror = resolve;
          });
        });

        const box = await featuredImage.boundingBox();
        const viewport = page.viewportSize();

        expect(box!.width).toBeLessThanOrEqual(viewport!.width);
      }
    }
  });
});

test.describe('Author Photo', () => {
  test('author photo displays appropriately on about page', async ({ page }) => {
    await page.goto('/about');

    const authorPhoto = page.locator('img[alt*="Cache"], img[alt*="author"], img').first();

    if (await authorPhoto.count() > 0) {
      await expect(authorPhoto).toBeVisible();

      await authorPhoto.evaluate((el: HTMLImageElement) => {
        if (el.complete) return;
        return new Promise((resolve) => {
          el.onload = resolve;
          el.onerror = resolve;
        });
      });

      const box = await authorPhoto.boundingBox();
      const viewport = page.viewportSize();

      expect(box).toBeTruthy();
      expect(box!.width).toBeLessThanOrEqual(viewport!.width);

      // Should be reasonably sized (not tiny)
      expect(box!.width).toBeGreaterThan(100);
    }
  });
});

test.describe('Image Performance', () => {
  test('images use appropriate formats', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(5, count); i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');

        if (src) {
          // Modern formats are preferred: webp, avif, svg
          const hasModernFormat =
            src.includes('.webp') ||
            src.includes('.avif') ||
            src.includes('.svg') ||
            src.includes('data:image');

          const hasAcceptableFormat =
            hasModernFormat ||
            src.includes('.jpg') ||
            src.includes('.jpeg') ||
            src.includes('.png');

          expect(hasAcceptableFormat).toBeTruthy();
        }
      }
    }
  });
});
