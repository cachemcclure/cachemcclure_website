/**
 * Global Styles & CSS Test Suite
 *
 * Tests core CSS functionality including:
 * - CSS variables (light/dark themes)
 * - Typography (fonts, sizes, line heights)
 * - Animations and transitions
 * - Focus states and accessibility
 * - Link hover effects
 * - Smooth scrolling
 * - Responsive behavior
 */

import { test, expect } from "@playwright/test";

// Test configuration
const BASE_URL = "http://localhost:4321";

test.describe("Global Styles - CSS Variables", () => {
  test("should define all required CSS variables in light mode", async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Set light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });

    const variables = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      return {
        background: styles.getPropertyValue("--background").trim(),
        foreground: styles.getPropertyValue("--foreground").trim(),
        accent: styles.getPropertyValue("--accent").trim(),
        muted: styles.getPropertyValue("--muted").trim(),
        border: styles.getPropertyValue("--border").trim(),
        subtle: styles.getPropertyValue("--subtle").trim(),
      };
    });

    // Verify all variables are defined
    expect(variables.background).toBeTruthy();
    expect(variables.foreground).toBeTruthy();
    expect(variables.accent).toBeTruthy();
    expect(variables.muted).toBeTruthy();
    expect(variables.border).toBeTruthy();
    expect(variables.subtle).toBeTruthy();

    // Verify light mode specific values
    expect(variables.background).toBe("#e0ddd7");
    expect(variables.foreground).toBe("#2d2a26");
    expect(variables.accent).toBe("#92400e");
  });

  test("should define all required CSS variables in dark mode", async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Set dark mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });

    const variables = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      return {
        background: styles.getPropertyValue("--background").trim(),
        foreground: styles.getPropertyValue("--foreground").trim(),
        accent: styles.getPropertyValue("--accent").trim(),
        muted: styles.getPropertyValue("--muted").trim(),
        border: styles.getPropertyValue("--border").trim(),
        subtle: styles.getPropertyValue("--subtle").trim(),
      };
    });

    // Verify all variables are defined
    expect(variables.background).toBeTruthy();
    expect(variables.foreground).toBeTruthy();
    expect(variables.accent).toBeTruthy();
    expect(variables.muted).toBeTruthy();
    expect(variables.border).toBeTruthy();
    expect(variables.subtle).toBeTruthy();

    // Verify dark mode specific values
    expect(variables.background).toBe("#2e2d2b");
    expect(variables.foreground).toBe("#e8e3d9");
    expect(variables.accent).toBe("#c4a574");
  });

  test("should define font family variables", async ({ page }) => {
    await page.goto(BASE_URL);

    const fontVars = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      return {
        heading: styles.getPropertyValue("--font-heading").trim(),
        body: styles.getPropertyValue("--font-body").trim(),
        mono: styles.getPropertyValue("--font-mono").trim(),
      };
    });

    expect(fontVars.heading).toContain("Space Grotesk");
    expect(fontVars.body).toContain("Inter");
    expect(fontVars.mono).toContain("JetBrains Mono");
  });
});

test.describe("Global Styles - Typography", () => {
  test("should apply correct body font and size", async ({ page }) => {
    await page.goto(BASE_URL);

    const bodyStyles = await page.evaluate(() => {
      const styles = getComputedStyle(document.body);
      return {
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });

    // Check body font includes Inter (may have fallbacks)
    expect(bodyStyles.fontFamily).toMatch(/Inter|system-ui/i);

    // Check font size is 18px (1.125rem)
    expect(parseFloat(bodyStyles.fontSize)).toBeGreaterThanOrEqual(18);

    // Check line height is relaxed (1.625)
    const lineHeightRatio =
      parseFloat(bodyStyles.lineHeight) / parseFloat(bodyStyles.fontSize);
    expect(lineHeightRatio).toBeCloseTo(1.625, 1);
  });

  test("should apply Space Grotesk to headings", async ({ page }) => {
    await page.goto(BASE_URL);

    const h1Styles = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return null;
      const styles = getComputedStyle(h1);
      return {
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
      };
    });

    if (h1Styles) {
      expect(h1Styles.fontFamily).toMatch(/Space Grotesk/i);
      expect(parseInt(h1Styles.fontWeight)).toBeGreaterThanOrEqual(600);
    }
  });

  test("should use fluid typography with clamp()", async ({ page }) => {
    await page.goto(BASE_URL);

    // Test at different viewport widths
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    const mobileH1Size = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;
    });

    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    const desktopH1Size = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;
    });

    // Font size should increase on larger screens
    expect(desktopH1Size).toBeGreaterThan(mobileH1Size);

    // Check bounds (36px - 60px, allowing tolerance for clamp calculation)
    expect(mobileH1Size).toBeGreaterThanOrEqual(36);
    expect(desktopH1Size).toBeLessThanOrEqual(60); // Adjusted for browser calc
  });
});

test.describe("Global Styles - Animations", () => {
  test("should have fadeInUp animation defined", async ({ page }) => {
    await page.goto(BASE_URL);

    const hasAnimation = await page.evaluate(() => {
      const div = document.createElement("div");
      div.className = "animate-fade-in-up";
      document.body.appendChild(div);
      const styles = getComputedStyle(div);
      const animationName = styles.animationName;
      document.body.removeChild(div);
      return animationName === "fadeInUp";
    });

    expect(hasAnimation).toBe(true);
  });

  test("should have fadeIn animation defined", async ({ page }) => {
    await page.goto(BASE_URL);

    const hasAnimation = await page.evaluate(() => {
      const div = document.createElement("div");
      div.className = "animate-fade-in";
      document.body.appendChild(div);
      const styles = getComputedStyle(div);
      const animationName = styles.animationName;
      document.body.removeChild(div);
      return animationName === "fadeIn";
    });

    expect(hasAnimation).toBe(true);
  });

  test("should have slideInRight animation defined", async ({ page }) => {
    await page.goto(BASE_URL);

    const hasAnimation = await page.evaluate(() => {
      const div = document.createElement("div");
      div.className = "animate-slide-in-right";
      document.body.appendChild(div);
      const styles = getComputedStyle(div);
      const animationName = styles.animationName;
      document.body.removeChild(div);
      return animationName === "slideInRight";
    });

    expect(hasAnimation).toBe(true);
  });

  test("should have pulse animation defined", async ({ page }) => {
    await page.goto(BASE_URL);

    const hasAnimation = await page.evaluate(() => {
      const div = document.createElement("div");
      div.className = "animate-pulse";
      document.body.appendChild(div);
      const styles = getComputedStyle(div);
      const animationName = styles.animationName;
      document.body.removeChild(div);
      return animationName === "pulse";
    });

    expect(hasAnimation).toBe(true);
  });
});

test.describe("Global Styles - Focus States", () => {
  test("should have focus-visible styles defined for links", async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Check if the CSS rule for a:focus-visible exists
    const hasFocusVisibleStyles = await page.evaluate(() => {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Test Link";
      link.className = "test-focus-link";
      document.body.appendChild(link);

      // Add focus-visible class manually to test the styles
      link.classList.add("focus-visible");

      // Check if outline is defined in CSS for focus-visible
      const styleSheets = Array.from(document.styleSheets);
      let hasFocusRule = false;

      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          hasFocusRule = rules.some(
            rule => {
              const styleRule = rule as CSSStyleRule;
              return (
                styleRule.selectorText &&
                (styleRule.selectorText.includes(":focus-visible") ||
                  styleRule.selectorText.includes("focus-visible"))
              );
            }
          );
          if (hasFocusRule) break;
        } catch (e) {
          // Skip stylesheets that can't be accessed (CORS)
        }
      }

      document.body.removeChild(link);
      return hasFocusRule;
    });

    expect(hasFocusVisibleStyles).toBe(true);
  });

  test("should have focus-visible styles defined for buttons", async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    const hasFocusVisibleStyles = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let hasFocusRule = false;

      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          hasFocusRule = rules.some(
            rule => {
              const styleRule = rule as CSSStyleRule;
              return (
                styleRule.selectorText &&
                styleRule.selectorText.includes(":focus-visible") &&
                (styleRule.selectorText.includes("button") ||
                  styleRule.selectorText.includes("*"))
              );
            }
          );
          if (hasFocusRule) break;
        } catch (e) {
          // Skip stylesheets that can't be accessed (CORS)
        }
      }

      return hasFocusRule;
    });

    expect(hasFocusVisibleStyles).toBe(true);
  });
});

test.describe("Global Styles - Link Styles", () => {
  test("should apply link-underline effect", async ({ page }) => {
    await page.goto(BASE_URL);

    const linkStyles = await page.evaluate(() => {
      const link = document.createElement("a");
      link.href = "#";
      link.className = "link-underline";
      link.textContent = "Test Link";
      document.body.appendChild(link);

      const styles = getComputedStyle(link);
      const beforeHover = {
        position: styles.position,
        textDecoration: styles.textDecoration,
      };

      // Check ::after pseudo-element
      const afterStyles = getComputedStyle(link, "::after");
      const pseudoElement = {
        content: afterStyles.content,
        position: afterStyles.position,
        height: afterStyles.height,
      };

      document.body.removeChild(link);
      return { beforeHover, pseudoElement };
    });

    expect(linkStyles.beforeHover.position).toBe("relative");
    expect(linkStyles.beforeHover.textDecoration).toContain("none");
    expect(linkStyles.pseudoElement.position).toBe("absolute");
  });

  test("should have transitions on interactive elements", async ({ page }) => {
    await page.goto(BASE_URL);

    const hasTransition = await page.evaluate(() => {
      const link = document.createElement("a");
      link.href = "#";
      document.body.appendChild(link);
      const styles = getComputedStyle(link);
      const transition = styles.transition || styles.transitionProperty;
      document.body.removeChild(link);
      return transition && transition !== "none" && transition !== "all 0s";
    });

    expect(hasTransition).toBe(true);
  });
});

test.describe("Global Styles - Smooth Scrolling", () => {
  test("should enable smooth scrolling on html element", async ({ page }) => {
    await page.goto(BASE_URL);

    const scrollBehavior = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).scrollBehavior;
    });

    expect(scrollBehavior).toBe("smooth");
  });

  test("should have scroll margin on target elements", async ({ page }) => {
    await page.goto(BASE_URL);

    const scrollMargin = await page.evaluate(() => {
      const div = document.createElement("div");
      div.id = "test-target";
      document.body.appendChild(div);

      // Simulate :target state
      window.location.hash = "#test-target";

      const styles = getComputedStyle(div);
      const margin = styles.scrollMarginBlock || styles.scrollMarginTop;

      document.body.removeChild(div);
      window.location.hash = "";

      return margin;
    });

    // Should have some scroll margin defined
    expect(scrollMargin).toBeTruthy();
  });
});

test.describe("Global Styles - Utility Classes", () => {
  test("should apply btn-warm styles", async ({ page }) => {
    await page.goto(BASE_URL);

    const btnStyles = await page.evaluate(() => {
      const btn = document.createElement("button");
      btn.className = "btn-warm";
      btn.textContent = "Test Button";
      document.body.appendChild(btn);
      const styles = getComputedStyle(btn);
      const result = {
        backgroundColor: styles.backgroundColor,
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        fontWeight: styles.fontWeight,
      };
      document.body.removeChild(btn);
      return result;
    });

    expect(btnStyles.backgroundColor).toBeTruthy();
    expect(btnStyles.borderRadius).not.toBe("0px");
    expect(parseInt(btnStyles.fontWeight)).toBeGreaterThanOrEqual(600);
  });

  test("should apply btn-outline-warm styles", async ({ page }) => {
    await page.goto(BASE_URL);

    const btnStyles = await page.evaluate(() => {
      const btn = document.createElement("button");
      btn.className = "btn-outline-warm";
      btn.textContent = "Test Button";
      document.body.appendChild(btn);
      const styles = getComputedStyle(btn);
      const result = {
        backgroundColor: styles.backgroundColor,
        borderWidth: styles.borderWidth,
        borderStyle: styles.borderStyle,
      };
      document.body.removeChild(btn);
      return result;
    });

    expect(btnStyles.borderWidth).toBe("2px");
    expect(btnStyles.borderStyle).toBe("solid");
  });

  test("should apply active-nav styles", async ({ page }) => {
    await page.goto(BASE_URL);

    const navStyles = await page.evaluate(() => {
      const link = document.createElement("a");
      link.className = "active-nav";
      link.href = "#";
      link.textContent = "Active Link";
      document.body.appendChild(link);

      const styles = getComputedStyle(link);
      const afterStyles = getComputedStyle(link, "::after");

      const result = {
        position: styles.position,
        fontWeight: styles.fontWeight,
        afterContent: afterStyles.content,
        afterHeight: afterStyles.height,
      };

      document.body.removeChild(link);
      return result;
    });

    expect(navStyles.position).toBe("relative");
    expect(parseInt(navStyles.fontWeight)).toBeGreaterThanOrEqual(600);
    expect(navStyles.afterHeight).toBe("2px");
  });
});

test.describe("Global Styles - Accessibility", () => {
  test("should have skip-link styles", async ({ page }) => {
    await page.goto(BASE_URL);

    const skipLinkStyles = await page.evaluate(() => {
      const link = document.createElement("a");
      link.className = "skip-link";
      link.href = "#main";
      link.textContent = "Skip to main content";
      document.body.appendChild(link);

      const styles = getComputedStyle(link);
      const result = {
        position: styles.position,
        top: styles.top,
      };

      document.body.removeChild(link);
      return result;
    });

    expect(skipLinkStyles.position).toBe("absolute");
    expect(skipLinkStyles.top).toBe("-40px");
  });

  test("should support reduced motion preference", async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(BASE_URL);

    const animationDuration = await page.evaluate(() => {
      const div = document.createElement("div");
      div.className = "animate-fade-in-up";
      document.body.appendChild(div);
      const styles = getComputedStyle(div);
      const duration = styles.animationDuration;
      document.body.removeChild(div);
      return duration;
    });

    // Animation duration should be very short with reduced motion
    const durationMs = parseFloat(animationDuration) * 1000;
    expect(durationMs).toBeLessThan(100);
  });
});

test.describe("Global Styles - Responsive Design", () => {
  test("should adjust max-width at different breakpoints", async ({ page }) => {
    await page.goto(BASE_URL);

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const mobilePadding = await page.evaluate(() => {
      const section = document.querySelector("section");
      return section ? getComputedStyle(section).paddingLeft : "0px";
    });

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopPadding = await page.evaluate(() => {
      const section = document.querySelector("section");
      return section ? getComputedStyle(section).paddingLeft : "0px";
    });

    // Desktop should have more padding
    expect(parseFloat(desktopPadding)).toBeGreaterThanOrEqual(
      parseFloat(mobilePadding)
    );
  });
});

test.describe("Global Styles - Dark Mode Toggle", () => {
  test("should switch between light and dark mode", async ({ page }) => {
    await page.goto(BASE_URL);

    // Start in light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });

    const lightBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });

    const darkBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Background colors should be different
    expect(lightBg).not.toBe(darkBg);
  });
});
