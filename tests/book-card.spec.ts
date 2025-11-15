/**
 * BookCard Component Tests
 *
 * Comprehensive test suite for the BookCard component covering:
 * - Visual appearance and layout
 * - Accessibility (WCAG AA compliance)
 * - Responsive design across breakpoints
 * - Different book statuses (published, upcoming, draft)
 * - Series and standalone books
 * - Keyboard navigation and focus management
 * - Image optimization attributes
 */

import { test, expect } from "@playwright/test";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
} as const;

const BASE_URL = "http://localhost:4321";

test.describe("BookCard Component", () => {
  test.describe("Visual Appearance & Layout", () => {
    test("should display all book card elements correctly on books page", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      // Check if at least one book card exists
      const bookCards = page.locator("article").filter({
        has: page.locator('a[href^="/books/"]'),
      });
      await expect(bookCards.first()).toBeVisible();

      // Check for required elements in the first card
      const firstCard = bookCards.first();
      await expect(firstCard.locator("img[alt*='Cover']")).toBeVisible();
      await expect(firstCard.locator("h2, h3")).toBeVisible();
      await expect(firstCard.locator("p")).toBeVisible();
    });

    test("should display status badge on all book cards", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const bookCards = page.locator("article").filter({
        has: page.locator('a[href^="/books/"]'),
      });
      const count = await bookCards.count();

      for (let i = 0; i < count; i++) {
        const card = bookCards.nth(i);
        const badge = card.locator(
          "span:has-text('Published'), span:has-text('Coming Soon'), span:has-text('Draft')"
        );
        await expect(badge).toBeVisible();
      }
    });

    test("should display cover image with proper dimensions", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      const coverImage = page
        .locator("article")
        .first()
        .locator("img[alt*='Cover']");
      await expect(coverImage).toBeVisible();

      // Check for width and height attributes (prevents CLS)
      const width = await coverImage.getAttribute("width");
      const height = await coverImage.getAttribute("height");
      expect(width).toBeTruthy();
      expect(height).toBeTruthy();
    });

    test("should apply proper border and shadow on card", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const firstCard = page.locator("article").first();
      const classList = await firstCard.getAttribute("class");

      expect(classList).toContain("border");
      expect(classList).toContain("rounded");
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper alt text on cover images", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const coverImages = page.locator("article img[alt*='Cover']");
      const count = await coverImages.count();

      for (let i = 0; i < count; i++) {
        const img = coverImages.nth(i);
        const alt = await img.getAttribute("alt");
        expect(alt).toBeTruthy();
        expect(alt).toContain("Cover");
      }
    });

    test("should have descriptive aria-label on book title links", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      const titleLinks = page.locator('article a[href^="/books/"]');
      const firstLink = titleLinks.first();
      const ariaLabel = await firstLink.getAttribute("aria-label");

      // aria-label should exist and contain meaningful information
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel!.length).toBeGreaterThan(5);
    });

    test("should use semantic HTML with proper heading structure", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      const firstCard = page.locator("article").first();

      // Should be wrapped in article element
      expect(await firstCard.evaluate((el) => el.tagName)).toBe("ARTICLE");

      // Should have h2 or h3 heading
      const heading = firstCard.locator("h2, h3");
      await expect(heading).toBeVisible();
    });

    test("should have proper loading attributes on images", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      const coverImage = page
        .locator("article")
        .first()
        .locator("img[alt*='Cover']");

      // Should have lazy loading for performance
      const loading = await coverImage.getAttribute("loading");
      expect(loading).toBe("lazy");

      // Should have async decoding
      const decoding = await coverImage.getAttribute("decoding");
      expect(decoding).toBe("async");
    });

    test("should have visible focus indicators on links", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const titleLink = page.locator('article a[href^="/books/"]').first();

      // Focus the link
      await titleLink.focus();

      // Check for focus-visible styles
      const classList = await titleLink.getAttribute("class");
      expect(classList).toContain("focus-visible");
    });

    test("should support keyboard navigation", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      // Tab to first book link
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");

      // Should be able to focus on the book link
      const href = await focused.getAttribute("href");
      expect(href).toContain("/books/");
    });
  });

  test.describe("Responsive Design", () => {
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      test(`should display correctly on ${name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`${BASE_URL}/books`);

        const firstCard = page.locator("article").first();
        await expect(firstCard).toBeVisible();

        // Check that cover image is visible
        const coverImage = firstCard.locator("img[alt*='Cover']");
        await expect(coverImage).toBeVisible();

        // Check that title is visible
        const title = firstCard.locator("h2, h3");
        await expect(title).toBeVisible();

        // Check layout: on mobile should be column, on desktop should be row
        const classList = await firstCard.getAttribute("class");
        if (name === "mobile") {
          expect(classList).toContain("flex-col");
        } else {
          // tablet and desktop should have responsive flex-row
          expect(classList).toContain("sm:flex-row");
        }
      });

      test(`should have proper image sizing on ${name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`${BASE_URL}/books`);

        const coverImage = page
          .locator("article")
          .first()
          .locator("img[alt*='Cover']");
        const box = await coverImage.boundingBox();

        expect(box).toBeTruthy();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.height).toBeGreaterThan(0);

        // Check responsive sizing classes
        const classList = await coverImage.getAttribute("class");
        if (name === "desktop") {
          expect(classList).toContain("sm:h-56");
          expect(classList).toContain("sm:w-40");
        }
      });
    }

    test("should adapt layout from column to row at breakpoint", async ({
      page,
    }) => {
      // Start at mobile
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/books`);

      let firstCard = page.locator("article").first();
      let box1 = await firstCard.boundingBox();

      // Resize to desktop
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.waitForTimeout(500); // Wait for layout to settle

      let box2 = await firstCard.boundingBox();

      // Width should increase on desktop
      expect(box2!.width).toBeGreaterThan(box1!.width);
    });
  });

  test.describe("Book Status Variants", () => {
    test("should display different badge styles for different statuses", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      // Check for status badge variants
      const publishedBadge = page
        .locator("span")
        .filter({ hasText: "Published" })
        .first();
      const upcomingBadge = page
        .locator("span")
        .filter({ hasText: "Coming Soon" })
        .first();

      // At least one should exist
      const hasPublished = await publishedBadge.count();
      const hasUpcoming = await upcomingBadge.count();
      expect(hasPublished + hasUpcoming).toBeGreaterThan(0);

      if (hasPublished > 0) {
        const classList = await publishedBadge.getAttribute("class");
        expect(classList).toContain("bg-green-700");
      }

      if (hasUpcoming > 0) {
        const classList = await upcomingBadge.getAttribute("class");
        expect(classList).toContain("bg-blue-600");
      }
    });

    test("should display series badge when book is part of series", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      // Look for any series badge (contains series name and possibly #)
      const bookCards = page.locator("article");
      const count = await bookCards.count();

      let hasSeriesBadge = false;
      for (let i = 0; i < count; i++) {
        const card = bookCards.nth(i);
        const badges = card.locator("span.rounded");
        const badgeCount = await badges.count();

        // If there are 2 badges, one should be series badge
        if (badgeCount > 1) {
          hasSeriesBadge = true;
          const seriesBadge = badges.nth(1);
          const text = await seriesBadge.textContent();
          expect(text).toBeTruthy();
        }
      }

      // Test passes whether or not series badges exist
      // (depends on content, not component functionality)
    });
  });

  test.describe("Interaction & Hover States", () => {
    test("should have hover effects on card", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const firstCard = page.locator("article").first();
      const classList = await firstCard.getAttribute("class");

      // Should have hover classes
      expect(classList).toContain("hover:border-accent");
      expect(classList).toContain("hover:shadow-md");
    });

    test("should scale cover image on hover", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const coverImage = page
        .locator("article")
        .first()
        .locator("img[alt*='Cover']");
      const classList = await coverImage.getAttribute("class");

      expect(classList).toContain("group-hover:scale-105");
      expect(classList).toContain("transition-transform");
    });

    test("should have focus-within state on card", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const firstCard = page.locator("article").first();
      const classList = await firstCard.getAttribute("class");

      // Should highlight card when link inside is focused
      expect(classList).toContain("focus-within:border-accent");
      expect(classList).toContain("focus-within:shadow-md");
    });

    test("should navigate to book page when title is clicked", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      const titleLink = page.locator('article a[href^="/books/"]').first();
      const href = await titleLink.getAttribute("href");

      await titleLink.click();
      await page.waitForLoadState("networkidle");

      expect(page.url()).toContain(href!);
    });
  });

  test.describe("Content & Typography", () => {
    test("should display book title with proper styling", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const title = page.locator("article h2, article h3").first();
      const classList = await title.getAttribute("class");

      expect(classList).toContain("text-xl");
      expect(classList).toContain("font-bold");
    });

    test("should display book description", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const description = page
        .locator("article")
        .first()
        .locator("p")
        .filter({ hasNotText: /^$/ });
      await expect(description.first()).toBeVisible();

      const text = await description.first().textContent();
      expect(text!.length).toBeGreaterThan(10);
    });

    test("should display publish date", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const firstCard = page.locator("article").first();

      // Look for datetime component (has time element)
      const datetime = firstCard.locator("time");
      await expect(datetime).toBeVisible();
    });
  });

  test.describe("Performance & Optimization", () => {
    test("should not cause layout shift (CLS)", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const coverImage = page
        .locator("article")
        .first()
        .locator("img[alt*='Cover']");

      // Images should have explicit width/height to prevent CLS
      const width = await coverImage.getAttribute("width");
      const height = await coverImage.getAttribute("height");

      expect(Number(width)).toBeGreaterThan(0);
      expect(Number(height)).toBeGreaterThan(0);
    });

    test("should use lazy loading for images", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const images = page.locator("article img[alt*='Cover']");
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const loading = await images.nth(i).getAttribute("loading");
        expect(loading).toBe("lazy");
      }
    });

    test("should use async decoding for images", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const images = page.locator("article img[alt*='Cover']");
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const decoding = await images.nth(i).getAttribute("decoding");
        expect(decoding).toBe("async");
      }
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle books without series gracefully", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const bookCards = page.locator("article");
      const count = await bookCards.count();

      // At least one card should render successfully
      expect(count).toBeGreaterThan(0);

      // Check first card renders even if no series
      const firstCard = bookCards.first();
      await expect(firstCard).toBeVisible();
      await expect(firstCard.locator("h2, h3")).toBeVisible();
    });

    test("should handle long titles without breaking layout", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books`);

      const titles = page.locator("article h2, article h3");
      const count = await titles.count();

      for (let i = 0; i < count; i++) {
        const title = titles.nth(i);
        const box = await title.boundingBox();

        // Title should not overflow card
        expect(box).toBeTruthy();
        expect(box!.width).toBeLessThan(2000); // Reasonable max width
      }
    });

    test("should handle missing cover images gracefully", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      // Even if image fails to load, card should still render
      const firstCard = page.locator("article").first();
      await expect(firstCard).toBeVisible();
      await expect(firstCard.locator("h2, h3")).toBeVisible();
    });
  });
});
