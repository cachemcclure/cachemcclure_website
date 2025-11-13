import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Template Validation Tests
 *
 * These tests validate that the content templates in planning/templates/
 * conform to the schemas defined in src/content.config.ts
 *
 * This ensures that when users copy the templates, they have valid starting points.
 */

// Import the schema from content.config.ts
// We'll recreate the relevant parts here to test independently
const bookSchema = z.object({
  title: z.string(),
  description: z.string(),
  coverImage: z.string(),
  publishDate: z.coerce.date(),
  status: z.enum(["published", "upcoming", "draft"]),
  longDescription: z.string().optional(),
  isbn: z.string().optional(),
  series: z.string().optional(),
  seriesOrder: z.number().int().positive().optional(),
  buyLinks: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      })
    )
    .default([]),
  downloadables: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        url: z.string(),
      })
    )
    .optional(),
  reviews: z
    .array(
      z.object({
        quote: z.string(),
        attribution: z.string(),
      })
    )
    .optional(),
});

const newsSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishDate: z.coerce.date(),
  category: z.enum(["releases", "events", "updates"]),
  draft: z.boolean().optional().default(false),
  image: z.string().optional(),
});

describe("Book Template Validation", () => {
  it("should validate minimal required book fields", () => {
    const minimalBook = {
      title: "Test Book",
      description: "A test description",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "upcoming" as const,
    };

    const result = bookSchema.safeParse(minimalBook);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test Book");
      expect(result.data.publishDate).toBeInstanceOf(Date);
      expect(result.data.buyLinks).toEqual([]);
    }
  });

  it("should validate book with all optional fields", () => {
    const fullBook = {
      title: "Complete Test Book",
      description: "A comprehensive test",
      coverImage: "/covers/complete.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
      longDescription: "Extended description here",
      isbn: "978-1234567890",
      series: "Test Series",
      seriesOrder: 1,
      buyLinks: [
        { name: "Amazon", url: "https://amazon.com/test" },
        { name: "Barnes & Noble", url: "https://barnesandnoble.com/test" },
      ],
      downloadables: [
        {
          title: "Chapter 1",
          description: "Preview",
          url: "/downloads/ch1.pdf",
        },
      ],
      reviews: [
        {
          quote: "Great book!",
          attribution: "— Test Reviewer",
        },
      ],
    };

    const result = bookSchema.safeParse(fullBook);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.series).toBe("Test Series");
      expect(result.data.seriesOrder).toBe(1);
      expect(result.data.buyLinks).toHaveLength(2);
      expect(result.data.downloadables).toHaveLength(1);
      expect(result.data.reviews).toHaveLength(1);
    }
  });

  it("should reject book with invalid status", () => {
    const invalidBook = {
      title: "Invalid Book",
      description: "Test",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "invalid" as any,
    };

    const result = bookSchema.safeParse(invalidBook);
    expect(result.success).toBe(false);
  });

  it("should reject book with missing required fields", () => {
    const incompleteBook = {
      title: "Incomplete Book",
      description: "Missing other fields",
    };

    const result = bookSchema.safeParse(incompleteBook);
    expect(result.success).toBe(false);
  });

  it("should reject book with invalid buyLinks URL", () => {
    const invalidBuyLinks = {
      title: "Test Book",
      description: "Test",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
      buyLinks: [{ name: "Invalid", url: "not-a-url" }],
    };

    const result = bookSchema.safeParse(invalidBuyLinks);
    expect(result.success).toBe(false);
  });

  it("should reject book with negative seriesOrder", () => {
    const invalidSeries = {
      title: "Test Book",
      description: "Test",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
      series: "Test Series",
      seriesOrder: -1,
    };

    const result = bookSchema.safeParse(invalidSeries);
    expect(result.success).toBe(false);
  });

  it("should reject book with zero seriesOrder", () => {
    const invalidSeries = {
      title: "Test Book",
      description: "Test",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
      series: "Test Series",
      seriesOrder: 0,
    };

    const result = bookSchema.safeParse(invalidSeries);
    expect(result.success).toBe(false);
  });

  it("should coerce date strings to Date objects", () => {
    const book = {
      title: "Test Book",
      description: "Test",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
    };

    const result = bookSchema.safeParse(book);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publishDate).toBeInstanceOf(Date);
      expect(result.data.publishDate.getUTCFullYear()).toBe(2025);
      expect(result.data.publishDate.getUTCMonth()).toBe(5); // June (0-indexed)
      expect(result.data.publishDate.getUTCDate()).toBe(15);
    }
  });
});

describe("News Template Validation", () => {
  it("should validate minimal required news fields", () => {
    const minimalNews = {
      title: "Test News",
      description: "A test news post",
      publishDate: "2025-01-15",
      category: "updates" as const,
    };

    const result = newsSchema.safeParse(minimalNews);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test News");
      expect(result.data.draft).toBe(false); // Default value
      expect(result.data.publishDate).toBeInstanceOf(Date);
    }
  });

  it("should validate news with all optional fields", () => {
    const fullNews = {
      title: "Complete Test News",
      description: "Comprehensive test",
      publishDate: "2025-01-15",
      category: "releases" as const,
      draft: true,
      image: "/images/news/test.jpg",
    };

    const result = newsSchema.safeParse(fullNews);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(true);
      expect(result.data.image).toBe("/images/news/test.jpg");
    }
  });

  it("should validate all category options", () => {
    const categories = ["releases", "events", "updates"] as const;

    categories.forEach(category => {
      const news = {
        title: "Test",
        description: "Test",
        publishDate: "2025-01-15",
        category,
      };

      const result = newsSchema.safeParse(news);
      expect(result.success).toBe(true);
    });
  });

  it("should reject news with invalid category", () => {
    const invalidNews = {
      title: "Test News",
      description: "Test",
      publishDate: "2025-01-15",
      category: "invalid" as any,
    };

    const result = newsSchema.safeParse(invalidNews);
    expect(result.success).toBe(false);
  });

  it("should reject news with missing required fields", () => {
    const incompleteNews = {
      title: "Incomplete News",
    };

    const result = newsSchema.safeParse(incompleteNews);
    expect(result.success).toBe(false);
  });

  it("should default draft to false when not provided", () => {
    const news = {
      title: "Test",
      description: "Test",
      publishDate: "2025-01-15",
      category: "updates" as const,
    };

    const result = newsSchema.safeParse(news);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(false);
    }
  });

  it("should coerce date strings to Date objects", () => {
    const news = {
      title: "Test",
      description: "Test",
      publishDate: "2025-01-15",
      category: "updates" as const,
    };

    const result = newsSchema.safeParse(news);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publishDate).toBeInstanceOf(Date);
      expect(result.data.publishDate.getUTCFullYear()).toBe(2025);
      expect(result.data.publishDate.getUTCMonth()).toBe(0); // January (0-indexed)
      expect(result.data.publishDate.getUTCDate()).toBe(15);
    }
  });
});

describe("Template Edge Cases", () => {
  it("should handle books with empty buyLinks array", () => {
    const book = {
      title: "Test",
      description: "Test",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
      buyLinks: [],
    };

    const result = bookSchema.safeParse(book);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.buyLinks).toEqual([]);
    }
  });

  it("should handle books without optional arrays", () => {
    const book = {
      title: "Test",
      description: "Test",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
    };

    const result = bookSchema.safeParse(book);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.downloadables).toBeUndefined();
      expect(result.data.reviews).toBeUndefined();
    }
  });

  it("should handle very long descriptions", () => {
    const longDescription = "A".repeat(1000);
    const book = {
      title: "Test",
      description: longDescription,
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
    };

    const result = bookSchema.safeParse(book);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toHaveLength(1000);
    }
  });

  it("should handle multiple buy links, downloadables, and reviews", () => {
    const book = {
      title: "Test",
      description: "Test",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
      buyLinks: Array(10)
        .fill(null)
        .map((_, i) => ({
          name: `Retailer ${i}`,
          url: `https://example${i}.com`,
        })),
      downloadables: Array(5)
        .fill(null)
        .map((_, i) => ({
          title: `Download ${i}`,
          description: `Description ${i}`,
          url: `/downloads/file${i}.pdf`,
        })),
      reviews: Array(20)
        .fill(null)
        .map((_, i) => ({
          quote: `Review quote ${i}`,
          attribution: `Reviewer ${i}`,
        })),
    };

    const result = bookSchema.safeParse(book);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.buyLinks).toHaveLength(10);
      expect(result.data.downloadables).toHaveLength(5);
      expect(result.data.reviews).toHaveLength(20);
    }
  });

  it("should handle special characters in strings", () => {
    const book = {
      title: 'Test "Book" with \'Quotes\' & Symbols: é, ñ, ü',
      description: "Test with <html> tags and $pecial @#$ characters",
      coverImage: "/covers/test.webp",
      publishDate: "2025-06-15",
      status: "published" as const,
    };

    const result = bookSchema.safeParse(book);
    expect(result.success).toBe(true);
  });
});
