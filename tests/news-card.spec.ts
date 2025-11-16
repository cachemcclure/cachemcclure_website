/**
 * NewsCard Component Tests
 *
 * Comprehensive test suite for the NewsCard component covering:
 * - Visual appearance and layout
 * - Accessibility (WCAG AA compliance)
 * - Responsive design across breakpoints
 * - Different news categories (releases, events, updates)
 * - Keyboard navigation and focus management
 * - Badge display and styling
 * - Date formatting
 */

import { test, expect } from "@playwright/test";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
} as const;

const BASE_URL = "http://localhost:4321";

test.describe("NewsCard Component", () => {
  test.describe("Visual Appearance & Layout", () => {
    test("should display all news card elements correctly on news page", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      // Check if at least one news card exists
      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      await expect(newsCards.first()).toBeVisible();

      // Check for required elements in the first card
      const firstCard = newsCards.first();
      await expect(firstCard.locator("h2, h3")).toBeVisible();
      await expect(firstCard.locator("p")).toBeVisible();
    });

    test("should display category badge on all news cards", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      const count = await newsCards.count();

      for (let i = 0; i < count; i++) {
        const card = newsCards.nth(i);
        // Use more specific selector to avoid matching sr-only text
        const badge = card.locator(
          "span.uppercase:has-text('Release'), span.uppercase:has-text('Event'), span.uppercase:has-text('Update')"
        );
        await expect(badge.first()).toBeVisible();
      }
    });

    test("should display publish date on all news cards", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      const count = await newsCards.count();

      for (let i = 0; i < count; i++) {
        const card = newsCards.nth(i);
        const dateElement = card.locator("time");
        await expect(dateElement).toBeVisible();
      }
    });

    test("should apply proper border and rounded corners on card", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const classList = await firstCard.getAttribute("class");

      expect(classList).toContain("border");
      expect(classList).toContain("rounded");
    });

    test("should have hover transition classes", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const classList = await firstCard.getAttribute("class");

      expect(classList).toContain("transition");
      expect(classList).toContain("hover:border-accent");
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper semantic HTML structure", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();

      // Check for article tag
      expect(await firstCard.evaluate((el) => el.tagName)).toBe("ARTICLE");

      // Check for heading (h2 or h3)
      const heading = firstCard.locator("h2, h3");
      await expect(heading).toBeVisible();

      // Check for link
      const link = firstCard.locator('a[href^="/news/"]');
      await expect(link).toBeVisible();
    });

    test("should have aria-label on news title links", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      const count = await newsCards.count();

      for (let i = 0; i < count; i++) {
        const card = newsCards.nth(i);
        const link = card.locator('a[href^="/news/"]').first();
        const ariaLabel = await link.getAttribute("aria-label");
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel!.length).toBeGreaterThan(0);
      }
    });

    test("should have screen reader only text with category and date info", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();

      const srOnlyText = firstCard.locator(".sr-only");
      await expect(srOnlyText).toBeAttached();
    });

    test("should have proper datetime attribute on time element", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      const count = await newsCards.count();

      for (let i = 0; i < count; i++) {
        const card = newsCards.nth(i);
        const timeElement = card.locator("time");
        const datetime = await timeElement.getAttribute("datetime");
        expect(datetime).toBeTruthy();
        // Should be valid ISO 8601 date
        expect(new Date(datetime!).toString()).not.toBe("Invalid Date");
      }
    });

    test("should support keyboard navigation", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstLink = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first()
        .locator('a[href^="/news/"]')
        .first();

      // Tab to the first link
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Check if focus indicator is visible (focus-visible classes)
      const classList = await firstLink.getAttribute("class");
      expect(classList).toContain("focus-visible:outline");
    });

    test("should have focus-within state on card", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const classList = await firstCard.getAttribute("class");

      expect(classList).toContain("focus-within:border-accent");
    });
  });

  test.describe("Category Badges", () => {
    test("should display correct badge variant for each category", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      const count = await newsCards.count();

      for (let i = 0; i < count; i++) {
        const card = newsCards.nth(i);
        const badge = card.locator("span.uppercase").first();
        await expect(badge).toBeVisible();

        const badgeText = await badge.textContent();
        expect(["Release", "Event", "Update"]).toContain(badgeText?.trim());
      }
    });

    test("should have uppercase styling on badges", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstBadge = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first()
        .locator("span.uppercase")
        .first();

      const classList = await firstBadge.getAttribute("class");
      expect(classList).toContain("uppercase");
    });
  });

  test.describe("Responsive Design - Mobile (375px)", () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test("should display news cards properly on mobile", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      await expect(newsCards.first()).toBeVisible();

      // Check that elements stack vertically
      const firstCard = newsCards.first();
      const cardBox = await firstCard.boundingBox();
      expect(cardBox).toBeTruthy();
    });

    test("should have proper padding and spacing on mobile", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const classList = await firstCard.getAttribute("class");

      expect(classList).toContain("p-4");
    });

    test("should be readable with proper font sizes on mobile", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const title = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first()
        .locator("h2, h3")
        .first();
      const fontSize = await title.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );

      // Font size should be reasonable (at least 16px)
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(16);
    });
  });

  test.describe("Responsive Design - Tablet (768px)", () => {
    test.use({ viewport: VIEWPORTS.tablet });

    test("should display news cards properly on tablet", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      await expect(newsCards.first()).toBeVisible();

      const firstCard = newsCards.first();
      const cardBox = await firstCard.boundingBox();
      expect(cardBox).toBeTruthy();
    });

    test("should maintain proper spacing on tablet", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const classList = await firstCard.getAttribute("class");

      expect(classList).toContain("p-4");
      expect(classList).toContain("gap-");
    });
  });

  test.describe("Responsive Design - Desktop (1920px)", () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test("should display news cards properly on desktop", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      await expect(newsCards.first()).toBeVisible();

      const firstCard = newsCards.first();
      const cardBox = await firstCard.boundingBox();
      expect(cardBox).toBeTruthy();
      expect(cardBox!.width).toBeGreaterThan(300);
    });

    test("should have appropriate max-width on desktop", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      const firstCard = newsCards.first();
      const cardBox = await firstCard.boundingBox();

      // Should not be excessively wide (actual width ~1248px with padding)
      expect(cardBox!.width).toBeLessThan(1300);
    });
  });

  test.describe("Hover Effects", () => {
    test("should have hover effect classes defined", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const classList = await firstCard.getAttribute("class");

      expect(classList).toContain("hover:border-accent");
      expect(classList).toContain("hover:shadow-md");
    });

    test("should have transition classes for smooth hover", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const classList = await firstCard.getAttribute("class");

      expect(classList).toContain("transition");
    });
  });

  test.describe("Content Display", () => {
    test("should display title as clickable link", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const titleLink = firstCard.locator('a[href^="/news/"]').first();
      const href = await titleLink.getAttribute("href");

      expect(href).toBeTruthy();
      expect(href).toMatch(/^\/news\/.+/);
    });

    test("should display description text", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const firstCard = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first();
      const description = firstCard.locator("p").first();

      await expect(description).toBeVisible();
      const descText = await description.textContent();
      expect(descText).toBeTruthy();
      expect(descText!.length).toBeGreaterThan(0);
    });

    test("should have proper text color for description", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const description = page
        .locator("article")
        .filter({
          has: page.locator('a[href^="/news/"]'),
        })
        .first()
        .locator("p")
        .first();
      const classList = await description.getAttribute("class");

      expect(classList).toContain("text-foreground");
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle very long titles gracefully", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      const count = await newsCards.count();

      for (let i = 0; i < count; i++) {
        const card = newsCards.nth(i);
        const title = card.locator("h2, h3").first();
        const titleBox = await title.boundingBox();

        // Title should not overflow card
        if (titleBox) {
          const cardBox = await card.boundingBox();
          expect(titleBox.width).toBeLessThanOrEqual(cardBox!.width);
        }
      }
    });

    test("should handle very long descriptions gracefully", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/news`);

      const newsCards = page.locator("article").filter({
        has: page.locator('a[href^="/news/"]'),
      });
      const count = await newsCards.count();

      for (let i = 0; i < count; i++) {
        const card = newsCards.nth(i);
        const description = card.locator("p").first();
        const descBox = await description.boundingBox();

        // Description should not overflow card
        if (descBox) {
          const cardBox = await card.boundingBox();
          expect(descBox.width).toBeLessThanOrEqual(cardBox!.width);
        }
      }
    });
  });
});
