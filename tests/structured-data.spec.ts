/**
 * Structured Data (JSON-LD) Tests
 *
 * Validates that all pages include proper JSON-LD structured data according to schema.org specifications.
 * Tests cover:
 * - Homepage: WebSite and Person schemas
 * - Book pages: Book schema with proper author, ISBN, reviews, etc.
 * - News pages: NewsArticle schema with proper metadata
 * - About page: Person schema for the author
 *
 * References:
 * - https://schema.org/
 * - https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */

import { test, expect } from "@playwright/test";

// Helper function to get and parse JSON-LD data from a page
async function getStructuredData(page: any): Promise<any[]> {
  const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
  const data: any[] = [];

  for (const script of jsonLdScripts) {
    const content = await script.textContent();
    if (content) {
      try {
        const parsed = JSON.parse(content);
        data.push(parsed);
      } catch (e) {
        console.error("Failed to parse JSON-LD:", content);
        throw e;
      }
    }
  }

  return data;
}

// Helper to find a specific schema type in structured data
function findSchema(data: any[], type: string): any | null {
  for (const item of data) {
    if (item["@type"] === type) {
      return item;
    }
    // Check if it's using @graph
    if (item["@graph"]) {
      for (const graphItem of item["@graph"]) {
        if (graphItem["@type"] === type) {
          return graphItem;
        }
      }
    }
  }
  return null;
}

test.describe("Structured Data - Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have JSON-LD structured data", async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').count();
    expect(scripts).toBeGreaterThan(0);
  });

  test("should have valid JSON-LD syntax", async ({ page }) => {
    const data = await getStructuredData(page);
    expect(data.length).toBeGreaterThan(0);

    // Each item should have @context
    for (const item of data) {
      expect(item).toHaveProperty("@context");
      expect(item["@context"]).toBe("https://schema.org");
    }
  });

  test("should include WebSite schema", async ({ page }) => {
    const data = await getStructuredData(page);
    const websiteSchema = findSchema(data, "WebSite");

    expect(websiteSchema).toBeTruthy();
    expect(websiteSchema).toHaveProperty("@type", "WebSite");
    expect(websiteSchema).toHaveProperty("url");
    expect(websiteSchema).toHaveProperty("name");
    expect(websiteSchema).toHaveProperty("description");
    expect(websiteSchema).toHaveProperty("inLanguage");

    // Check URL is valid
    expect(websiteSchema.url).toMatch(/^https?:\/\//);
  });

  test("WebSite schema should have potential search action", async ({ page }) => {
    const data = await getStructuredData(page);
    const websiteSchema = findSchema(data, "WebSite");

    expect(websiteSchema).toHaveProperty("potentialAction");
    expect(websiteSchema.potentialAction).toHaveProperty("@type", "SearchAction");
    expect(websiteSchema.potentialAction).toHaveProperty("target");
    expect(websiteSchema.potentialAction.target).toHaveProperty("urlTemplate");
  });

  test("should include Person schema for author", async ({ page }) => {
    const data = await getStructuredData(page);
    const personSchema = findSchema(data, "Person");

    expect(personSchema).toBeTruthy();
    expect(personSchema).toHaveProperty("@type", "Person");
    expect(personSchema).toHaveProperty("name");
    expect(personSchema).toHaveProperty("url");
    expect(personSchema).toHaveProperty("jobTitle");

    // Verify author details
    expect(personSchema.name).toBeTruthy();
    expect(personSchema.jobTitle).toContain("Author");
  });

  test("Person schema should have valid image URL", async ({ page }) => {
    const data = await getStructuredData(page);
    const personSchema = findSchema(data, "Person");

    expect(personSchema).toHaveProperty("image");
    expect(personSchema.image).toMatch(/^https?:\/\//);
  });
});

test.describe("Structured Data - Book Pages", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the first book page
    await page.goto("/books");
    const firstBookLink = await page.locator('article a').first();
    await firstBookLink.click();
    await page.waitForLoadState("networkidle");
  });

  test("should have JSON-LD structured data", async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').count();
    expect(scripts).toBeGreaterThan(0);
  });

  test("should include Book schema", async ({ page }) => {
    const data = await getStructuredData(page);
    const bookSchema = findSchema(data, "Book");

    expect(bookSchema).toBeTruthy();
    expect(bookSchema).toHaveProperty("@type", "Book");
    expect(bookSchema).toHaveProperty("name");
    expect(bookSchema).toHaveProperty("description");
  });

  test("Book schema should have author information", async ({ page }) => {
    const data = await getStructuredData(page);
    const bookSchema = findSchema(data, "Book");

    expect(bookSchema).toHaveProperty("author");
    expect(bookSchema.author).toHaveProperty("@type", "Person");
    expect(bookSchema.author).toHaveProperty("name");
    expect(bookSchema.author).toHaveProperty("url");

    // Verify author name is present
    expect(bookSchema.author.name).toBeTruthy();
  });

  test("Book schema should have image if cover exists", async ({ page }) => {
    const data = await getStructuredData(page);
    const bookSchema = findSchema(data, "Book");

    // Check if image exists (it should for books with covers)
    if (bookSchema.image) {
      expect(bookSchema.image).toMatch(/^https?:\/\//);
    }
  });

  test("Book schema should have datePublished if available", async ({ page }) => {
    const data = await getStructuredData(page);
    const bookSchema = findSchema(data, "Book");

    // Check if datePublished exists (should for published books)
    if (bookSchema.datePublished) {
      // Should be ISO 8601 format
      expect(bookSchema.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  test("Book schema should have ISBN if available", async ({ page }) => {
    const data = await getStructuredData(page);
    const bookSchema = findSchema(data, "Book");

    // ISBN is optional but should be valid if present
    if (bookSchema.isbn) {
      expect(typeof bookSchema.isbn).toBe("string");
      expect(bookSchema.isbn.length).toBeGreaterThan(0);
    }
  });

  test("Book schema should have series information if part of series", async ({ page }) => {
    const data = await getStructuredData(page);
    const bookSchema = findSchema(data, "Book");

    // Check if it's part of a series
    if (bookSchema.isPartOf) {
      expect(bookSchema.isPartOf).toHaveProperty("@type", "BookSeries");
      expect(bookSchema.isPartOf).toHaveProperty("name");

      // Position is optional but should be number if present
      if (bookSchema.isPartOf.position) {
        expect(typeof bookSchema.isPartOf.position).toBe("number");
      }
    }
  });

  test("Book schema should have offers (buy links) if available", async ({ page }) => {
    const data = await getStructuredData(page);
    const bookSchema = findSchema(data, "Book");

    // Check if offers exist
    if (bookSchema.offers) {
      expect(Array.isArray(bookSchema.offers)).toBe(true);

      // Each offer should have required properties
      for (const offer of bookSchema.offers) {
        expect(offer).toHaveProperty("@type", "Offer");
        expect(offer).toHaveProperty("availability");
        expect(offer).toHaveProperty("url");
        expect(offer).toHaveProperty("seller");

        // Seller should be an Organization
        expect(offer.seller).toHaveProperty("@type", "Organization");
        expect(offer.seller).toHaveProperty("name");
      }
    }
  });

  test("Book schema should have reviews if available", async ({ page }) => {
    const data = await getStructuredData(page);
    const bookSchema = findSchema(data, "Book");

    // Check if reviews exist
    if (bookSchema.review) {
      expect(Array.isArray(bookSchema.review)).toBe(true);

      // Each review should have required properties
      for (const review of bookSchema.review) {
        expect(review).toHaveProperty("@type", "Review");
        expect(review).toHaveProperty("reviewBody");
        expect(review).toHaveProperty("author");

        // Review author should be a Person
        expect(review.author).toHaveProperty("@type", "Person");
        expect(review.author).toHaveProperty("name");
      }
    }
  });
});

test.describe("Structured Data - News/Article Pages", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the first news post
    await page.goto("/news");
    const firstNewsLink = await page.locator('article a').first();
    await firstNewsLink.click();
    await page.waitForLoadState("networkidle");
  });

  test("should have JSON-LD structured data", async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').count();
    expect(scripts).toBeGreaterThan(0);
  });

  test("should include NewsArticle schema", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    expect(articleSchema).toBeTruthy();
    expect(articleSchema).toHaveProperty("@type", "NewsArticle");
    expect(articleSchema).toHaveProperty("headline");
    expect(articleSchema).toHaveProperty("description");
  });

  test("NewsArticle schema should have author information", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    expect(articleSchema).toHaveProperty("author");
    expect(articleSchema.author).toHaveProperty("@type", "Person");
    expect(articleSchema.author).toHaveProperty("name");
    expect(articleSchema.author).toHaveProperty("url");
  });

  test("NewsArticle schema should have publisher information", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    expect(articleSchema).toHaveProperty("publisher");
    expect(articleSchema.publisher).toHaveProperty("@type", "Person");
    expect(articleSchema.publisher).toHaveProperty("name");
  });

  test("NewsArticle schema should have datePublished", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    expect(articleSchema).toHaveProperty("datePublished");
    // Should be ISO 8601 format
    expect(articleSchema.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("NewsArticle schema should have dateModified if article was updated", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    // dateModified is optional but should be valid if present
    if (articleSchema.dateModified) {
      expect(articleSchema.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  test("NewsArticle schema should have mainEntityOfPage", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    expect(articleSchema).toHaveProperty("mainEntityOfPage");
    expect(articleSchema.mainEntityOfPage).toHaveProperty("@type", "WebPage");
    expect(articleSchema.mainEntityOfPage).toHaveProperty("@id");
  });

  test("NewsArticle schema should have url", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    expect(articleSchema).toHaveProperty("url");
    expect(articleSchema.url).toMatch(/^https?:\/\//);
  });

  test("NewsArticle schema should have category/section if available", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    // articleSection is optional
    if (articleSchema.articleSection) {
      expect(typeof articleSchema.articleSection).toBe("string");
    }
  });

  test("NewsArticle schema should have image if featured image exists", async ({ page }) => {
    const data = await getStructuredData(page);
    const articleSchema = findSchema(data, "NewsArticle");

    // Image is optional but should be valid URL if present
    if (articleSchema.image) {
      expect(articleSchema.image).toMatch(/^https?:\/\//);
    }
  });
});

test.describe("Structured Data - About Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("should have JSON-LD structured data", async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').count();
    expect(scripts).toBeGreaterThan(0);
  });

  test("should include Person schema for the author", async ({ page }) => {
    const data = await getStructuredData(page);
    const personSchema = findSchema(data, "Person");

    expect(personSchema).toBeTruthy();
    expect(personSchema).toHaveProperty("@type", "Person");
    expect(personSchema).toHaveProperty("name");
    expect(personSchema).toHaveProperty("url");
  });

  test("Person schema should have job title", async ({ page }) => {
    const data = await getStructuredData(page);
    const personSchema = findSchema(data, "Person");

    expect(personSchema).toHaveProperty("jobTitle");
    expect(personSchema.jobTitle).toContain("Author");
  });
});

test.describe("Structured Data - All Pages Validation", () => {
  const pages = [
    { url: "/", name: "Homepage" },
    { url: "/books", name: "Books Index" },
    { url: "/news", name: "News Index" },
    { url: "/about", name: "About Page" },
  ];

  for (const { url, name } of pages) {
    test(`${name} should have @context in all JSON-LD blocks`, async ({ page }) => {
      await page.goto(url);
      const data = await getStructuredData(page);

      expect(data.length).toBeGreaterThan(0);

      for (const item of data) {
        expect(item).toHaveProperty("@context");
        expect(item["@context"]).toBe("https://schema.org");
      }
    });

    test(`${name} JSON-LD should be valid JSON`, async ({ page }) => {
      await page.goto(url);
      const scripts = await page.locator('script[type="application/ld+json"]').all();

      for (const script of scripts) {
        const content = await script.textContent();
        expect(content).toBeTruthy();

        // Should parse without throwing
        expect(() => JSON.parse(content!)).not.toThrow();
      }
    });

    test(`${name} should not have duplicate @type definitions (unless using @graph)`, async ({ page }) => {
      await page.goto(url);
      const data = await getStructuredData(page);

      for (const item of data) {
        // If not using @graph, should only have one @type
        if (!item["@graph"]) {
          expect(item).toHaveProperty("@type");
          expect(typeof item["@type"]).toBe("string");
        }
      }
    });
  }
});

test.describe("Structured Data - Schema Completeness", () => {
  test("Homepage should have both WebSite and Person schemas", async ({ page }) => {
    await page.goto("/");
    const data = await getStructuredData(page);

    const websiteSchema = findSchema(data, "WebSite");
    const personSchema = findSchema(data, "Person");

    expect(websiteSchema).toBeTruthy();
    expect(personSchema).toBeTruthy();
  });

  test("All schemas should have required @type property", async ({ page }) => {
    const pages = ["/", "/books", "/news", "/about"];

    for (const url of pages) {
      await page.goto(url);
      const data = await getStructuredData(page);

      for (const item of data) {
        // Check top-level @type
        if (item["@graph"]) {
          // If using @graph, check each item in graph
          for (const graphItem of item["@graph"]) {
            expect(graphItem).toHaveProperty("@type");
          }
        } else {
          expect(item).toHaveProperty("@type");
        }
      }
    }
  });

  test("All URL properties should be absolute URLs", async ({ page }) => {
    const pages = ["/", "/about"];

    for (const url of pages) {
      await page.goto(url);
      const data = await getStructuredData(page);

      for (const item of data) {
        // Helper to check all URL properties recursively
        function checkUrls(obj: any) {
          for (const key in obj) {
            if (key === "url" || key === "image" || key.endsWith("Url")) {
              if (typeof obj[key] === "string") {
                expect(obj[key]).toMatch(/^https?:\/\//);
              }
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
              checkUrls(obj[key]);
            }
          }
        }

        checkUrls(item);
      }
    }
  });
});
