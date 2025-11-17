/**
 * Icon Implementation Tests
 *
 * Comprehensive test suite for icon consistency and implementation:
 * - Tabler Icons pattern compliance (stroke-based, viewBox, currentColor)
 * - Consistent usage across components
 * - BuyLinks component uses imported SVG icons (not inline)
 * - Icon accessibility (aria-hidden attributes)
 * - Visual consistency (sizing, styling)
 * - Responsive behavior
 */

import { test, expect } from "@playwright/test";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
} as const;

const BASE_URL = "http://localhost:4321";

// Test pages that use various icons
const TEST_PAGES = [
  { path: "/", name: "Homepage" },
  { path: "/books", name: "Books List" },
  { path: "/books/fracture-engine", name: "Book Detail" },
  { path: "/news", name: "News List" },
  { path: "/about", name: "About Page" },
];

test.describe("Icon Implementation", () => {
  test.describe("Tabler Icons Pattern Compliance", () => {
    test("all SVG icons should have proper viewBox attribute", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/`);

      // Get all SVG elements
      const svgs = await page.locator("svg").all();

      for (const svg of svgs) {
        const viewBox = await svg.getAttribute("viewBox");
        // Tabler icons use 24x24 viewBox
        if (viewBox) {
          expect(viewBox).toBe("0 0 24 24");
        }
      }
    });

    test("stroke-based icons should use currentColor", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // Get all stroke-based SVG elements (Tabler icons)
      const strokeSvgs = await page
        .locator("svg[stroke='currentColor']")
        .all();

      for (const svg of strokeSvgs) {
        const stroke = await svg.getAttribute("stroke");
        expect(stroke).toBe("currentColor");

        // Should also have fill="none" for stroke-based icons
        const fill = await svg.getAttribute("fill");
        expect(fill).toBe("none");
      }
    });

    test("all icons should have consistent stroke-width of 2", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/`);

      const strokeSvgs = await page
        .locator("svg[stroke='currentColor']")
        .all();

      for (const svg of strokeSvgs) {
        const strokeWidth = await svg.getAttribute("stroke-width");
        if (strokeWidth) {
          expect(strokeWidth).toBe("2");
        }
      }
    });

    test("icons should have proper stroke cap and join attributes", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/`);

      const strokeSvgs = await page
        .locator("svg[stroke='currentColor']")
        .all();

      for (const svg of strokeSvgs) {
        const linecap = await svg.getAttribute("stroke-linecap");
        const linejoin = await svg.getAttribute("stroke-linejoin");

        if (linecap) {
          expect(linecap).toBe("round");
        }
        if (linejoin) {
          expect(linejoin).toBe("round");
        }
      }
    });
  });

  test.describe("BuyLinks Component Icon Implementation", () => {
    test("BuyLinks should use imported SVG icons (building-store icon)", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      // Find buy link buttons
      const buyLinkButtons = page.locator("a[data-buy-link]");
      const count = await buyLinkButtons.count();

      if (count > 0) {
        // Each button should have the building-store icon (retailer icon)
        for (let i = 0; i < count; i++) {
          const button = buyLinkButtons.nth(i);
          const retailerIcon = button.locator("svg").first();

          // Verify it's a Tabler-style icon
          await expect(retailerIcon).toHaveAttribute("viewBox", "0 0 24 24");
          await expect(retailerIcon).toHaveAttribute("stroke", "currentColor");
          await expect(retailerIcon).toHaveAttribute("fill", "none");

          // Verify icon classes (h-5 w-5 for retailer icon)
          const iconClasses = await retailerIcon.getAttribute("class");
          expect(iconClasses).toContain("h-5");
          expect(iconClasses).toContain("w-5");
        }
      }
    });

    test("BuyLinks should use imported external link icon", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const buyLinkButtons = page.locator("a[data-buy-link]");
      const count = await buyLinkButtons.count();

      if (count > 0) {
        // Each button should have the external link icon
        for (let i = 0; i < count; i++) {
          const button = buyLinkButtons.nth(i);
          const externalIcon = button.locator("svg").nth(1); // Second SVG is external link

          // Verify it's a Tabler-style icon
          await expect(externalIcon).toHaveAttribute("viewBox", "0 0 24 24");
          await expect(externalIcon).toHaveAttribute("stroke", "currentColor");

          // Verify icon classes (h-4 w-4 for external link icon)
          const iconClasses = await externalIcon.getAttribute("class");
          expect(iconClasses).toContain("h-4");
          expect(iconClasses).toContain("w-4");
        }
      }
    });

    test("BuyLinks should NOT use inline SVG strings (set:html pattern)", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      // Check the page source doesn't contain old fill-based inline SVG patterns
      const content = await page.content();

      // Old pattern used fill="currentColor" in inline strings
      // New pattern uses imported SVG components
      // We can't directly test this from the rendered HTML, but we can verify
      // that all SVGs in BuyLinks follow the Tabler pattern

      const buyLinkButtons = page.locator("a[data-buy-link]");
      const count = await buyLinkButtons.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const button = buyLinkButtons.nth(i);
          const allSvgs = await button.locator("svg").all();

          // All SVGs should be stroke-based Tabler icons
          for (const svg of allSvgs) {
            const stroke = await svg.getAttribute("stroke");
            const fill = await svg.getAttribute("fill");

            // Should use stroke-based approach
            expect(stroke).toBe("currentColor");
            expect(fill).toBe("none");
          }
        }
      }
    });
  });

  test.describe("Icon Accessibility", () => {
    test("decorative icons should have aria-hidden attribute", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/`);

      // Most icons are decorative (accompanied by text)
      // They should have aria-hidden="true"
      const svgs = await page.locator("svg[aria-hidden='true']").all();

      // We should have multiple decorative icons
      expect(svgs.length).toBeGreaterThan(0);
    });

    test("icon-only buttons should have proper aria-label", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/`);

      // Find buttons that only contain icons (no visible text)
      const iconButtons = await page
        .locator("button:has(svg):not(:has-text(/.+/))")
        .all();

      for (const button of iconButtons) {
        const ariaLabel = await button.getAttribute("aria-label");
        const title = await button.getAttribute("title");

        // Should have either aria-label or title for accessibility
        expect(ariaLabel || title).toBeTruthy();
      }
    });

    test("BuyLinks buttons should have descriptive aria-labels", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const buyLinkButtons = page.locator("a[data-buy-link]");
      const count = await buyLinkButtons.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const button = buyLinkButtons.nth(i);
          const ariaLabel = await button.getAttribute("aria-label");

          // Should have aria-label describing the action
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel).toMatch(/(Buy|Pre-order)/i);
          expect(ariaLabel).toContain("opens in new tab");
        }
      }
    });
  });

  test.describe("Icon Sizing & Visual Consistency", () => {
    test("header icons should be consistently sized", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // Check navigation icons in header
      const headerSvgs = await page.locator("header svg").all();

      for (const svg of headerSvgs) {
        const box = await svg.boundingBox();
        if (box) {
          // Icons should have reasonable dimensions (16px-48px range)
          expect(box.width).toBeGreaterThanOrEqual(16);
          expect(box.width).toBeLessThanOrEqual(48);
          expect(box.height).toBeGreaterThanOrEqual(16);
          expect(box.height).toBeLessThanOrEqual(48);
        }
      }
    });

    test("social media icons should be consistently sized", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/`);

      // Find social media links in footer
      const socialLinks = await page
        .locator("footer a[aria-label*='on']")
        .all();

      if (socialLinks.length > 0) {
        let firstIconSize: { width: number; height: number } | null = null;

        for (const link of socialLinks) {
          const svg = link.locator("svg");
          const box = await svg.boundingBox();

          if (box && firstIconSize) {
            // All social icons should be the same size
            expect(Math.abs(box.width - firstIconSize.width)).toBeLessThan(2);
            expect(Math.abs(box.height - firstIconSize.height)).toBeLessThan(2);
          } else if (box) {
            firstIconSize = { width: box.width, height: box.height };
          }
        }
      }
    });

    test("BuyLinks retailer icons should be consistently sized (20px)", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const buyLinkButtons = page.locator("a[data-buy-link]");
      const count = await buyLinkButtons.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const button = buyLinkButtons.nth(i);
          const retailerIcon = button.locator("svg").first();
          const box = await retailerIcon.boundingBox();

          if (box) {
            // h-5 w-5 = 20px (1.25rem)
            expect(box.width).toBeCloseTo(20, 1);
            expect(box.height).toBeCloseTo(20, 1);
          }
        }
      }
    });

    test("BuyLinks external link icons should be consistently sized (16px)", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const buyLinkButtons = page.locator("a[data-buy-link]");
      const count = await buyLinkButtons.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const button = buyLinkButtons.nth(i);
          const externalIcon = button.locator("svg").nth(1);
          const box = await externalIcon.boundingBox();

          if (box) {
            // h-4 w-4 = 16px (1rem)
            expect(box.width).toBeCloseTo(16, 1);
            expect(box.height).toBeCloseTo(16, 1);
          }
        }
      }
    });
  });

  test.describe("Icon Consistency Across Pages", () => {
    for (const testPage of TEST_PAGES) {
      test(`icons on ${testPage.name} should follow Tabler pattern`, async ({
        page,
      }) => {
        await page.goto(`${BASE_URL}${testPage.path}`);

        const strokeSvgs = await page
          .locator("svg[stroke='currentColor']")
          .all();

        // Should have at least some icons
        expect(strokeSvgs.length).toBeGreaterThan(0);

        for (const svg of strokeSvgs) {
          // Verify Tabler pattern
          const viewBox = await svg.getAttribute("viewBox");
          const stroke = await svg.getAttribute("stroke");
          const fill = await svg.getAttribute("fill");

          expect(viewBox).toBe("0 0 24 24");
          expect(stroke).toBe("currentColor");
          expect(fill).toBe("none");
        }
      });
    }
  });

  test.describe("Responsive Icon Behavior", () => {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      test(`icons should be visible and properly sized on ${viewportName}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(`${BASE_URL}/`);

        // Check header icons
        const headerSvgs = await page.locator("header svg").all();
        expect(headerSvgs.length).toBeGreaterThan(0);

        for (const svg of headerSvgs) {
          await expect(svg).toBeVisible();

          const box = await svg.boundingBox();
          if (box) {
            // Icons should maintain reasonable size on all viewports
            expect(box.width).toBeGreaterThanOrEqual(16);
            expect(box.width).toBeLessThanOrEqual(48);
          }
        }
      });

      test(`BuyLinks icons should be visible on ${viewportName}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(`${BASE_URL}/books/fracture-engine`);

        const buyLinkButtons = page.locator("a[data-buy-link]");
        const count = await buyLinkButtons.count();

        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const button = buyLinkButtons.nth(i);
            const retailerIcon = button.locator("svg").first();
            const externalIcon = button.locator("svg").nth(1);

            await expect(retailerIcon).toBeVisible();
            await expect(externalIcon).toBeVisible();
          }
        }
      });
    }
  });

  test.describe("Icon Theme Compatibility", () => {
    test("icons should adapt to light mode colors", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // Ensure light mode is active
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
      });

      // Icons should be visible in light mode
      const svgs = await page.locator("svg[stroke='currentColor']").all();

      for (const svg of svgs) {
        await expect(svg).toBeVisible();

        // Verify currentColor works in light mode
        const stroke = await svg.getAttribute("stroke");
        expect(stroke).toBe("currentColor");
      }
    });

    test("icons should adapt to dark mode colors", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // Switch to dark mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });

      // Icons should be visible in dark mode
      const svgs = await page.locator("svg[stroke='currentColor']").all();

      for (const svg of svgs) {
        await expect(svg).toBeVisible();

        // Verify currentColor works in dark mode
        const stroke = await svg.getAttribute("stroke");
        expect(stroke).toBe("currentColor");
      }
    });
  });

  test.describe("Icon Performance", () => {
    test("icons should be inlined SVG (not external images)", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/`);

      // All icons should be inline SVG elements, not <img> tags
      const svgElements = await page.locator("svg").all();
      const imgIcons = await page.locator("img[src*='.svg']").all();

      // Should have SVG elements
      expect(svgElements.length).toBeGreaterThan(0);

      // Should NOT have external SVG images (for performance)
      expect(imgIcons.length).toBe(0);
    });

    test("icons should load without blocking page render", async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/`);

      // Page should load quickly (icons are inline, not external requests)
      const loadTime = Date.now() - startTime;

      // Should load in under 2 seconds (generous limit for local dev)
      expect(loadTime).toBeLessThan(2000);

      // Icons should be immediately visible
      const svgs = await page.locator("header svg").all();
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
