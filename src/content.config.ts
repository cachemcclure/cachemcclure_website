import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";
export const BOOKS_PATH = "src/data/books";
export const NEWS_PATH = "src/data/news";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

/**
 * Books Collection Schema
 *
 * Defines the schema for book entries with comprehensive metadata,
 * including cover images, publishing status, series information,
 * buy links, downloadables, and reviews.
 */
const books = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BOOKS_PATH}` }),
  schema: ({ image }) =>
    z.object({
      // Required fields
      title: z.string(),
      description: z.string(),
      coverImage: z.string(),
      publishDate: z.coerce.date(), // Coerce allows YAML date strings
      status: z.enum(["published", "upcoming", "draft"]),

      // Optional fields
      longDescription: z.string().optional(),
      isbn: z.string().optional(),
      series: z.string().optional(),
      seriesOrder: z.number().int().positive().optional(),

      // Array of buy links (Amazon, Barnes & Noble, etc.)
      buyLinks: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().url(),
          })
        )
        .default([]),

      // Downloadable content (chapter previews, extras, etc.)
      downloadables: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            url: z.string(),
          })
        )
        .optional(),

      // Book reviews and endorsements
      reviews: z
        .array(
          z.object({
            quote: z.string(),
            attribution: z.string(),
          })
        )
        .optional(),

      // Optional OG image for social sharing
      ogImage: image().or(z.string()).optional(),
    }),
});

/**
 * News Collection Schema
 *
 * Defines the schema for news posts, announcements, and updates
 * with categorization and optional draft mode.
 */
const news = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${NEWS_PATH}` }),
  schema: ({ image }) =>
    z.object({
      // Required fields
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(), // Coerce allows YAML date strings
      category: z.enum(["releases", "events", "updates"]),

      // Optional fields
      draft: z.boolean().optional().default(false),
      image: z.string().optional(),

      // Optional OG image for social sharing
      ogImage: image().or(z.string()).optional(),
    }),
});

export const collections = { blog, books, news };
