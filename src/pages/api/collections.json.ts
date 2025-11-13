/**
 * Collections API Endpoint
 *
 * Returns all content collections data as JSON.
 * This endpoint is generated at build time and can be queried
 * from the browser console for testing and debugging.
 *
 * Usage in browser console:
 * ```javascript
 * // Fetch all collections
 * const data = await fetch('/api/collections.json').then(r => r.json());
 * console.log('Books:', data.books);
 * console.log('News:', data.news);
 *
 * // Query specific items
 * const upcomingBooks = data.books.filter(b => b.data.status === 'upcoming');
 * const releaseNews = data.news.filter(n => n.data.category === 'releases');
 * ```
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  // Fetch all collections
  const books = await getCollection('books');
  const news = await getCollection('news');
  const blog = await getCollection('blog');

  // Filter out draft content in production
  const isProduction = import.meta.env.PROD;

  const filteredBooks = isProduction
    ? books.filter(book => book.data.status !== 'draft')
    : books;

  const filteredNews = isProduction
    ? news.filter(post => !post.data.draft)
    : news;

  const filteredBlog = isProduction
    ? blog.filter(post => !post.data.draft)
    : blog;

  // Return serializable data
  return new Response(
    JSON.stringify({
      books: filteredBooks.map(book => ({
        id: book.id,
        slug: book.id.replace(/\.mdx?$/, ''),
        data: {
          ...book.data,
          publishDate: book.data.publishDate.toISOString(),
        },
      })),
      news: filteredNews.map(post => ({
        id: post.id,
        slug: post.id.replace(/\.mdx?$/, ''),
        data: {
          ...post.data,
          publishDate: post.data.publishDate.toISOString(),
        },
      })),
      blog: filteredBlog.map(post => ({
        id: post.id,
        slug: post.id.replace(/\.mdx?$/, ''),
        data: {
          ...post.data,
          pubDatetime: post.data.pubDatetime.toISOString(),
          modDatetime: post.data.modDatetime?.toISOString() || null,
        },
      })),
      meta: {
        generatedAt: new Date().toISOString(),
        counts: {
          books: filteredBooks.length,
          news: filteredNews.length,
          blog: filteredBlog.length,
        },
      },
    }, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
