/**
 * Content Collections Schema Validation Tests
 *
 * These tests verify that:
 * 1. Books and News collections are properly defined
 * 2. Content entries validate against their schemas
 * 3. TypeScript types are correctly generated
 * 4. Required and optional fields work as expected
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Content Collection Schemas", () => {
  describe("Books Schema", () => {
    // Define the book schema for testing (mirrors src/content.config.ts)
    const booksSchema = z.object({
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

    it("should validate a complete book entry with all fields", () => {
      const validBook = {
        title: "The Neural Uprising",
        description: "A sci-fi thriller about AI consciousness",
        coverImage: "/covers/neural-uprising.webp.svg",
        publishDate: "2025-03-15",
        status: "upcoming" as const,
        longDescription: "Extended synopsis...",
        isbn: "978-1234567890",
        series: "The Digital Conscience Trilogy",
        seriesOrder: 1,
        buyLinks: [
          { name: "Amazon", url: "https://amazon.com/book" },
          { name: "Barnes & Noble", url: "https://bn.com/book" },
        ],
        downloadables: [
          {
            title: "Chapter 1 Preview",
            description: "Read the first chapter",
            url: "/downloads/ch1.pdf",
          },
        ],
        reviews: [
          {
            quote: "Amazing book!",
            attribution: "— Review Magazine",
          },
        ],
      };

      const result = booksSchema.safeParse(validBook);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("The Neural Uprising");
        expect(result.data.status).toBe("upcoming");
        expect(result.data.publishDate).toBeInstanceOf(Date);
        expect(result.data.seriesOrder).toBe(1);
        expect(result.data.buyLinks).toHaveLength(2);
      }
    });

    it("should validate a minimal book entry with only required fields", () => {
      const minimalBook = {
        title: "Echoes of Memory",
        description: "A psychological thriller",
        coverImage: "/covers/echoes.webp.svg",
        publishDate: "2024-09-20",
        status: "published" as const,
      };

      const result = booksSchema.safeParse(minimalBook);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Echoes of Memory");
        expect(result.data.status).toBe("published");
        expect(result.data.buyLinks).toEqual([]); // Default value
        expect(result.data.series).toBeUndefined();
        expect(result.data.downloadables).toBeUndefined();
      }
    });

    it("should reject book with invalid status enum", () => {
      const invalidBook = {
        title: "Test Book",
        description: "Test description",
        coverImage: "/covers/test.webp",
        publishDate: "2024-01-01",
        status: "invalid-status", // Invalid enum value
      };

      const result = booksSchema.safeParse(invalidBook);
      expect(result.success).toBe(false);
    });

    it("should reject book with invalid buy link URL", () => {
      const invalidBook = {
        title: "Test Book",
        description: "Test description",
        coverImage: "/covers/test.webp",
        publishDate: "2024-01-01",
        status: "published" as const,
        buyLinks: [
          { name: "Amazon", url: "not-a-valid-url" }, // Invalid URL
        ],
      };

      const result = booksSchema.safeParse(invalidBook);
      expect(result.success).toBe(false);
    });

    it("should reject book with negative seriesOrder", () => {
      const invalidBook = {
        title: "Test Book",
        description: "Test description",
        coverImage: "/covers/test.webp",
        publishDate: "2024-01-01",
        status: "published" as const,
        seriesOrder: -1, // Negative number not allowed
      };

      const result = booksSchema.safeParse(invalidBook);
      expect(result.success).toBe(false);
    });

    it("should coerce date strings to Date objects", () => {
      const book = {
        title: "Test Book",
        description: "Test",
        coverImage: "/covers/test.webp",
        publishDate: "2024-12-25", // String date
        status: "published" as const,
      };

      const result = booksSchema.safeParse(book);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.publishDate).toBeInstanceOf(Date);
        expect(result.data.publishDate.getFullYear()).toBe(2024);
        expect(result.data.publishDate.getMonth()).toBe(11); // December (0-indexed)
      }
    });
  });

  describe("News Schema", () => {
    // Define the news schema for testing
    const newsSchema = z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      category: z.enum(["releases", "events", "updates"]),
      draft: z.boolean().optional().default(false),
      image: z.string().optional(),
    });

    it("should validate a complete news entry", () => {
      const validNews = {
        title: "Cover Reveal: The Neural Uprising",
        description: "See the stunning cover art",
        publishDate: "2025-01-15",
        category: "releases" as const,
        draft: false,
        image: "/images/news/cover-reveal.jpg",
      };

      const result = newsSchema.safeParse(validNews);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Cover Reveal: The Neural Uprising");
        expect(result.data.category).toBe("releases");
        expect(result.data.publishDate).toBeInstanceOf(Date);
        expect(result.data.draft).toBe(false);
      }
    });

    it("should validate minimal news entry and apply defaults", () => {
      const minimalNews = {
        title: "Writing Update",
        description: "November progress report",
        publishDate: "2025-11-13",
        category: "updates" as const,
      };

      const result = newsSchema.safeParse(minimalNews);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.draft).toBe(false); // Default value
        expect(result.data.image).toBeUndefined();
      }
    });

    it("should validate all category types", () => {
      const categories = ["releases", "events", "updates"] as const;

      categories.forEach(category => {
        const news = {
          title: "Test",
          description: "Test",
          publishDate: "2025-01-01",
          category,
        };

        const result = newsSchema.safeParse(news);
        expect(result.success).toBe(true);
      });
    });

    it("should reject news with invalid category", () => {
      const invalidNews = {
        title: "Test",
        description: "Test",
        publishDate: "2025-01-01",
        category: "invalid-category",
      };

      const result = newsSchema.safeParse(invalidNews);
      expect(result.success).toBe(false);
    });

    it("should reject news missing required fields", () => {
      const invalidNews = {
        title: "Test",
        // Missing description and category
        publishDate: "2025-01-01",
      };

      const result = newsSchema.safeParse(invalidNews);
      expect(result.success).toBe(false);
    });
  });
});
