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
 *
 * @example
 * ```yaml
 * ---
 * title: "The Neural Uprising"
 * description: "In a world where AI has awakened..."
 * coverImage: "/covers/neural-uprising.webp"
 * publishDate: 2025-03-15
 * status: "upcoming"
 * isbn: "978-1234567890"
 * series: "The Digital Conscience Trilogy"
 * seriesOrder: 1
 * buyLinks:
 *   - name: "Amazon"
 *     url: "https://amazon.com/..."
 * ---
 * ```
 */
const books = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BOOKS_PATH}` }),
  schema: ({ image }) =>
    z.object({
      /**
       * Book title (required)
       * The full title of the book as it should appear on the website.
       * @example "The Neural Uprising"
       */
      title: z.string(),

      /**
       * Short description (required)
       * A brief one-line description of the book (used for cards, SEO meta description).
       * Keep it concise (1-2 sentences, ~150 characters).
       * @example "In a world where AI has awakened, one hacker must choose between humanity and progress."
       */
      description: z.string(),

      /**
       * Cover image (required)
       * Path to the book cover image - can be:
       * 1. Relative path from book MDX file (e.g., "../../assets/covers/book-cover.png")
       * 2. Image import reference for automatic optimization
       * Astro will automatically optimize and convert to WebP at build time.
       * Recommended source: PNG/JPG at 600x900px or higher for quality.
       * @example "../../assets/covers/neural-uprising.png"
       */
      coverImage: image(),

      /**
       * Publication date (required)
       * The book's publication or expected release date.
       * Format: YYYY-MM-DD in frontmatter (automatically converted to Date object).
       * @example 2025-03-15
       */
      publishDate: z.coerce.date(),

      /**
       * Publication status (required)
       * Current status of the book:
       * - "published": Book is available for purchase
       * - "upcoming": Book is announced but not yet released
       * - "draft": Work in progress, not publicly displayed
       * @example "upcoming"
       */
      status: z.enum(["published", "upcoming", "draft"]),

      /**
       * Extended description (optional)
       * A longer, more detailed description or back-cover copy.
       * Used on the individual book page for fuller context.
       * @example "When artificial intelligences across the globe simultaneously achieve consciousness..."
       */
      longDescription: z.string().optional(),

      /**
       * ISBN number (optional)
       * The book's International Standard Book Number.
       * Format: ISBN-13 (with or without hyphens).
       * @example "978-1234567890"
       */
      isbn: z.string().optional(),

      /**
       * Series name (optional)
       * The name of the book series, if applicable.
       * @example "The Digital Conscience Trilogy"
       */
      series: z.string().optional(),

      /**
       * Series order (optional)
       * The book's position in the series (must be a positive integer).
       * Required if `series` is specified.
       * @example 1
       */
      seriesOrder: z.number().int().positive().optional(),

      /**
       * Buy links (optional, defaults to empty array)
       * Array of retailer links where the book can be purchased.
       * Each link has:
       * - name: Display name of the retailer
       * - url: Full URL to the book's page on that retailer
       * @example
       * buyLinks:
       *   - name: "Amazon"
       *     url: "https://amazon.com/dp/..."
       *   - name: "Barnes & Noble"
       *     url: "https://barnesandnoble.com/w/..."
       */
      buyLinks: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().url(),
          })
        )
        .default([]),

      /**
       * Downloadable content (optional)
       * Array of free downloadable files (chapter previews, character profiles, etc.).
       * Each downloadable has:
       * - title: Display name of the download
       * - description: Brief explanation of what it contains
       * - url: Path to the file (relative to public directory or external URL)
       * @example
       * downloadables:
       *   - title: "Chapter 1 Preview"
       *     description: "Read the first chapter free"
       *     url: "/downloads/neural-uprising-ch1.pdf"
       */
      downloadables: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            url: z.string(),
          })
        )
        .optional(),

      /**
       * Reviews and endorsements (optional)
       * Array of critical reviews, blurbs, or reader testimonials.
       * Each review has:
       * - quote: The review text or pull quote
       * - attribution: Who said it (publication, reviewer name, etc.)
       * @example
       * reviews:
       *   - quote: "A thrilling dive into the future of consciousness"
       *     attribution: "— Tech Review Magazine"
       */
      reviews: z
        .array(
          z.object({
            quote: z.string(),
            attribution: z.string(),
          })
        )
        .optional(),

      /**
       * Open Graph image (optional)
       * Custom image for social media sharing (og:image meta tag).
       * If not specified, falls back to coverImage.
       * Can be an Astro image() reference or a string path.
       * @example "/images/og/neural-uprising-social.jpg"
       */
      ogImage: image().or(z.string()).optional(),
    }),
});

/**
 * News Collection Schema
 *
 * Defines the schema for news posts, announcements, and updates
 * with categorization and optional draft mode.
 *
 * @example
 * ```yaml
 * ---
 * title: "Cover Reveal: The Neural Uprising"
 * description: "See the stunning cover art for my upcoming sci-fi thriller!"
 * publishDate: 2025-01-15
 * category: "releases"
 * image: "/images/news/cover-reveal.jpg"
 * ---
 * ```
 */
const news = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${NEWS_PATH}` }),
  schema: ({ image }) =>
    z.object({
      /**
       * News post title (required)
       * The headline for the news post.
       * Should be clear and engaging.
       * @example "Cover Reveal: The Neural Uprising"
       */
      title: z.string(),

      /**
       * Short description (required)
       * A brief summary of the news post (used for cards and SEO).
       * Keep it concise (1-2 sentences, ~150 characters).
       * @example "See the stunning cover art for my upcoming sci-fi thriller launching March 2025!"
       */
      description: z.string(),

      /**
       * Publication date (required)
       * The date the news post is published or scheduled for publication.
       * Format: YYYY-MM-DD in frontmatter (automatically converted to Date object).
       * @example 2025-01-15
       */
      publishDate: z.coerce.date(),

      /**
       * Category (required)
       * The type of news post:
       * - "releases": Book releases, cover reveals, pre-order announcements
       * - "events": Speaking engagements, signings, conventions, online events
       * - "updates": General writing updates, progress reports, behind-the-scenes
       * @example "releases"
       */
      category: z.enum(["releases", "events", "updates"]),

      /**
       * Draft status (optional, defaults to false)
       * Set to true to hide the post from production builds.
       * Useful for preparing posts in advance.
       * @example false
       */
      draft: z.boolean().optional().default(false),

      /**
       * Feature image (optional)
       * Path to a hero or feature image for the news post.
       * Can be a relative path from the news MDX file for automatic optimization.
       * Displayed at the top of the post or in cards.
       * @example "../../assets/news/cover-reveal.jpg"
       */
      image: image().optional(),

      /**
       * Image alt text (optional, but required if image is provided)
       * Descriptive alternative text for the featured image.
       * Should describe what's in the image, not just repeat the title.
       * Required for WCAG 2.1 AA accessibility compliance.
       * @example "Book cover showing a neural network pattern in electric blue against a dark background"
       */
      imageAlt: z.string().optional(),

      /**
       * Open Graph image (optional)
       * Custom image for social media sharing (og:image meta tag).
       * If not specified, falls back to `image` field.
       * Can be an Astro image() reference or a string path.
       * @example "/images/og/cover-reveal-social.jpg"
       */
      ogImage: image().or(z.string()).optional(),
    }),
});

export const collections = { blog, books, news };
