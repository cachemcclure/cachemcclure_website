import { test, expect } from "@playwright/test";

/**
 * Image Optimization Tests
 *
 * Verifies that all images across the site:
 * - Use Astro's Image component (or optimized formats)
 * - Have proper alt text for accessibility
 * - Have appropriate loading attributes (eager for above-fold, lazy for below-fold)
 * - Are properly sized to prevent layout shift
 * - Use modern formats (WebP, AVIF) where appropriate
 */

const viewports = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1920, height: 1080 },
];

const testPages = [
  { name: "Homepage", url: "/" },
  { name: "Books Index", url: "/books/" },
  { name: "Book Detail", url: "/books/fracture-engine/" },
  { name: "News Index", url: "/news/" },
  { name: "About", url: "/about/" },
];

for (const viewport of viewports) {
  test.describe(`Image Optimization - ${viewport.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
    });

    for (const testPage of testPages) {
      test.describe(`${testPage.name} Page`, () => {
        test("all images should have alt text", async ({ page }) => {
          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          const images = await page.locator("img").all();

          // Page should have at least one image
          expect(images.length).toBeGreaterThan(0);

          for (const img of images) {
            const alt = await img.getAttribute("alt");
            const src = await img.getAttribute("src");

            // All images must have alt attribute (can be empty for decorative images)
            expect(alt).not.toBeNull();

            // Log images with empty alt for manual review
            if (alt === "") {
              console.log(
                `[INFO] Decorative image (empty alt): ${src} on ${testPage.name}`
              );
            }
          }
        });

        test("all images should have explicit width and height to prevent CLS", async ({
          page,
        }) => {
          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          const images = await page.locator("img").all();

          for (const img of images) {
            const width = await img.getAttribute("width");
            const height = await img.getAttribute("height");
            const src = await img.getAttribute("src");

            // Images should have width and height attributes for CLS prevention
            // Exception: Images with explicit dimensions in CSS
            const hasInlineSize = await img.evaluate((el) => {
              const style = window.getComputedStyle(el);
              return style.width !== "auto" && style.height !== "auto";
            });

            if (!hasInlineSize) {
              expect(width || height).toBeTruthy();
            }
          }
        });

        test("above-fold images should use eager loading", async ({ page }) => {
          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          // Get viewport height
          const viewportHeight = viewport.height;

          const images = await page.locator("img").all();

          for (const img of images) {
            const box = await img.boundingBox();
            const loading = await img.getAttribute("loading");
            const src = await img.getAttribute("src");

            if (box && box.y < viewportHeight) {
              // Above-fold image - should be eager or not have loading attribute
              if (loading) {
                expect(loading).toBe("eager");
              }
            }
          }
        });

        test("below-fold images should use lazy loading", async ({ page }) => {
          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          const viewportHeight = viewport.height;

          const images = await page.locator("img").all();

          let belowFoldCount = 0;

          for (const img of images) {
            const box = await img.boundingBox();
            const loading = await img.getAttribute("loading");

            if (box && box.y >= viewportHeight) {
              belowFoldCount++;
              // Below-fold image should be lazy
              if (loading) {
                expect(loading).toBe("lazy");
              }
            }
          }

          // Log if no below-fold images found
          if (belowFoldCount === 0) {
            console.log(
              `[INFO] No below-fold images on ${testPage.name} at ${viewport.name} viewport`
            );
          }
        });

        test("images should use modern formats (WebP, AVIF) or SVG", async ({
          page,
        }) => {
          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          const images = await page.locator("img").all();

          for (const img of images) {
            const src = (await img.getAttribute("src")) || "";
            const srcset = (await img.getAttribute("srcset")) || "";

            // Check if using modern formats
            const hasModernFormat =
              src.includes(".webp") ||
              src.includes(".avif") ||
              src.includes(".svg") ||
              srcset.includes(".webp") ||
              srcset.includes(".avif") ||
              src.startsWith("data:") || // Base64/SVG data URIs
              src.startsWith("/_astro/"); // Astro-optimized images

            expect(hasModernFormat).toBeTruthy();
          }
        });

        test("images should have decoding attribute for performance", async ({
          page,
        }) => {
          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          const images = await page.locator("img").all();

          for (const img of images) {
            const decoding = await img.getAttribute("decoding");
            const loading = await img.getAttribute("loading");

            // If image has loading attribute, it should also have decoding
            if (loading) {
              expect(decoding).toBe("async");
            }
          }
        });

        test("book cover images should have proper dimensions", async ({
          page,
        }) => {
          // Only test book-related pages
          if (!testPage.url.includes("/books/")) {
            test.skip();
          }

          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          const bookCovers = await page
            .locator('img[alt*="Cover"], img[alt*="cover"]')
            .all();

          for (const cover of bookCovers) {
            const width = await cover.getAttribute("width");
            const height = await cover.getAttribute("height");

            // Book covers should have explicit dimensions
            expect(width).not.toBeNull();
            expect(height).not.toBeNull();

            // Aspect ratio should be reasonable for a book cover (roughly 2:3)
            if (width && height) {
              const aspectRatio = parseInt(width) / parseInt(height);
              expect(aspectRatio).toBeGreaterThan(0.6);
              expect(aspectRatio).toBeLessThan(0.75);
            }
          }
        });

        test("no images should have missing/broken src", async ({ page }) => {
          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          const images = await page.locator("img").all();

          for (const img of images) {
            const src = await img.getAttribute("src");
            const srcset = await img.getAttribute("srcset");

            // Image must have either src or srcset
            expect(src || srcset).toBeTruthy();

            // Check if image loaded successfully (naturalWidth > 0 for non-SVG)
            const isLoaded = await img.evaluate((el) => {
              if (el instanceof HTMLImageElement) {
                return el.complete && el.naturalWidth > 0;
              }
              return true; // Not an img element
            });

            expect(isLoaded).toBeTruthy();
          }
        });

        test("responsive images should have srcset attribute", async ({
          page,
        }) => {
          await page.goto(testPage.url);
          await page.waitForLoadState("networkidle");

          // Get large raster images (not SVG, not icons)
          const images = await page.locator("img").all();

          for (const img of images) {
            const src = (await img.getAttribute("src")) || "";
            const srcset = await img.getAttribute("srcset");
            const width = await img.getAttribute("width");

            // Skip SVGs and small icons
            if (src.includes(".svg") || (width && parseInt(width) < 100)) {
              continue;
            }

            // Large raster images should have srcset for responsive loading
            // Astro-optimized images will have /_astro/ in path and should have srcset
            if (src.includes("/_astro/") && !src.includes(".svg")) {
              expect(srcset).toBeTruthy();
            }
          }
        });
      });
    }
  });
}

// Summary test across all pages
test.describe("Image Optimization Summary", () => {
  test("should log total image count across site", async ({ page }) => {
    let totalImages = 0;
    let totalWebP = 0;
    let totalSVG = 0;
    let totalOptimized = 0;

    for (const testPage of testPages) {
      await page.goto(testPage.url);
      await page.waitForLoadState("networkidle");

      const images = await page.locator("img").all();
      totalImages += images.length;

      for (const img of images) {
        const src = (await img.getAttribute("src")) || "";

        if (src.includes(".webp")) totalWebP++;
        if (src.includes(".svg")) totalSVG++;
        if (src.includes("/_astro/")) totalOptimized++;
      }
    }

    console.log(`
      ====== Image Optimization Summary ======
      Total Images: ${totalImages}
      WebP Images: ${totalWebP} (${((totalWebP / totalImages) * 100).toFixed(1)}%)
      SVG Images: ${totalSVG} (${((totalSVG / totalImages) * 100).toFixed(1)}%)
      Astro-Optimized: ${totalOptimized} (${((totalOptimized / totalImages) * 100).toFixed(1)}%)
      ========================================
    `);

    // At least 80% of images should be optimized (WebP, SVG, or Astro-processed)
    const optimizedPercentage =
      ((totalWebP + totalSVG + totalOptimized) / totalImages) * 100;
    expect(optimizedPercentage).toBeGreaterThanOrEqual(80);
  });
});
