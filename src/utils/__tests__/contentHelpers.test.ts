/**
 * Content Helpers Test Suite
 *
 * Comprehensive tests for all content helper functions including:
 * - Sorting functions (books by date, books by series, news by date)
 * - Filtering functions (by category, by status, exclude drafts)
 * - Reusable query functions
 * - Edge cases and null safety
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sortBooksByPublishDate,
  sortBooksByPublishDateAsc,
  sortBooksBySeriesOrder,
  filterNewsByCategory,
  excludeDrafts,
  excludeDraftBooks,
  filterBooksByStatus,
  sortNewsByPublishDate,
  sortNewsByPublishDateAsc,
  getBooksBySeries,
  getAllBooks,
  getPublishedBooks,
  getUpcomingBooks,
  getSeriesBooks,
  getAllNews,
  getPublishedNews,
  getNewsByCategory,
  getLatestNews,
  getLatestBooks,
  type BookEntry,
  type NewsEntry,
} from "../contentHelpers";

// ============================================================================
// Mock Data
// ============================================================================

/**
 * Create mock book entries for testing
 */
function createMockBook(overrides: Partial<BookEntry["data"]> = {}): BookEntry {
  return {
    id: overrides.title?.toLowerCase().replace(/\s+/g, "-") || "test-book",
    collection: "books",
    data: {
      title: "Test Book",
      description: "Test description",
      coverImage: "/covers/test.webp",
      publishDate: new Date("2025-01-01"),
      status: "published",
      buyLinks: [],
      ...overrides,
    },
  } as BookEntry;
}

/**
 * Create mock news entries for testing
 */
function createMockNews(overrides: Partial<NewsEntry["data"]> = {}): NewsEntry {
  return {
    id: overrides.title?.toLowerCase().replace(/\s+/g, "-") || "test-news",
    collection: "news",
    data: {
      title: "Test News",
      description: "Test description",
      publishDate: new Date("2025-01-01"),
      category: "updates",
      draft: false,
      ...overrides,
    },
  } as NewsEntry;
}

// ============================================================================
// Sorting Functions Tests
// ============================================================================

describe("sortBooksByPublishDate", () => {
  it("should sort books by publish date (newest first)", () => {
    const books = [
      createMockBook({ title: "Old Book", publishDate: new Date("2020-01-01") }),
      createMockBook({ title: "New Book", publishDate: new Date("2025-01-01") }),
      createMockBook({ title: "Mid Book", publishDate: new Date("2023-01-01") }),
    ];

    const sorted = sortBooksByPublishDate(books);

    expect(sorted[0].data.title).toBe("New Book");
    expect(sorted[1].data.title).toBe("Mid Book");
    expect(sorted[2].data.title).toBe("Old Book");
  });

  it("should handle books with same publish date", () => {
    const date = new Date("2025-01-01");
    const books = [
      createMockBook({ title: "Book A", publishDate: date }),
      createMockBook({ title: "Book B", publishDate: date }),
    ];

    const sorted = sortBooksByPublishDate(books);

    expect(sorted).toHaveLength(2);
    // Order should be stable for same dates
  });

  it("should not mutate the original array", () => {
    const books = [
      createMockBook({ publishDate: new Date("2020-01-01") }),
      createMockBook({ publishDate: new Date("2025-01-01") }),
    ];
    const original = [...books];

    sortBooksByPublishDate(books);

    expect(books).toEqual(original);
  });

  it("should handle empty array", () => {
    const sorted = sortBooksByPublishDate([]);
    expect(sorted).toEqual([]);
  });

  it("should handle single book", () => {
    const books = [createMockBook({ title: "Solo Book" })];
    const sorted = sortBooksByPublishDate(books);

    expect(sorted).toHaveLength(1);
    expect(sorted[0].data.title).toBe("Solo Book");
  });
});

describe("sortBooksByPublishDateAsc", () => {
  it("should sort books by publish date (oldest first)", () => {
    const books = [
      createMockBook({ title: "New Book", publishDate: new Date("2025-01-01") }),
      createMockBook({ title: "Old Book", publishDate: new Date("2020-01-01") }),
      createMockBook({ title: "Mid Book", publishDate: new Date("2023-01-01") }),
    ];

    const sorted = sortBooksByPublishDateAsc(books);

    expect(sorted[0].data.title).toBe("Old Book");
    expect(sorted[1].data.title).toBe("Mid Book");
    expect(sorted[2].data.title).toBe("New Book");
  });
});

describe("sortBooksBySeriesOrder", () => {
  it("should sort books by series name alphabetically, then by series order", () => {
    const books = [
      createMockBook({
        title: "B Series Book 2",
        series: "B Series",
        seriesOrder: 2,
      }),
      createMockBook({
        title: "A Series Book 1",
        series: "A Series",
        seriesOrder: 1,
      }),
      createMockBook({
        title: "B Series Book 1",
        series: "B Series",
        seriesOrder: 1,
      }),
      createMockBook({
        title: "A Series Book 2",
        series: "A Series",
        seriesOrder: 2,
      }),
    ];

    const sorted = sortBooksBySeriesOrder(books);

    expect(sorted[0].data.title).toBe("A Series Book 1");
    expect(sorted[1].data.title).toBe("A Series Book 2");
    expect(sorted[2].data.title).toBe("B Series Book 1");
    expect(sorted[3].data.title).toBe("B Series Book 2");
  });

  it("should place books without series at the end", () => {
    const books = [
      createMockBook({ title: "No Series" }),
      createMockBook({
        title: "With Series",
        series: "Test Series",
        seriesOrder: 1,
      }),
    ];

    const sorted = sortBooksBySeriesOrder(books);

    expect(sorted[0].data.title).toBe("With Series");
    expect(sorted[1].data.title).toBe("No Series");
  });

  it("should place books without seriesOrder at the end of their series", () => {
    const books = [
      createMockBook({
        title: "Book Without Order",
        series: "Test Series",
      }),
      createMockBook({
        title: "Book 1",
        series: "Test Series",
        seriesOrder: 1,
      }),
      createMockBook({
        title: "Book 2",
        series: "Test Series",
        seriesOrder: 2,
      }),
    ];

    const sorted = sortBooksBySeriesOrder(books);

    expect(sorted[0].data.title).toBe("Book 1");
    expect(sorted[1].data.title).toBe("Book 2");
    expect(sorted[2].data.title).toBe("Book Without Order");
  });

  it("should handle empty array", () => {
    const sorted = sortBooksBySeriesOrder([]);
    expect(sorted).toEqual([]);
  });

  it("should not mutate the original array", () => {
    const books = [
      createMockBook({ series: "A", seriesOrder: 1 }),
      createMockBook({ series: "B", seriesOrder: 1 }),
    ];
    const original = [...books];

    sortBooksBySeriesOrder(books);

    expect(books).toEqual(original);
  });
});

describe("sortNewsByPublishDate", () => {
  it("should sort news by publish date (newest first)", () => {
    const news = [
      createMockNews({ title: "Old News", publishDate: new Date("2020-01-01") }),
      createMockNews({ title: "New News", publishDate: new Date("2025-01-01") }),
      createMockNews({ title: "Mid News", publishDate: new Date("2023-01-01") }),
    ];

    const sorted = sortNewsByPublishDate(news);

    expect(sorted[0].data.title).toBe("New News");
    expect(sorted[1].data.title).toBe("Mid News");
    expect(sorted[2].data.title).toBe("Old News");
  });

  it("should not mutate the original array", () => {
    const news = [
      createMockNews({ publishDate: new Date("2020-01-01") }),
      createMockNews({ publishDate: new Date("2025-01-01") }),
    ];
    const original = [...news];

    sortNewsByPublishDate(news);

    expect(news).toEqual(original);
  });
});

describe("sortNewsByPublishDateAsc", () => {
  it("should sort news by publish date (oldest first)", () => {
    const news = [
      createMockNews({ title: "New News", publishDate: new Date("2025-01-01") }),
      createMockNews({ title: "Old News", publishDate: new Date("2020-01-01") }),
      createMockNews({ title: "Mid News", publishDate: new Date("2023-01-01") }),
    ];

    const sorted = sortNewsByPublishDateAsc(news);

    expect(sorted[0].data.title).toBe("Old News");
    expect(sorted[1].data.title).toBe("Mid News");
    expect(sorted[2].data.title).toBe("New News");
  });
});

// ============================================================================
// Filtering Functions Tests
// ============================================================================

describe("filterNewsByCategory", () => {
  it("should filter news by releases category", () => {
    const news = [
      createMockNews({ title: "Release", category: "releases" }),
      createMockNews({ title: "Event", category: "events" }),
      createMockNews({ title: "Update", category: "updates" }),
    ];

    const filtered = filterNewsByCategory(news, "releases");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].data.title).toBe("Release");
  });

  it("should filter news by events category", () => {
    const news = [
      createMockNews({ category: "releases" }),
      createMockNews({ title: "Event 1", category: "events" }),
      createMockNews({ title: "Event 2", category: "events" }),
    ];

    const filtered = filterNewsByCategory(news, "events");

    expect(filtered).toHaveLength(2);
  });

  it("should filter news by updates category", () => {
    const news = [
      createMockNews({ title: "Update", category: "updates" }),
      createMockNews({ category: "events" }),
    ];

    const filtered = filterNewsByCategory(news, "updates");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].data.title).toBe("Update");
  });

  it("should return empty array if no matches", () => {
    const news = [
      createMockNews({ category: "releases" }),
      createMockNews({ category: "events" }),
    ];

    const filtered = filterNewsByCategory(news, "updates");

    expect(filtered).toEqual([]);
  });
});

describe("excludeDrafts", () => {
  it("should exclude draft news", () => {
    const news = [
      createMockNews({ title: "Published", draft: false }),
      createMockNews({ title: "Draft", draft: true }),
      createMockNews({ title: "Also Published", draft: false }),
    ];

    const filtered = excludeDrafts(news);

    expect(filtered).toHaveLength(2);
    expect(filtered[0].data.title).toBe("Published");
    expect(filtered[1].data.title).toBe("Also Published");
  });

  it("should handle news without explicit draft field", () => {
    const news = [
      createMockNews({ title: "Published" }), // draft defaults to false
    ];

    const filtered = excludeDrafts(news);

    expect(filtered).toHaveLength(1);
  });

  it("should return empty array if all are drafts", () => {
    const news = [
      createMockNews({ draft: true }),
      createMockNews({ draft: true }),
    ];

    const filtered = excludeDrafts(news);

    expect(filtered).toEqual([]);
  });
});

describe("excludeDraftBooks", () => {
  it("should exclude draft and upcoming books", () => {
    const books = [
      createMockBook({ title: "Published", status: "published" }),
      createMockBook({ title: "Draft", status: "draft" }),
      createMockBook({ title: "Upcoming", status: "upcoming" }),
    ];

    const filtered = excludeDraftBooks(books);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].data.title).toBe("Published");
  });

  it("should return empty array if no published books", () => {
    const books = [
      createMockBook({ status: "draft" }),
      createMockBook({ status: "upcoming" }),
    ];

    const filtered = excludeDraftBooks(books);

    expect(filtered).toEqual([]);
  });
});

describe("filterBooksByStatus", () => {
  it("should filter published books", () => {
    const books = [
      createMockBook({ title: "Published", status: "published" }),
      createMockBook({ status: "draft" }),
      createMockBook({ status: "upcoming" }),
    ];

    const filtered = filterBooksByStatus(books, "published");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].data.title).toBe("Published");
  });

  it("should filter upcoming books", () => {
    const books = [
      createMockBook({ status: "published" }),
      createMockBook({ title: "Upcoming 1", status: "upcoming" }),
      createMockBook({ title: "Upcoming 2", status: "upcoming" }),
    ];

    const filtered = filterBooksByStatus(books, "upcoming");

    expect(filtered).toHaveLength(2);
  });

  it("should filter draft books", () => {
    const books = [
      createMockBook({ title: "Draft", status: "draft" }),
      createMockBook({ status: "published" }),
    ];

    const filtered = filterBooksByStatus(books, "draft");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].data.title).toBe("Draft");
  });
});

describe("getBooksBySeries", () => {
  it("should get and sort books by series", () => {
    const books = [
      createMockBook({ title: "Other Book" }),
      createMockBook({
        title: "Series Book 2",
        series: "Test Series",
        seriesOrder: 2,
      }),
      createMockBook({
        title: "Series Book 1",
        series: "Test Series",
        seriesOrder: 1,
      }),
      createMockBook({
        title: "Different Series",
        series: "Other Series",
        seriesOrder: 1,
      }),
    ];

    const filtered = getBooksBySeries(books, "Test Series");

    expect(filtered).toHaveLength(2);
    expect(filtered[0].data.title).toBe("Series Book 1");
    expect(filtered[1].data.title).toBe("Series Book 2");
  });

  it("should return empty array for non-existent series", () => {
    const books = [
      createMockBook({ series: "Test Series", seriesOrder: 1 }),
    ];

    const filtered = getBooksBySeries(books, "Non-existent Series");

    expect(filtered).toEqual([]);
  });
});

// ============================================================================
// Reusable Query Functions Tests (with mocking)
// ============================================================================

/**
 * Mock getCollection function for testing async query functions
 */
const mockGetCollection = vi.fn();

// Mock the astro:content module
vi.mock("astro:content", () => ({
  getCollection: (collection: string) => mockGetCollection(collection),
}));

beforeEach(() => {
  mockGetCollection.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getAllBooks", () => {
  it("should get all books sorted by publish date", async () => {
    const mockBooks = [
      createMockBook({ title: "Old", publishDate: new Date("2020-01-01") }),
      createMockBook({ title: "New", publishDate: new Date("2025-01-01") }),
    ];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getAllBooks();

    expect(mockGetCollection).toHaveBeenCalledWith("books");
    expect(books).toHaveLength(2);
    expect(books[0].data.title).toBe("New");
  });
});

describe("getPublishedBooks", () => {
  it("should get only published books", async () => {
    const mockBooks = [
      createMockBook({ title: "Published", status: "published" }),
      createMockBook({ title: "Draft", status: "draft" }),
      createMockBook({ title: "Upcoming", status: "upcoming" }),
    ];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getPublishedBooks();

    expect(books).toHaveLength(1);
    expect(books[0].data.title).toBe("Published");
  });

  it("should return empty array if no published books", async () => {
    const mockBooks = [
      createMockBook({ status: "draft" }),
      createMockBook({ status: "upcoming" }),
    ];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getPublishedBooks();

    expect(books).toEqual([]);
  });
});

describe("getUpcomingBooks", () => {
  it("should get upcoming books sorted by soonest first", async () => {
    const mockBooks = [
      createMockBook({
        title: "Soon",
        status: "upcoming",
        publishDate: new Date("2025-03-01"),
      }),
      createMockBook({
        title: "Later",
        status: "upcoming",
        publishDate: new Date("2026-01-01"),
      }),
      createMockBook({ status: "published" }),
    ];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getUpcomingBooks();

    expect(books).toHaveLength(2);
    expect(books[0].data.title).toBe("Soon");
    expect(books[1].data.title).toBe("Later");
  });
});

describe("getSeriesBooks", () => {
  it("should get books in a specific series", async () => {
    const mockBooks = [
      createMockBook({
        title: "Book 2",
        series: "Test Series",
        seriesOrder: 2,
      }),
      createMockBook({
        title: "Book 1",
        series: "Test Series",
        seriesOrder: 1,
      }),
      createMockBook({ series: "Other Series", seriesOrder: 1 }),
    ];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getSeriesBooks("Test Series");

    expect(books).toHaveLength(2);
    expect(books[0].data.title).toBe("Book 1");
    expect(books[1].data.title).toBe("Book 2");
  });
});

describe("getAllNews", () => {
  it("should get all news sorted by publish date", async () => {
    const mockNews = [
      createMockNews({ title: "Old", publishDate: new Date("2020-01-01") }),
      createMockNews({ title: "New", publishDate: new Date("2025-01-01") }),
    ];
    mockGetCollection.mockResolvedValue(mockNews);

    const news = await getAllNews();

    expect(mockGetCollection).toHaveBeenCalledWith("news");
    expect(news).toHaveLength(2);
    expect(news[0].data.title).toBe("New");
  });
});

describe("getPublishedNews", () => {
  it("should get only published news", async () => {
    const mockNews = [
      createMockNews({ title: "Published", draft: false }),
      createMockNews({ title: "Draft", draft: true }),
    ];
    mockGetCollection.mockResolvedValue(mockNews);

    const news = await getPublishedNews();

    expect(news).toHaveLength(1);
    expect(news[0].data.title).toBe("Published");
  });
});

describe("getNewsByCategory", () => {
  it("should get news by category excluding drafts by default", async () => {
    const mockNews = [
      createMockNews({
        title: "Published Release",
        category: "releases",
        draft: false,
      }),
      createMockNews({
        title: "Draft Release",
        category: "releases",
        draft: true,
      }),
      createMockNews({ category: "events", draft: false }),
    ];
    mockGetCollection.mockResolvedValue(mockNews);

    const news = await getNewsByCategory("releases");

    expect(news).toHaveLength(1);
    expect(news[0].data.title).toBe("Published Release");
  });

  it("should include drafts when includesDrafts is true", async () => {
    const mockNews = [
      createMockNews({ title: "Published", category: "releases", draft: false }),
      createMockNews({ title: "Draft", category: "releases", draft: true }),
    ];
    mockGetCollection.mockResolvedValue(mockNews);

    const news = await getNewsByCategory("releases", true);

    expect(news).toHaveLength(2);
  });

  it("should handle empty results", async () => {
    const mockNews = [createMockNews({ category: "events" })];
    mockGetCollection.mockResolvedValue(mockNews);

    const news = await getNewsByCategory("releases");

    expect(news).toEqual([]);
  });
});

describe("getLatestNews", () => {
  it("should get latest N news items", async () => {
    const mockNews = [
      createMockNews({ title: "News 1", publishDate: new Date("2025-03-01") }),
      createMockNews({ title: "News 2", publishDate: new Date("2025-02-01") }),
      createMockNews({ title: "News 3", publishDate: new Date("2025-01-01") }),
    ];
    mockGetCollection.mockResolvedValue(mockNews);

    const news = await getLatestNews(2);

    expect(news).toHaveLength(2);
    expect(news[0].data.title).toBe("News 1");
    expect(news[1].data.title).toBe("News 2");
  });

  it("should exclude drafts by default", async () => {
    const mockNews = [
      createMockNews({ title: "Published", draft: false }),
      createMockNews({ title: "Draft", draft: true }),
    ];
    mockGetCollection.mockResolvedValue(mockNews);

    const news = await getLatestNews(5);

    expect(news).toHaveLength(1);
    expect(news[0].data.title).toBe("Published");
  });

  it("should include drafts when includesDrafts is true", async () => {
    const mockNews = [
      createMockNews({ draft: false }),
      createMockNews({ draft: true }),
    ];
    mockGetCollection.mockResolvedValue(mockNews);

    const news = await getLatestNews(5, true);

    expect(news).toHaveLength(2);
  });
});

describe("getLatestBooks", () => {
  it("should get latest N books", async () => {
    const mockBooks = [
      createMockBook({
        title: "Book 1",
        status: "published",
        publishDate: new Date("2025-03-01"),
      }),
      createMockBook({
        title: "Book 2",
        status: "published",
        publishDate: new Date("2025-02-01"),
      }),
      createMockBook({
        title: "Book 3",
        status: "published",
        publishDate: new Date("2025-01-01"),
      }),
    ];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getLatestBooks(2);

    expect(books).toHaveLength(2);
    expect(books[0].data.title).toBe("Book 1");
    expect(books[1].data.title).toBe("Book 2");
  });

  it("should exclude upcoming books by default", async () => {
    const mockBooks = [
      createMockBook({ title: "Published", status: "published" }),
      createMockBook({ title: "Upcoming", status: "upcoming" }),
    ];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getLatestBooks(5);

    expect(books).toHaveLength(1);
    expect(books[0].data.title).toBe("Published");
  });

  it("should include upcoming books when includeUpcoming is true", async () => {
    const mockBooks = [
      createMockBook({ title: "Published", status: "published" }),
      createMockBook({ title: "Upcoming", status: "upcoming" }),
    ];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getLatestBooks(5, true);

    expect(books).toHaveLength(2);
  });
});

// ============================================================================
// Edge Cases and Integration Tests
// ============================================================================

describe("Edge Cases", () => {
  it("should handle empty collections gracefully", async () => {
    mockGetCollection.mockResolvedValue([]);

    const books = await getAllBooks();
    const news = await getAllNews();

    expect(books).toEqual([]);
    expect(news).toEqual([]);
  });

  it("should handle books with identical data", () => {
    const date = new Date("2025-01-01");
    const books = [
      createMockBook({ title: "Book A", publishDate: date }),
      createMockBook({ title: "Book A", publishDate: date }),
    ];

    const sorted = sortBooksByPublishDate(books);

    expect(sorted).toHaveLength(2);
  });

  it("should maintain type safety with CollectionEntry types", async () => {
    const mockBooks = [createMockBook({ title: "Test" })];
    mockGetCollection.mockResolvedValue(mockBooks);

    const books = await getAllBooks();

    // TypeScript should recognize this is BookEntry[]
    expect(books[0].collection).toBe("books");
    expect(books[0].data.title).toBe("Test");
  });
});
