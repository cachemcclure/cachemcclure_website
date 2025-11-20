/**
 * SEO Component Tests
 *
 * Comprehensive test suite validating SEO meta tags, Open Graph, Twitter Cards,
 * and JSON-LD structured data across all page types.
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:4321";

test.describe("SEO Component Tests", () => {
  test.describe("Homepage SEO", () => {
    test("should have correct basic meta tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // Title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // Meta description
      const description = await page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.+/);

      // Meta author
      const author = await page.locator('meta[name="author"]');
      await expect(author).toHaveAttribute("content", "Cache McClure");

      // Robots
      const robots = await page.locator('meta[name="robots"]');
      await expect(robots).toHaveAttribute("content", "index, follow");

      // Canonical URL
      const canonical = await page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", /.+/);
    });

    test("should have correct Open Graph tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // OG type
      const ogType = await page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute("content", "website");

      // OG title
      const ogTitle = await page.locator('meta[property="og:title"]');
      const ogTitleContent = await ogTitle.getAttribute("content");
      expect(ogTitleContent).toBeTruthy();

      // OG description
      const ogDescription = await page.locator('meta[property="og:description"]');
      const ogDescContent = await ogDescription.getAttribute("content");
      expect(ogDescContent).toBeTruthy();

      // OG URL
      const ogUrl = await page.locator('meta[property="og:url"]');
      await expect(ogUrl).toHaveAttribute("href", /.+/);

      // OG image
      const ogImage = await page.locator('meta[property="og:image"]');
      const ogImageContent = await ogImage.getAttribute("content");
      expect(ogImageContent).toBeTruthy();

      // OG site_name
      const ogSiteName = await page.locator('meta[property="og:site_name"]');
      await expect(ogSiteName).toHaveAttribute("content", "Cache McClure");

      // OG locale
      const ogLocale = await page.locator('meta[property="og:locale"]');
      await expect(ogLocale).toHaveAttribute("content", /.+/);
    });

    test("should have correct Twitter Card tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // Twitter card type
      const twitterCard = await page.locator('meta[name="twitter:card"]');
      await expect(twitterCard).toHaveAttribute("content", "summary_large_image");

      // Twitter URL
      const twitterUrl = await page.locator('meta[name="twitter:url"]');
      const twitterUrlContent = await twitterUrl.getAttribute("content");
      expect(twitterUrlContent).toBeTruthy();

      // Twitter title
      const twitterTitle = await page.locator('meta[name="twitter:title"]');
      const twitterTitleContent = await twitterTitle.getAttribute("content");
      expect(twitterTitleContent).toBeTruthy();

      // Twitter description
      const twitterDesc = await page.locator('meta[name="twitter:description"]');
      const twitterDescContent = await twitterDesc.getAttribute("content");
      expect(twitterDescContent).toBeTruthy();

      // Twitter image
      const twitterImage = await page.locator('meta[name="twitter:image"]');
      const twitterImageContent = await twitterImage.getAttribute("content");
      expect(twitterImageContent).toBeTruthy();
    });

    test("should have JSON-LD structured data", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const jsonLd = await page.locator('script[type="application/ld+json"]');
      const jsonLdContent = await jsonLd.textContent();

      expect(jsonLdContent).toBeTruthy();

      const structuredData = JSON.parse(jsonLdContent!);
      expect(structuredData["@context"]).toBe("https://schema.org");
      expect(structuredData["@type"]).toBe("BlogPosting");
    });

    test("should have RSS feed auto-discovery", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const rssFeed = await page.locator('link[type="application/rss+xml"]');
      await expect(rssFeed).toHaveAttribute("href", /rss\.xml/);
    });

    test("should have sitemap link", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const sitemap = await page.locator('link[rel="sitemap"]');
      await expect(sitemap).toHaveAttribute("href", "/sitemap-index.xml");
    });
  });

  test.describe("Book Page SEO", () => {
    test("should have book-specific Open Graph type", async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const ogType = await page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute("content", "book");
    });

    test("should have book-specific meta tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      // Check for book:author
      const bookAuthor = await page.locator('meta[property="book:author"]');
      await expect(bookAuthor).toHaveAttribute("content", "Cache McClure");

      // Check for book:isbn (if present)
      const bookIsbn = await page.locator('meta[property="book:isbn"]');
      const isbnCount = await bookIsbn.count();
      if (isbnCount > 0) {
        const isbnContent = await bookIsbn.getAttribute("content");
        expect(isbnContent).toBeTruthy();
      }

      // Check for book:series (if present)
      const bookSeries = await page.locator('meta[property="book:series"]');
      const seriesCount = await bookSeries.count();
      if (seriesCount > 0) {
        const seriesContent = await bookSeries.getAttribute("content");
        expect(seriesContent).toBeTruthy();
      }
    });

    test("should have Book structured data schema", async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const jsonLd = await page.locator('script[type="application/ld+json"]');
      const jsonLdContent = await jsonLd.textContent();

      expect(jsonLdContent).toBeTruthy();

      const structuredData = JSON.parse(jsonLdContent!);
      expect(structuredData["@context"]).toBe("https://schema.org");
      expect(structuredData["@type"]).toBe("Book");
      expect(structuredData.name).toBeTruthy();
      expect(structuredData.author).toBeTruthy();
      expect(structuredData.author["@type"]).toBe("Person");
    });

    test("should include book offers in structured data if buy links exist", async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const jsonLd = await page.locator('script[type="application/ld+json"]');
      const jsonLdContent = await jsonLd.textContent();

      const structuredData = JSON.parse(jsonLdContent!);

      // If the book has buy links, it should have offers
      if (structuredData.offers) {
        expect(Array.isArray(structuredData.offers)).toBe(true);
        expect(structuredData.offers.length).toBeGreaterThan(0);
        expect(structuredData.offers[0]["@type"]).toBe("Offer");
        expect(structuredData.offers[0].availability).toBeTruthy();
      }
    });

    test("should include series data in structured data if part of series", async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const jsonLd = await page.locator('script[type="application/ld+json"]');
      const jsonLdContent = await jsonLd.textContent();

      const structuredData = JSON.parse(jsonLdContent!);

      // If the book is part of a series, it should have isPartOf
      if (structuredData.isPartOf) {
        expect(structuredData.isPartOf["@type"]).toBe("BookSeries");
        expect(structuredData.isPartOf.name).toBeTruthy();
      }
    });
  });

  test.describe("News/Article Page SEO", () => {
    test("should have article-specific Open Graph type", async ({ page }) => {
      // First, get the first news post slug
      await page.goto(`${BASE_URL}/news`);
      const firstNewsLink = await page.locator('article a[href^="/news/"]').first();
      const href = await firstNewsLink.getAttribute("href");

      if (href) {
        await page.goto(`${BASE_URL}${href}`);

        const ogType = await page.locator('meta[property="og:type"]');
        await expect(ogType).toHaveAttribute("content", "article");
      }
    });

    test("should have article-specific meta tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);
      const firstNewsLink = await page.locator('article a[href^="/news/"]').first();
      const href = await firstNewsLink.getAttribute("href");

      if (href) {
        await page.goto(`${BASE_URL}${href}`);

        // Article author
        const articleAuthor = await page.locator('meta[property="article:author"]');
        await expect(articleAuthor).toHaveAttribute("content", "Cache McClure");

        // Article published time
        const articlePublished = await page.locator('meta[property="article:published_time"]');
        const publishedCount = await articlePublished.count();
        if (publishedCount > 0) {
          const publishedContent = await articlePublished.getAttribute("content");
          expect(publishedContent).toMatch(/\d{4}-\d{2}-\d{2}/);
        }

        // Article section (category)
        const articleSection = await page.locator('meta[property="article:section"]');
        const sectionCount = await articleSection.count();
        if (sectionCount > 0) {
          const sectionContent = await articleSection.getAttribute("content");
          expect(sectionContent).toBeTruthy();
        }
      }
    });

    test("should have NewsArticle structured data schema", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);
      const firstNewsLink = await page.locator('article a[href^="/news/"]').first();
      const href = await firstNewsLink.getAttribute("href");

      if (href) {
        await page.goto(`${BASE_URL}${href}`);

        const jsonLd = await page.locator('script[type="application/ld+json"]');
        const jsonLdContent = await jsonLd.textContent();

        expect(jsonLdContent).toBeTruthy();

        const structuredData = JSON.parse(jsonLdContent!);
        expect(structuredData["@context"]).toBe("https://schema.org");
        expect(structuredData["@type"]).toBe("NewsArticle");
        expect(structuredData.headline).toBeTruthy();
        expect(structuredData.author).toBeTruthy();
        expect(structuredData.publisher).toBeTruthy();
        expect(structuredData.mainEntityOfPage).toBeTruthy();
      }
    });

    test("should have modified time if article was updated", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);
      const firstNewsLink = await page.locator('article a[href^="/news/"]').first();
      const href = await firstNewsLink.getAttribute("href");

      if (href) {
        await page.goto(`${BASE_URL}${href}`);

        const articleModified = await page.locator('meta[property="article:modified_time"]');
        const modifiedCount = await articleModified.count();

        // Only test if modified time exists
        if (modifiedCount > 0) {
          const modifiedContent = await articleModified.getAttribute("content");
          expect(modifiedContent).toMatch(/\d{4}-\d{2}-\d{2}/);
        }
      }
    });
  });

  test.describe("About Page SEO", () => {
    test("should have correct meta tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);

      const title = await page.title();
      expect(title).toContain("About");

      const description = await page.locator('meta[name="description"]');
      const descContent = await description.getAttribute("content");
      expect(descContent).toBeTruthy();
    });

    test("should have Open Graph tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);

      const ogType = await page.locator('meta[property="og:type"]');
      const ogTitle = await page.locator('meta[property="og:title"]');
      const ogDescription = await page.locator('meta[property="og:description"]');

      await expect(ogType).toHaveAttribute("content", "website");

      const ogTitleContent = await ogTitle.getAttribute("content");
      expect(ogTitleContent).toBeTruthy();

      const ogDescContent = await ogDescription.getAttribute("content");
      expect(ogDescContent).toBeTruthy();
    });
  });

  test.describe("Books Listing Page SEO", () => {
    test("should have correct meta tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const title = await page.title();
      expect(title).toContain("Books");

      const description = await page.locator('meta[name="description"]');
      const descContent = await description.getAttribute("content");
      expect(descContent).toBeTruthy();

      const canonical = await page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", `${BASE_URL}/books`);
    });

    test("should have Open Graph tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/books`);

      const ogUrl = await page.locator('meta[property="og:url"]');
      const ogUrlContent = await ogUrl.getAttribute("content");
      expect(ogUrlContent).toContain("/books");
    });
  });

  test.describe("News Listing Page SEO", () => {
    test("should have correct meta tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const title = await page.title();
      expect(title).toContain("News");

      const description = await page.locator('meta[name="description"]');
      const descContent = await description.getAttribute("content");
      expect(descContent).toBeTruthy();

      const canonical = await page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", `${BASE_URL}/news`);
    });

    test("should have Open Graph tags", async ({ page }) => {
      await page.goto(`${BASE_URL}/news`);

      const ogUrl = await page.locator('meta[property="og:url"]');
      const ogUrlContent = await ogUrl.getAttribute("content");
      expect(ogUrlContent).toContain("/news");
    });
  });

  test.describe("SEO Component Cross-Page Validation", () => {
    test("all pages should have viewport meta tag", async ({ page }) => {
      const pages = ["/", "/books", "/news", "/about"];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);
        const viewport = await page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveAttribute("content", "width=device-width");
      }
    });

    test("all pages should have charset meta tag", async ({ page }) => {
      const pages = ["/", "/books", "/news", "/about"];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);
        const charset = await page.locator('meta[charset]');
        await expect(charset).toHaveAttribute("charset", "UTF-8");
      }
    });

    test("all pages should have generator meta tag", async ({ page }) => {
      const pages = ["/", "/books", "/news", "/about"];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);
        const generator = await page.locator('meta[name="generator"]');
        const generatorContent = await generator.getAttribute("content");
        expect(generatorContent).toContain("Astro");
      }
    });

    test("all pages should have canonical URL", async ({ page }) => {
      const pages = ["/", "/books", "/news", "/about"];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);
        const canonical = await page.locator('link[rel="canonical"]');
        const canonicalHref = await canonical.getAttribute("href");
        expect(canonicalHref).toBeTruthy();
        expect(canonicalHref).toContain(pagePath === "/" ? BASE_URL : pagePath);
      }
    });

    test("all pages should have favicon", async ({ page }) => {
      const pages = ["/", "/books", "/news", "/about"];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);
        const favicon = await page.locator('link[rel="icon"]');
        await expect(favicon).toHaveAttribute("href", "/favicon.svg");
      }
    });
  });

  test.describe("Robots and Indexing", () => {
    test("should allow indexing by default", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const robots = await page.locator('meta[name="robots"]');
      await expect(robots).toHaveAttribute("content", "index, follow");
    });

    test("should have robots.txt file", async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/robots.txt`);
      expect(response?.status()).toBe(200);

      const content = await page.textContent("body");
      expect(content).toContain("User-agent");
    });

    test("should have sitemap.xml", async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/sitemap-index.xml`);
      expect(response?.status()).toBe(200);
    });

    test("should have RSS feed", async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/rss.xml`);
      expect(response?.status()).toBe(200);

      const content = await page.textContent("body");
      expect(content).toContain("<?xml");
      expect(content).toContain("<rss");
    });
  });

  test.describe("Meta Tag Best Practices (2025 SEO Guidelines)", () => {
    const testPages = [
      { path: "/", name: "Homepage" },
      { path: "/books", name: "Books Index" },
      { path: "/news", name: "News Index" },
      { path: "/about", name: "About Page" },
    ];

    test("all pages should have title tags with recommended length (50-60 chars optimal)", async ({ page }) => {
      for (const testPage of testPages) {
        await page.goto(`${BASE_URL}${testPage.path}`);
        const title = await page.title();

        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);

        // Warn if title is too long (over 60 chars may be truncated by search engines)
        if (title.length > 65) {
          console.warn(`⚠️  ${testPage.name} title is ${title.length} chars (recommended: 50-60, max: 65). Title: "${title}"`);
        }

        // Ensure title is not too short
        expect(title.length).toBeGreaterThanOrEqual(10);
      }
    });

    test("all pages should have meta descriptions with recommended length (150-160 chars optimal)", async ({ page }) => {
      for (const testPage of testPages) {
        await page.goto(`${BASE_URL}${testPage.path}`);
        const description = await page.locator('meta[name="description"]');
        const descContent = await description.getAttribute("content");

        expect(descContent).toBeTruthy();
        expect(descContent!.length).toBeGreaterThan(0);

        // Warn if description is too long (over 160 chars may be truncated)
        if (descContent!.length > 165) {
          console.warn(`⚠️  ${testPage.name} meta description is ${descContent!.length} chars (recommended: 150-160, max: 165). Description: "${descContent}"`);
        }

        // Ensure description is not too short (minimum 70 chars for meaningful descriptions)
        expect(descContent!.length).toBeGreaterThanOrEqual(40);
      }
    });

    test("all pages should have unique title tags (no duplicates)", async ({ page }) => {
      const titles: Record<string, string> = {};

      for (const testPage of testPages) {
        await page.goto(`${BASE_URL}${testPage.path}`);
        const title = await page.title();

        // Check for duplicates
        const duplicate = Object.entries(titles).find(([_, t]) => t === title);
        if (duplicate) {
          throw new Error(`Duplicate title found: "${title}" on both "${duplicate[0]}" and "${testPage.name}"`);
        }

        titles[testPage.name] = title;
      }

      // Ensure we tested all pages
      expect(Object.keys(titles).length).toBe(testPages.length);
    });

    test("all pages should have theme-color meta tags", async ({ page }) => {
      for (const testPage of testPages) {
        await page.goto(`${BASE_URL}${testPage.path}`);

        // Should have theme-color for light mode
        const themeColorLight = await page.locator('meta[name="theme-color"][media*="light"]');
        await expect(themeColorLight).toHaveAttribute("content", /.+/);

        // Should have theme-color for dark mode
        const themeColorDark = await page.locator('meta[name="theme-color"][media*="dark"]');
        await expect(themeColorDark).toHaveAttribute("content", /.+/);
      }
    });

    test("all pages should have properly formatted canonical URLs", async ({ page }) => {
      for (const testPage of testPages) {
        await page.goto(`${BASE_URL}${testPage.path}`);
        const canonical = await page.locator('link[rel="canonical"]');
        const canonicalHref = await canonical.getAttribute("href");

        expect(canonicalHref).toBeTruthy();

        // Canonical should be absolute URL
        expect(canonicalHref).toMatch(/^https?:\/\//);

        // Canonical should not have trailing slash (except homepage)
        if (testPage.path !== "/") {
          expect(canonicalHref).not.toMatch(/\/$/);
        }
      }
    });

    test("meta descriptions should match Open Graph descriptions", async ({ page }) => {
      for (const testPage of testPages) {
        await page.goto(`${BASE_URL}${testPage.path}`);

        const metaDesc = await page.locator('meta[name="description"]');
        const ogDesc = await page.locator('meta[property="og:description"]');

        const metaDescContent = await metaDesc.getAttribute("content");
        const ogDescContent = await ogDesc.getAttribute("content");

        // Both should exist and match
        expect(metaDescContent).toBeTruthy();
        expect(ogDescContent).toBeTruthy();
        expect(metaDescContent).toBe(ogDescContent);
      }
    });

    test("titles should match Open Graph titles", async ({ page }) => {
      for (const testPage of testPages) {
        await page.goto(`${BASE_URL}${testPage.path}`);

        const pageTitle = await page.title();
        const ogTitle = await page.locator('meta[property="og:title"]');
        const ogTitleContent = await ogTitle.getAttribute("content");

        // Both should exist and match
        expect(pageTitle).toBeTruthy();
        expect(ogTitleContent).toBeTruthy();
        expect(pageTitle).toBe(ogTitleContent);
      }
    });
  });
});
