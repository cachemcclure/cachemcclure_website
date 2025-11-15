/**
 * BaseLayout Integration Tests
 *
 * Tests to verify that the new BaseLayout component works correctly:
 * - Header and Footer are included automatically
 * - Meta tags are present and correct
 * - Main content area is properly structured
 * - Layout works across different pages
 */

import { chromium } from "playwright";

const BASE_URL = "http://localhost:4321";

async function runTests() {
  console.log("🧪 Starting BaseLayout Integration Tests...\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let passedTests = 0;
  let failedTests = 0;

  // Helper function to run a test
  async function test(name, testFn) {
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
      failedTests++;
    }
  }

  // Test 1: Homepage loads successfully
  await test("Homepage loads successfully", async () => {
    const response = await page.goto(BASE_URL, {
      waitUntil: "networkidle",
    });
    if (response.status() !== 200) {
      throw new Error(`Expected status 200, got ${response.status()}`);
    }
  });

  // Test 2: Header component is present
  await test("Header component is present", async () => {
    const header = await page.locator("header").count();
    if (header !== 1) {
      throw new Error(`Expected 1 header, found ${header}`);
    }
  });

  // Test 3: Footer component is present
  await test("Footer component is present", async () => {
    const footer = await page.locator("footer").count();
    if (footer !== 1) {
      throw new Error(`Expected 1 footer, found ${footer}`);
    }
  });

  // Test 4: Main content area exists
  await test("Main content area exists with correct ID", async () => {
    const main = await page.locator('main#main-content').count();
    if (main !== 1) {
      throw new Error(`Expected 1 main#main-content, found ${main}`);
    }
  });

  // Test 5: Navigation links in header
  await test("Header contains navigation links", async () => {
    const booksLink = await page.locator('header a[href="/books"]').count();
    const aboutLink = await page.locator('header a[href="/about"]').count();
    if (booksLink === 0 || aboutLink === 0) {
      throw new Error("Missing navigation links in header");
    }
  });

  // Test 6: Meta tags are present
  await test("Essential meta tags are present", async () => {
    const charset = await page.locator('meta[charset="UTF-8"]').count();
    const viewport = await page.locator('meta[name="viewport"]').count();
    const description = await page.locator('meta[name="description"]').count();

    if (charset !== 1 || viewport !== 1 || description !== 1) {
      throw new Error(
        `Missing meta tags: charset=${charset}, viewport=${viewport}, description=${description}`
      );
    }
  });

  // Test 7: Open Graph tags are present
  await test("Open Graph meta tags are present", async () => {
    const ogTitle = await page.locator('meta[property="og:title"]').count();
    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .count();
    const ogImage = await page.locator('meta[property="og:image"]').count();

    if (ogTitle !== 1 || ogDescription !== 1 || ogImage !== 1) {
      throw new Error(
        `Missing OG tags: title=${ogTitle}, description=${ogDescription}, image=${ogImage}`
      );
    }
  });

  // Test 8: Twitter Card tags are present
  await test("Twitter Card meta tags are present", async () => {
    const twitterCard = await page
      .locator('meta[property="twitter:card"]')
      .count();
    const twitterTitle = await page
      .locator('meta[property="twitter:title"]')
      .count();

    if (twitterCard !== 1 || twitterTitle !== 1) {
      throw new Error(
        `Missing Twitter tags: card=${twitterCard}, title=${twitterTitle}`
      );
    }
  });

  // Test 9: Page title is set
  await test("Page title is set correctly", async () => {
    const title = await page.title();
    if (!title || title.trim() === "") {
      throw new Error("Page title is empty");
    }
    if (!title.includes("Cache McClure")) {
      throw new Error(`Expected title to include "Cache McClure", got "${title}"`);
    }
  });

  // Test 10: Footer contains social links
  await test("Footer contains social links component", async () => {
    const socials = await page.locator("footer").locator("a[href*='//']").count();
    if (socials === 0) {
      throw new Error("No social links found in footer");
    }
  });

  // Test 11: Canonical URL is set
  await test("Canonical URL is set", async () => {
    const canonical = await page.locator('link[rel="canonical"]').count();
    if (canonical !== 1) {
      throw new Error(`Expected 1 canonical link, found ${canonical}`);
    }
  });

  // Test 12: Favicon is linked
  await test("Favicon is linked", async () => {
    const favicon = await page.locator('link[rel="icon"]').count();
    if (favicon !== 1) {
      throw new Error(`Expected 1 favicon link, found ${favicon}`);
    }
  });

  // Test 13: Structured data (JSON-LD) is present
  await test("Structured data (JSON-LD) is present", async () => {
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .count();
    if (jsonLd === 0) {
      throw new Error("No JSON-LD structured data found");
    }
  });

  // Test 14: RSS feed is linked
  await test("RSS feed is linked", async () => {
    const rss = await page
      .locator('link[type="application/rss+xml"]')
      .count();
    if (rss !== 1) {
      throw new Error(`Expected 1 RSS link, found ${rss}`);
    }
  });

  // Test 15: Theme toggle button exists (if enabled)
  await test("Theme toggle functionality exists", async () => {
    const themeBtn = await page.locator("#theme-btn").count();
    const themeScript = await page.locator('script[src="/toggle-theme.js"]').count();
    if (themeBtn === 0 && themeScript === 0) {
      throw new Error("No theme toggle functionality found");
    }
  });

  // Test 16: Skip to content link exists (accessibility)
  await test("Skip to content link exists (accessibility)", async () => {
    const skipLink = await page.locator('a[href="#main-content"]').count();
    if (skipLink === 0) {
      throw new Error("No skip to content link found");
    }
  });

  // Test 17: Main content is within max-width container
  await test("Layout has proper max-width container", async () => {
    const container = await page.locator(".max-w-app").count();
    if (container === 0) {
      throw new Error("No max-width container found");
    }
  });

  // Test 18: Language attribute is set
  await test("HTML lang attribute is set", async () => {
    const lang = await page.locator("html[lang]").count();
    if (lang !== 1) {
      throw new Error("HTML lang attribute not set");
    }
  });

  // Test 19: Dir attribute is set (for RTL support)
  await test("HTML dir attribute is set", async () => {
    const dir = await page.locator("html[dir]").count();
    if (dir !== 1) {
      throw new Error("HTML dir attribute not set");
    }
  });

  // Test 20: Copyright year is current
  await test("Footer contains copyright with current year", async () => {
    const currentYear = new Date().getFullYear();
    const footerText = await page.locator("footer").textContent();
    if (!footerText.includes(currentYear.toString())) {
      throw new Error(`Footer doesn't contain current year ${currentYear}`);
    }
  });

  await browser.close();

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log("=".repeat(50));

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log("\n🎉 All tests passed!");
  }
}

runTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
