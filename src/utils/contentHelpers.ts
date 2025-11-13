/**
 * Content Helpers for Books and News Collections
 *
 * This module provides type-safe utility functions for querying, sorting,
 * and filtering Astro Content Collections (books and news).
 *
 * Key features:
 * - Type-safe sorting and filtering functions
 * - Reusable query functions with production-ready defaults
 * - Draft exclusion for production environments
 * - Series-aware book sorting
 * - Category-based news filtering
 */

import { getCollection, type CollectionEntry } from "astro:content";

/**
 * Type aliases for better readability
 */
export type BookEntry = CollectionEntry<"books">;
export type NewsEntry = CollectionEntry<"news">;

/**
 * News category type for filtering
 */
export type NewsCategory = "releases" | "events" | "updates";

/**
 * Sort books by publish date (newest first)
 *
 * @param books - Array of book entries to sort
 * @returns Sorted array with newest books first
 *
 * @example
 * const books = await getCollection('books');
 * const sortedBooks = sortBooksByPublishDate(books);
 */
export function sortBooksByPublishDate(books: BookEntry[]): BookEntry[] {
  return [...books].sort((a, b) => {
    const dateA = new Date(a.data.publishDate).getTime();
    const dateB = new Date(b.data.publishDate).getTime();
    return dateB - dateA; // Newest first
  });
}

/**
 * Sort books by publish date (oldest first)
 *
 * @param books - Array of book entries to sort
 * @returns Sorted array with oldest books first
 *
 * @example
 * const books = await getCollection('books');
 * const sortedBooks = sortBooksByPublishDateAsc(books);
 */
export function sortBooksByPublishDateAsc(books: BookEntry[]): BookEntry[] {
  return [...books].sort((a, b) => {
    const dateA = new Date(a.data.publishDate).getTime();
    const dateB = new Date(b.data.publishDate).getTime();
    return dateA - dateB; // Oldest first
  });
}

/**
 * Sort books by series order
 *
 * Books without series information are sorted to the end.
 * Within the same series, books are sorted by seriesOrder.
 * Books without seriesOrder within a series are sorted to the end of that series.
 *
 * @param books - Array of book entries to sort
 * @returns Sorted array with series books in order
 *
 * @example
 * const books = await getCollection('books');
 * const sortedBooks = sortBooksBySeriesOrder(books);
 */
export function sortBooksBySeriesOrder(books: BookEntry[]): BookEntry[] {
  return [...books].sort((a, b) => {
    const seriesA = a.data.series;
    const seriesB = b.data.series;
    const orderA = a.data.seriesOrder;
    const orderB = b.data.seriesOrder;

    // Books without series go to the end
    if (!seriesA && seriesB) return 1;
    if (seriesA && !seriesB) return -1;
    if (!seriesA && !seriesB) return 0;

    // Different series: alphabetical by series name
    if (seriesA !== seriesB) {
      return seriesA!.localeCompare(seriesB!);
    }

    // Same series: sort by seriesOrder
    if (orderA !== undefined && orderB !== undefined) {
      return orderA - orderB;
    }

    // Books without order go to the end of their series
    if (orderA !== undefined && orderB === undefined) return -1;
    if (orderA === undefined && orderB !== undefined) return 1;

    return 0;
  });
}

/**
 * Filter news by category
 *
 * @param news - Array of news entries to filter
 * @param category - Category to filter by
 * @returns Filtered array containing only news of the specified category
 *
 * @example
 * const news = await getCollection('news');
 * const releases = filterNewsByCategory(news, 'releases');
 */
export function filterNewsByCategory(
  news: NewsEntry[],
  category: NewsCategory
): NewsEntry[] {
  return news.filter(entry => entry.data.category === category);
}

/**
 * Exclude draft content
 *
 * Filters out draft news items. Books use status field instead of draft.
 * In production, this should be used to hide unpublished content.
 *
 * @param news - Array of news entries
 * @returns Filtered array excluding drafts
 *
 * @example
 * const news = await getCollection('news');
 * const publishedNews = excludeDrafts(news);
 */
export function excludeDrafts(news: NewsEntry[]): NewsEntry[] {
  return news.filter(entry => !entry.data.draft);
}

/**
 * Exclude draft and upcoming books
 *
 * Filters out books with status "draft" or "upcoming".
 * Use this to show only published books on the site.
 *
 * @param books - Array of book entries
 * @returns Filtered array with only published books
 *
 * @example
 * const books = await getCollection('books');
 * const publishedBooks = excludeDraftBooks(books);
 */
export function excludeDraftBooks(books: BookEntry[]): BookEntry[] {
  return books.filter(entry => entry.data.status === "published");
}

/**
 * Filter books by status
 *
 * @param books - Array of book entries
 * @param status - Status to filter by
 * @returns Filtered array containing only books with the specified status
 *
 * @example
 * const books = await getCollection('books');
 * const upcomingBooks = filterBooksByStatus(books, 'upcoming');
 */
export function filterBooksByStatus(
  books: BookEntry[],
  status: "published" | "upcoming" | "draft"
): BookEntry[] {
  return books.filter(entry => entry.data.status === status);
}

/**
 * Sort news by publish date (newest first)
 *
 * @param news - Array of news entries to sort
 * @returns Sorted array with newest news first
 *
 * @example
 * const news = await getCollection('news');
 * const sortedNews = sortNewsByPublishDate(news);
 */
export function sortNewsByPublishDate(news: NewsEntry[]): NewsEntry[] {
  return [...news].sort((a, b) => {
    const dateA = new Date(a.data.publishDate).getTime();
    const dateB = new Date(b.data.publishDate).getTime();
    return dateB - dateA; // Newest first
  });
}

/**
 * Sort news by publish date (oldest first)
 *
 * @param news - Array of news entries to sort
 * @returns Sorted array with oldest news first
 *
 * @example
 * const news = await getCollection('news');
 * const sortedNews = sortNewsByPublishDateAsc(news);
 */
export function sortNewsByPublishDateAsc(news: NewsEntry[]): NewsEntry[] {
  return [...news].sort((a, b) => {
    const dateA = new Date(a.data.publishDate).getTime();
    const dateB = new Date(b.data.publishDate).getTime();
    return dateA - dateB; // Oldest first
  });
}

/**
 * Get books by series
 *
 * Returns all books in a specific series, sorted by series order.
 *
 * @param books - Array of book entries
 * @param seriesName - Name of the series to filter by
 * @returns Filtered and sorted array of books in the series
 *
 * @example
 * const books = await getCollection('books');
 * const trilogy = getBooksBySeries(books, 'The Digital Conscience Trilogy');
 */
export function getBooksBySeries(
  books: BookEntry[],
  seriesName: string
): BookEntry[] {
  const seriesBooks = books.filter(
    entry => entry.data.series === seriesName
  );
  return sortBooksBySeriesOrder(seriesBooks);
}

// ============================================================================
// Reusable Query Functions
// ============================================================================

/**
 * Get all books, sorted by publish date (newest first)
 *
 * @returns Promise resolving to sorted array of all books
 *
 * @example
 * const books = await getAllBooks();
 */
export async function getAllBooks(): Promise<BookEntry[]> {
  const books = await getCollection("books");
  return sortBooksByPublishDate(books);
}

/**
 * Get only published books, sorted by publish date (newest first)
 *
 * Excludes books with status "draft" or "upcoming".
 * Use this for displaying books on the public-facing site.
 *
 * @returns Promise resolving to sorted array of published books
 *
 * @example
 * const publishedBooks = await getPublishedBooks();
 */
export async function getPublishedBooks(): Promise<BookEntry[]> {
  const books = await getCollection("books");
  const published = excludeDraftBooks(books);
  return sortBooksByPublishDate(published);
}

/**
 * Get upcoming books, sorted by publish date (soonest first)
 *
 * Returns books with status "upcoming", useful for "Coming Soon" sections.
 *
 * @returns Promise resolving to sorted array of upcoming books
 *
 * @example
 * const upcomingBooks = await getUpcomingBooks();
 */
export async function getUpcomingBooks(): Promise<BookEntry[]> {
  const books = await getCollection("books");
  const upcoming = filterBooksByStatus(books, "upcoming");
  return sortBooksByPublishDateAsc(upcoming); // Soonest first
}

/**
 * Get all books in a series
 *
 * @param seriesName - Name of the series
 * @returns Promise resolving to sorted array of books in the series
 *
 * @example
 * const trilogy = await getSeriesBooks('The Digital Conscience Trilogy');
 */
export async function getSeriesBooks(seriesName: string): Promise<BookEntry[]> {
  const books = await getCollection("books");
  return getBooksBySeries(books, seriesName);
}

/**
 * Get all news, sorted by publish date (newest first)
 *
 * @returns Promise resolving to sorted array of all news
 *
 * @example
 * const news = await getAllNews();
 */
export async function getAllNews(): Promise<NewsEntry[]> {
  const news = await getCollection("news");
  return sortNewsByPublishDate(news);
}

/**
 * Get only published news (excludes drafts), sorted by publish date
 *
 * In production, always use this instead of getAllNews() to hide drafts.
 *
 * @returns Promise resolving to sorted array of published news
 *
 * @example
 * const publishedNews = await getPublishedNews();
 */
export async function getPublishedNews(): Promise<NewsEntry[]> {
  const news = await getCollection("news");
  const published = excludeDrafts(news);
  return sortNewsByPublishDate(published);
}

/**
 * Get news by category
 *
 * @param category - Category to filter by ('releases', 'events', or 'updates')
 * @param includesDrafts - Whether to include draft news (default: false)
 * @returns Promise resolving to sorted array of news in the specified category
 *
 * @example
 * const releases = await getNewsByCategory('releases');
 * const allEvents = await getNewsByCategory('events', true); // includes drafts
 */
export async function getNewsByCategory(
  category: NewsCategory,
  includesDrafts = false
): Promise<NewsEntry[]> {
  const news = await getCollection("news");
  const filtered = includesDrafts ? news : excludeDrafts(news);
  const byCategory = filterNewsByCategory(filtered, category);
  return sortNewsByPublishDate(byCategory);
}

/**
 * Get latest news items
 *
 * @param limit - Maximum number of news items to return
 * @param includesDrafts - Whether to include draft news (default: false)
 * @returns Promise resolving to array of latest news items
 *
 * @example
 * const latestNews = await getLatestNews(5); // Get 5 most recent news items
 */
export async function getLatestNews(
  limit: number,
  includesDrafts = false
): Promise<NewsEntry[]> {
  const news = includesDrafts
    ? await getAllNews()
    : await getPublishedNews();
  return news.slice(0, limit);
}

/**
 * Get latest books
 *
 * @param limit - Maximum number of books to return
 * @param includeUpcoming - Whether to include upcoming books (default: false)
 * @returns Promise resolving to array of latest books
 *
 * @example
 * const latestBooks = await getLatestBooks(3);
 * const recentAndUpcoming = await getLatestBooks(5, true);
 */
export async function getLatestBooks(
  limit: number,
  includeUpcoming = false
): Promise<BookEntry[]> {
  const books = includeUpcoming
    ? await getAllBooks()
    : await getPublishedBooks();
  return books.slice(0, limit);
}
