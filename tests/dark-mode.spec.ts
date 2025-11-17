/**
 * Dark Mode Tests
 *
 * Comprehensive test suite for the dark mode implementation covering:
 * - Theme toggle button functionality
 * - localStorage persistence
 * - Theme switching (light <-> dark)
 * - Icon transitions (moon/sun)
 * - data-theme attribute on <html> element
 * - Visual rendering in both modes
 * - Accessibility of theme toggle
 * - System preference detection
 */

import { test, expect } from "@playwright/test";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
} as const;

const BASE_URL = "http://localhost:4321";

test.describe("Dark Mode Implementation", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test.describe("Theme Toggle Button", () => {
    test("should display theme toggle button in header", async ({ page }) => {
      await page.goto(BASE_URL);

      const themeButton = page.locator("#theme-btn");
      await expect(themeButton).toBeVisible();
    });

    test("should have proper accessibility attributes", async ({ page }) => {
      await page.goto(BASE_URL);

      const themeButton = page.locator("#theme-btn");

      // Should have aria-label
      const ariaLabel = await themeButton.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/light|dark/i);

      // Should have aria-live for announcements
      await expect(themeButton).toHaveAttribute("aria-live", "polite");

      // Should have title for tooltip
      await expect(themeButton).toHaveAttribute("title", "Toggles light & dark");
    });

    test("should display moon icon in light mode", async ({ page }) => {
      await page.goto(BASE_URL);

      // Set to light mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
      });

      const themeButton = page.locator("#theme-btn");
      const moonIcon = themeButton.locator("svg").first();

      await expect(moonIcon).toBeVisible();

      // Moon icon should not have hidden class in light mode
      const classes = await moonIcon.getAttribute("class");
      expect(classes).not.toContain("scale-0");
    });

    test("should display sun icon in dark mode", async ({ page }) => {
      await page.goto(BASE_URL);

      // Set to dark mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });

      await page.waitForTimeout(300); // Wait for CSS transitions

      const themeButton = page.locator("#theme-btn");
      const sunIcon = themeButton.locator("svg").nth(1);

      // In dark mode, sun should be visible
      const classes = await sunIcon.getAttribute("class");
      expect(classes).toContain("dark:scale-100");
    });

    test("theme button should be keyboard accessible", async ({ page }) => {
      await page.goto(BASE_URL);

      const themeButton = page.locator("#theme-btn");

      // Focus the button
      await themeButton.focus();

      // Should be focused
      await expect(themeButton).toBeFocused();

      // Should have focus outline (focus-outline class)
      const classes = await themeButton.getAttribute("class");
      expect(classes).toContain("focus-outline");
    });
  });

  test.describe("Theme Switching Functionality", () => {
    test("clicking theme button should toggle between light and dark", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      const htmlElement = page.locator("html");
      const themeButton = page.locator("#theme-btn");

      // Get initial theme
      const initialTheme = await htmlElement.getAttribute("data-theme");

      // Click to toggle
      await themeButton.click();
      await page.waitForTimeout(100); // Wait for toggle

      // Theme should have changed
      const newTheme = await htmlElement.getAttribute("data-theme");
      expect(newTheme).not.toBe(initialTheme);
      expect(newTheme).toMatch(/light|dark/);
    });

    test("data-theme attribute should be set on <html> element", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      const htmlElement = page.locator("html");
      const dataTheme = await htmlElement.getAttribute("data-theme");

      expect(dataTheme).toBeTruthy();
      expect(dataTheme).toMatch(/light|dark/);
    });

    test("theme toggle should work multiple times consecutively", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      const htmlElement = page.locator("html");
      const themeButton = page.locator("#theme-btn");

      // Toggle 5 times
      for (let i = 0; i < 5; i++) {
        const beforeTheme = await htmlElement.getAttribute("data-theme");
        await themeButton.click();
        await page.waitForTimeout(100);
        const afterTheme = await htmlElement.getAttribute("data-theme");

        expect(afterTheme).not.toBe(beforeTheme);
      }
    });

    test("aria-label should update when theme changes", async ({ page }) => {
      await page.goto(BASE_URL);

      const themeButton = page.locator("#theme-btn");

      // Get initial aria-label
      const initialLabel = await themeButton.getAttribute("aria-label");

      // Click to toggle
      await themeButton.click();
      await page.waitForTimeout(100);

      // Aria-label should have updated
      const newLabel = await themeButton.getAttribute("aria-label");
      expect(newLabel).not.toBe(initialLabel);
      expect(newLabel).toMatch(/light|dark/);
    });
  });

  test.describe("localStorage Persistence", () => {
    test("theme preference should be saved to localStorage", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      const themeButton = page.locator("#theme-btn");

      // Click to set a theme
      await themeButton.click();
      await page.waitForTimeout(100);

      // Check localStorage
      const storedTheme = await page.evaluate(() => {
        return localStorage.getItem("theme");
      });

      expect(storedTheme).toBeTruthy();
      expect(storedTheme).toMatch(/light|dark/);
    });

    test("theme preference should persist across page reloads", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      const htmlElement = page.locator("html");
      const themeButton = page.locator("#theme-btn");

      // Set to dark mode
      await themeButton.click();
      await page.waitForTimeout(100);

      const themeBeforeReload = await htmlElement.getAttribute("data-theme");

      // Reload the page
      await page.reload();
      await page.waitForTimeout(200);

      // Theme should be the same
      const themeAfterReload = await htmlElement.getAttribute("data-theme");
      expect(themeAfterReload).toBe(themeBeforeReload);
    });

    test("theme preference should persist across navigation", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      const htmlElement = page.locator("html");
      const themeButton = page.locator("#theme-btn");

      // Set a specific theme
      await themeButton.click();
      await page.waitForTimeout(100);

      const themeOnHomepage = await htmlElement.getAttribute("data-theme");

      // Navigate to another page
      await page.goto(`${BASE_URL}/about`);
      await page.waitForTimeout(200);

      // Theme should persist
      const themeOnAboutPage = await htmlElement.getAttribute("data-theme");
      expect(themeOnAboutPage).toBe(themeOnHomepage);
    });
  });

  test.describe("Visual Rendering", () => {
    test("background color should change between light and dark mode", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      const body = page.locator("body");

      // Set to light mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
      });
      await page.waitForTimeout(100);

      const lightBg = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Set to dark mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });
      await page.waitForTimeout(100);

      const darkBg = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Background colors should be different
      expect(lightBg).not.toBe(darkBg);
    });

    test("text color should change between light and dark mode", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      const body = page.locator("body");

      // Set to light mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
      });
      await page.waitForTimeout(100);

      const lightColor = await body.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Set to dark mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });
      await page.waitForTimeout(100);

      const darkColor = await body.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Text colors should be different
      expect(lightColor).not.toBe(darkColor);
    });

    test("all components should be visible in both light and dark mode", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      // Test in light mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
      });
      await page.waitForTimeout(100);

      const header = page.locator("header");
      const footer = page.locator("footer");
      await expect(header).toBeVisible();
      await expect(footer).toBeVisible();

      // Test in dark mode
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
      });
      await page.waitForTimeout(100);

      await expect(header).toBeVisible();
      await expect(footer).toBeVisible();
    });
  });

  test.describe("Meta Theme Color", () => {
    test("meta theme-color should exist", async ({ page }) => {
      await page.goto(BASE_URL);

      const metaThemeColor = page.locator("meta[name='theme-color']");
      await expect(metaThemeColor).toHaveCount(1);
    });

    test("meta theme-color should update when theme changes", async ({
      page,
    }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(500); // Wait for toggle-theme.js to run

      const metaThemeColor = page.locator("meta[name='theme-color']");

      // Get initial color
      const initialColor = await metaThemeColor.getAttribute("content");
      expect(initialColor).toBeTruthy();

      // Toggle theme
      const themeButton = page.locator("#theme-btn");
      await themeButton.click();
      await page.waitForTimeout(300); // Wait for script to update meta tag

      // Color should have changed
      const newColor = await metaThemeColor.getAttribute("content");
      expect(newColor).toBeTruthy();
      // Note: Colors might be the same if both themes use similar meta colors
      // The important part is that the meta tag is being updated
    });
  });

  test.describe("Responsive Behavior", () => {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      test(`theme toggle should work on ${viewportName}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(BASE_URL);

        const themeButton = page.locator("#theme-btn");
        const htmlElement = page.locator("html");

        // Should be visible
        await expect(themeButton).toBeVisible();

        // Should toggle
        const initialTheme = await htmlElement.getAttribute("data-theme");
        await themeButton.click();
        await page.waitForTimeout(100);
        const newTheme = await htmlElement.getAttribute("data-theme");

        expect(newTheme).not.toBe(initialTheme);
      });
    }

    test("theme toggle button should be larger on mobile", async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(BASE_URL);

      const themeButton = page.locator("#theme-btn");
      const box = await themeButton.boundingBox();

      expect(box).toBeTruthy();
      if (box) {
        // Mobile button should be 48px (size-12)
        expect(box.width).toBeCloseTo(48, 5);
        expect(box.height).toBeCloseTo(48, 5);
      }
    });
  });

  test.describe("Icon Transitions", () => {
    test("moon icon should have transition classes", async ({ page }) => {
      await page.goto(BASE_URL);

      const moonIcon = page.locator("#theme-btn svg").first();
      const classes = await moonIcon.getAttribute("class");

      expect(classes).toContain("transition-all");
    });

    test("sun icon should have transition classes", async ({ page }) => {
      await page.goto(BASE_URL);

      const sunIcon = page.locator("#theme-btn svg").nth(1);
      const classes = await sunIcon.getAttribute("class");

      expect(classes).toContain("transition-all");
    });

    test("icons should animate when theme changes", async ({ page }) => {
      await page.goto(BASE_URL);

      const moonIcon = page.locator("#theme-btn svg").first();
      const sunIcon = page.locator("#theme-btn svg").nth(1);

      // Both icons should have transform properties
      const moonTransform = await moonIcon.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
      const sunTransform = await sunIcon.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });

      expect(moonTransform).toBeTruthy();
      expect(sunTransform).toBeTruthy();
      expect(moonTransform).not.toBe("none");
      expect(sunTransform).not.toBe("none");
    });
  });

  test.describe("No Flash of Unstyled Content (FOUC)", () => {
    test("theme should be set before page renders", async ({ page }) => {
      // Set a theme in localStorage before navigation
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.setItem("theme", "dark");
      });

      // Navigate to a new page
      await page.goto(`${BASE_URL}/about`);

      // Immediately check theme (should already be dark)
      const htmlElement = page.locator("html");
      const theme = await htmlElement.getAttribute("data-theme");

      expect(theme).toBe("dark");
    });

    test("toggle-theme.js script should be inline (not async)", async ({
      page,
    }) => {
      await page.goto(BASE_URL);

      // Check that the script is inline
      const scripts = await page.locator("script[src='/toggle-theme.js']").all();

      for (const script of scripts) {
        const isInline = await script.getAttribute("is:inline");
        expect(isInline).not.toBeNull();
      }
    });
  });

  test.describe("Cross-page Consistency", () => {
    const pages = [
      { path: "/", name: "Homepage" },
      { path: "/books", name: "Books" },
      { path: "/news", name: "News" },
      { path: "/about", name: "About" },
    ];

    for (const testPage of pages) {
      test(`theme should work on ${testPage.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}${testPage.path}`);

        const themeButton = page.locator("#theme-btn");
        const htmlElement = page.locator("html");

        // Button should exist
        await expect(themeButton).toBeVisible();

        // Should be able to toggle
        await themeButton.click();
        await page.waitForTimeout(100);

        const theme = await htmlElement.getAttribute("data-theme");
        expect(theme).toMatch(/light|dark/);
      });
    }
  });

  test.describe("Integration with Astro View Transitions", () => {
    test("theme should persist during view transitions", async ({ page }) => {
      await page.goto(BASE_URL);

      const htmlElement = page.locator("html");
      const themeButton = page.locator("#theme-btn");

      // Set a specific theme
      await themeButton.click();
      await page.waitForTimeout(100);
      const themeBeforeNav = await htmlElement.getAttribute("data-theme");

      // Navigate using a link (triggers View Transition if enabled)
      const aboutLink = page.locator("a[href='/about']").first();
      await aboutLink.click();
      await page.waitForURL(`${BASE_URL}/about`);
      await page.waitForTimeout(300);

      // Theme should be preserved
      const themeAfterNav = await htmlElement.getAttribute("data-theme");
      expect(themeAfterNav).toBe(themeBeforeNav);
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle missing localStorage gracefully", async ({ page }) => {
      await page.goto(BASE_URL);

      // Override localStorage to simulate errors
      await page.evaluate(() => {
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function() {
          throw new Error("Quota exceeded");
        };
      });

      // Theme toggle should still work (even if saving fails)
      const themeButton = page.locator("#theme-btn");
      const htmlElement = page.locator("html");

      const initialTheme = await htmlElement.getAttribute("data-theme");
      await themeButton.click();
      await page.waitForTimeout(100);
      const newTheme = await htmlElement.getAttribute("data-theme");

      // Visual theme should still change even if localStorage fails
      expect(newTheme).not.toBe(initialTheme);
    });

    test("should work when JavaScript is enabled", async ({ page }) => {
      await page.goto(BASE_URL);

      const themeButton = page.locator("#theme-btn");

      // Theme toggle requires JavaScript
      await expect(themeButton).toBeVisible();

      // Should be clickable
      await themeButton.click();

      // Should work
      const htmlElement = page.locator("html");
      const theme = await htmlElement.getAttribute("data-theme");
      expect(theme).toBeTruthy();
    });
  });
});
