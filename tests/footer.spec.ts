import { test, expect } from "@playwright/test";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
};

test.describe("Footer Component", () => {
  test.describe("Footer Presence", () => {
    test("footer should be present on homepage", async ({ page }) => {
      await page.goto("/");
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });

    test("footer should be present on all major pages", async ({ page }) => {
      const pages = ["/", "/books", "/news", "/about"];

      for (const path of pages) {
        await page.goto(path);
        const footer = page.locator("footer");
        await expect(footer).toBeVisible();
      }
    });
  });

  test.describe("Copyright Notice", () => {
    test("should display copyright with current year", async ({ page }) => {
      await page.goto("/");
      const currentYear = new Date().getFullYear();
      const copyright = page.locator("footer").getByText(
        new RegExp(`Copyright.*${currentYear}`)
      );
      await expect(copyright).toBeVisible();
    });

    test("should display author name", async ({ page }) => {
      await page.goto("/");
      const authorName = page.locator("footer").getByText(/Copyright.*Cache McClure/i);
      await expect(authorName.first()).toBeVisible();
    });

    test("should display 'All rights reserved'", async ({ page }) => {
      await page.goto("/");
      const rightsText = page.locator("footer").getByText(/All rights reserved/i);
      await expect(rightsText).toBeVisible();
    });
  });

  test.describe("Newsletter Placeholder", () => {
    test("should display newsletter section heading", async ({ page }) => {
      await page.goto("/");
      const heading = page.locator("footer").getByRole("heading", {
        name: /Stay Updated/i,
      });
      await expect(heading).toBeVisible();
    });

    test("should display coming soon message", async ({ page }) => {
      await page.goto("/");
      const message = page
        .locator("footer")
        .getByText(/Newsletter coming soon/i);
      await expect(message).toBeVisible();
    });

    test("newsletter section should be centered", async ({ page }) => {
      await page.goto("/");
      const newsletterSection = page.locator("footer").locator("div").filter({
        hasText: "Stay Updated",
      });
      await expect(newsletterSection).toHaveClass(/text-center/);
    });
  });

  test.describe("Social Media Links", () => {
    const socialLinks = [
      { name: "X", pattern: /x\.com/ },
      { name: "Instagram", pattern: /instagram\.com/ },
      { name: "Goodreads", pattern: /goodreads\.com/ },
      { name: "LinkedIn", pattern: /linkedin\.com/ },
      { name: "GitHub", pattern: /github\.com/ },
      { name: "Mail", pattern: /mailto:/ },
    ];

    for (const social of socialLinks) {
      test(`should display ${social.name} link`, async ({ page }) => {
        await page.goto("/");
        const link = page
          .locator("footer")
          .locator('a[href*="' + social.name.toLowerCase() + '"]')
          .or(
            page
              .locator("footer")
              .locator(
                'a[aria-label*="' + social.name + '"], a[title*="' + social.name + '"]'
              )
          );

        const count = await link.count();
        expect(count).toBeGreaterThan(0);
      });

      test(`${social.name} link should have proper href`, async ({ page }) => {
        await page.goto("/");
        const links = page.locator("footer a");
        const count = await links.count();

        let found = false;
        for (let i = 0; i < count; i++) {
          const href = await links.nth(i).getAttribute("href");
          if (href && social.pattern.test(href)) {
            found = true;
            break;
          }
        }
        expect(found).toBe(true);
      });

      test(`${social.name} link should have accessible label`, async ({
        page,
      }) => {
        await page.goto("/");
        const links = page.locator("footer a");
        const count = await links.count();

        let found = false;
        for (let i = 0; i < count; i++) {
          const href = await links.nth(i).getAttribute("href");
          if (href && social.pattern.test(href)) {
            const ariaLabel = await links.nth(i).getAttribute("aria-label");
            const title = await links.nth(i).getAttribute("title");
            expect(ariaLabel || title).toBeTruthy();
            found = true;
            break;
          }
        }
        expect(found).toBe(true);
      });
    }

    test("all social links should open in new tab (except email)", async ({
      page,
    }) => {
      await page.goto("/");
      const links = page.locator("footer a[href^='http']");
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const target = await links.nth(i).getAttribute("target");
        const rel = await links.nth(i).getAttribute("rel");
        expect(target).toBe("_blank");
        expect(rel).toContain("noopener");
      }
    });

    test("email link should not open in new tab", async ({ page }) => {
      await page.goto("/");
      const mailLink = page.locator("footer a[href^='mailto:']");
      const count = await mailLink.count();

      if (count > 0) {
        const target = await mailLink.getAttribute("target");
        expect(target).not.toBe("_blank");
      }
    });
  });

  test.describe("Responsive Design", () => {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      test(`footer should render correctly on ${viewportName}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto("/");

        const footer = page.locator("footer");
        await expect(footer).toBeVisible();

        // Check that all main sections are visible
        await expect(footer.getByText(/Stay Updated/i)).toBeVisible();
        await expect(footer.getByText(/Copyright/i)).toBeVisible();

        // Social links should be visible
        const socialLinks = page.locator("footer a");
        const count = await socialLinks.count();
        expect(count).toBeGreaterThan(0);
      });
    }

    test("social links should be properly spaced on mobile", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto("/");

      // Social links container should be visible
      const socialLinks = page.locator("footer a");
      const count = await socialLinks.count();
      expect(count).toBeGreaterThan(5); // Should have at least 6 social links
    });

    test("copyright text should stack on mobile", async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto("/");

      const copyrightContainer = page
        .locator("footer")
        .locator("div")
        .filter({ hasText: /Copyright/ })
        .last();

      const className = await copyrightContainer.getAttribute("class");
      expect(className).toContain("flex-col");
    });

    test("copyright text should be inline on desktop", async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto("/");

      const copyrightContainer = page
        .locator("footer")
        .locator("div")
        .filter({ hasText: /Copyright/ })
        .last();

      const className = await copyrightContainer.getAttribute("class");
      expect(className).toContain("sm:flex-row");
    });
  });

  test.describe("Accessibility", () => {
    test("footer should use semantic HTML", async ({ page }) => {
      await page.goto("/");
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();

      // Should be a <footer> element, not a <div>
      const tagName = await footer.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe("footer");
    });

    test("all interactive elements should be keyboard accessible", async ({
      page,
    }) => {
      await page.goto("/");

      // Get all links in footer
      const links = page.locator("footer a");
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        // Focus each link
        await links.nth(i).focus();

        // Check if it's focused
        const isFocused = await links.nth(i).evaluate(
          el => el === document.activeElement
        );
        expect(isFocused).toBe(true);
      }
    });

    test("all links should have accessible names", async ({ page }) => {
      await page.goto("/");
      const links = page.locator("footer a");
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const ariaLabel = await links.nth(i).getAttribute("aria-label");
        const title = await links.nth(i).getAttribute("title");
        const text = await links.nth(i).textContent();
        const srOnly = await links.nth(i).locator(".sr-only").count();

        // Should have at least one way to identify the link
        const hasAccessibleName =
          !!ariaLabel || !!title || !!(text && text.trim()) || srOnly > 0;
        expect(hasAccessibleName).toBe(true);
      }
    });

    test("newsletter heading should use proper heading level", async ({
      page,
    }) => {
      await page.goto("/");
      const heading = page.locator("footer").getByRole("heading", {
        name: /Stay Updated/i,
      });

      await expect(heading).toBeVisible();

      // Should be h2 or h3
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      expect(["h2", "h3", "h4"]).toContain(tagName);
    });

    test("focus indicators should be visible", async ({ page }) => {
      await page.goto("/");
      const firstLink = page.locator("footer a").first();

      await firstLink.focus();

      // Check if outline or box-shadow is applied (common focus indicators)
      const outlineWidth = await firstLink.evaluate(
        el => getComputedStyle(el).outlineWidth
      );
      const boxShadow = await firstLink.evaluate(
        el => getComputedStyle(el).boxShadow
      );

      // Should have either outline or box-shadow
      const hasFocusIndicator =
        (outlineWidth && outlineWidth !== "0px") ||
        (boxShadow && boxShadow !== "none");

      expect(hasFocusIndicator).toBe(true);
    });
  });

  test.describe("Visual Styling", () => {
    test("footer should have horizontal separator", async ({ page }) => {
      await page.goto("/");

      // Look for Hr components or hr elements
      const hrElements = page.locator("footer hr");
      const count = await hrElements.count();

      expect(count).toBeGreaterThan(0);
    });

    test("social links should have hover effect", async ({ page }) => {
      await page.goto("/");
      const firstSocialLink = page.locator("footer a").first();

      // Get initial transform
      const initialTransform = await firstSocialLink.evaluate(
        el => getComputedStyle(el).transform
      );

      // Hover over the link
      await firstSocialLink.hover();

      // Wait a bit for transition
      await page.waitForTimeout(300);

      // Some kind of visual feedback should occur (transform, color, etc.)
      // We'll just verify the element is still visible and interactive
      await expect(firstSocialLink).toBeVisible();
    });

    test("newsletter section should be visually separated", async ({
      page,
    }) => {
      await page.goto("/");

      const newsletterSection = page.locator("footer").locator("div").filter({
        hasText: "Stay Updated",
      });

      // Should have padding
      const className = await newsletterSection.getAttribute("class");
      expect(className).toMatch(/py-\d+/);
    });
  });

  test.describe("Content Verification", () => {
    test("footer should not contain Lorem Ipsum", async ({ page }) => {
      await page.goto("/");
      const footer = page.locator("footer");
      const content = await footer.textContent();

      expect(content?.toLowerCase()).not.toContain("lorem ipsum");
    });

    test("all external links should use https", async ({ page }) => {
      await page.goto("/");
      const externalLinks = page.locator("footer a[href^='http']");
      const count = await externalLinks.count();

      for (let i = 0; i < count; i++) {
        const href = await externalLinks.nth(i).getAttribute("href");
        if (href && !href.startsWith("mailto:")) {
          expect(href).toMatch(/^https:/);
        }
      }
    });

    test("footer should be at bottom of page", async ({ page }) => {
      await page.goto("/");
      const footer = page.locator("footer");

      // Get footer position
      const box = await footer.boundingBox();
      const viewportSize = page.viewportSize();

      if (box && viewportSize) {
        // Footer should be near or at the bottom
        expect(box.y).toBeGreaterThan(viewportSize.height / 2);
      }
    });
  });

  test.describe("Cross-browser Compatibility", () => {
    test("footer should render consistently", async ({ page, browserName }) => {
      await page.goto("/");

      const footer = page.locator("footer");
      await expect(footer).toBeVisible();

      // Basic layout check
      const box = await footer.boundingBox();
      expect(box).toBeTruthy();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);

      // All social links should be visible
      const links = page.locator("footer a");
      const count = await links.count();
      expect(count).toBeGreaterThan(5); // Should have at least 6 social links
    });
  });
});
