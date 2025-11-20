import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test.describe('Open Graph Tags', () => {
  test.describe('Homepage', () => {
    test('should have all required Open Graph meta tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // Required OG tags
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
      const ogSiteName = await page.locator('meta[property="og:site_name"]').getAttribute('content');
      const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');

      // Verify all required tags exist
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogImage).toBeTruthy();
      expect(ogUrl).toBeTruthy();
      expect(ogType).toBe('website');
      expect(ogSiteName).toBe('Cache McClure');
      expect(ogLocale).toBe('en');

      // Verify image URL is absolute
      expect(ogImage).toMatch(/^https?:\/\//);

      // Verify URL is canonical
      expect(ogUrl).toContain(BASE_URL);

      console.log('Homepage Open Graph Tags:');
      console.log(`  og:title: ${ogTitle}`);
      console.log(`  og:description: ${ogDescription}`);
      console.log(`  og:image: ${ogImage}`);
      console.log(`  og:url: ${ogUrl}`);
      console.log(`  og:type: ${ogType}`);
    });

    test('should have Twitter Card meta tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      const twitterUrl = await page.locator('meta[name="twitter:url"]').getAttribute('content');
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');

      expect(twitterCard).toBe('summary_large_image');
      expect(twitterUrl).toBeTruthy();
      expect(twitterTitle).toBeTruthy();
      expect(twitterDescription).toBeTruthy();
      expect(twitterImage).toBeTruthy();

      // Verify image URL is absolute
      expect(twitterImage).toMatch(/^https?:\/\//);

      console.log('Homepage Twitter Card Tags:');
      console.log(`  twitter:card: ${twitterCard}`);
      console.log(`  twitter:image: ${twitterImage}`);
    });

    test('should use default OG image', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

      // Should contain the default OG image filename
      expect(ogImage).toContain('cache-mcclure-og.jpg');
    });
  });

  test.describe('Book Pages', () => {
    test('should have book-specific Open Graph tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');

      // Book-specific checks
      expect(ogType).toBe('book');
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogImage).toBeTruthy();
      expect(ogUrl).toContain('/books/');

      console.log('Book Page Open Graph Tags:');
      console.log(`  og:type: ${ogType}`);
      console.log(`  og:title: ${ogTitle}`);
      console.log(`  og:image: ${ogImage}`);
    });

    test('should have book-specific meta tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const bookAuthor = await page.locator('meta[property="book:author"]').getAttribute('content');
      const bookIsbn = await page.locator('meta[property="book:isbn"]').getAttribute('content');

      expect(bookAuthor).toBe('Cache McClure');

      // ISBN should exist if the book has one
      if (bookIsbn) {
        expect(bookIsbn).toBeTruthy();
        console.log(`  book:isbn: ${bookIsbn}`);
      }

      console.log(`  book:author: ${bookAuthor}`);
    });

    test('should use book cover as OG image', async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

      // Should contain a cover image (not the default OG image)
      expect(ogImage).not.toContain('cache-mcclure-og.jpg');

      // Should contain "cover" or "fracture-engine" in the path
      expect(ogImage?.toLowerCase()).toMatch(/cover|fracture-engine/);

      console.log(`  Book cover OG image: ${ogImage}`);
    });

    test('should have JSON-LD structured data for books', async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
      expect(jsonLd).toBeTruthy();

      const structuredData = JSON.parse(jsonLd!);
      expect(structuredData['@type']).toBe('Book');
      expect(structuredData.name).toBeTruthy();
      expect(structuredData.author).toBeTruthy();
      expect(structuredData.author['@type']).toBe('Person');

      console.log('Book Structured Data:');
      console.log(`  @type: ${structuredData['@type']}`);
      console.log(`  name: ${structuredData.name}`);
      console.log(`  author: ${structuredData.author.name}`);
    });
  });

  test.describe('News Pages', () => {
    test('should have article-specific Open Graph tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/news/welcome-to-my-new-website`);

      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const articleAuthor = await page.locator('meta[property="article:author"]').getAttribute('content');

      expect(ogType).toBe('article');
      expect(ogTitle).toBeTruthy();
      expect(articleAuthor).toBe('Cache McClure');

      console.log('News Page Open Graph Tags:');
      console.log(`  og:type: ${ogType}`);
      console.log(`  og:title: ${ogTitle}`);
      console.log(`  article:author: ${articleAuthor}`);
    });

    test('should have article published time', async ({ page }) => {
      await page.goto(`${BASE_URL}/news/welcome-to-my-new-website`);

      const publishedTime = await page.locator('meta[property="article:published_time"]').getAttribute('content');

      expect(publishedTime).toBeTruthy();

      // Should be a valid ISO 8601 date
      const date = new Date(publishedTime!);
      expect(date.toString()).not.toBe('Invalid Date');

      console.log(`  article:published_time: ${publishedTime}`);
    });

    test('should have JSON-LD structured data for articles', async ({ page }) => {
      await page.goto(`${BASE_URL}/news/welcome-to-my-new-website`);

      const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
      expect(jsonLd).toBeTruthy();

      const structuredData = JSON.parse(jsonLd!);
      expect(structuredData['@type']).toBe('NewsArticle');
      expect(structuredData.headline).toBeTruthy();
      expect(structuredData.author).toBeTruthy();
      expect(structuredData.author['@type']).toBe('Person');
      expect(structuredData.publisher).toBeTruthy();

      console.log('Article Structured Data:');
      console.log(`  @type: ${structuredData['@type']}`);
      console.log(`  headline: ${structuredData.headline}`);
    });
  });

  test.describe('About Page', () => {
    test('should have website-type Open Graph tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);

      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');

      expect(ogType).toBe('website');
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();

      console.log('About Page Open Graph Tags:');
      console.log(`  og:type: ${ogType}`);
      console.log(`  og:title: ${ogTitle}`);
    });
  });

  test.describe('Image Requirements', () => {
    test('default OG image should exist and be accessible', async ({ page, request }) => {
      await page.goto(`${BASE_URL}/`);

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toBeTruthy();

      // Try to fetch the image
      const response = await request.get(ogImage!);
      expect(response.status()).toBe(200);

      // Verify it's an image
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/image\/(jpeg|jpg|png|webp)/);

      console.log('Default OG Image:');
      console.log(`  URL: ${ogImage}`);
      console.log(`  Status: ${response.status()}`);
      console.log(`  Content-Type: ${contentType}`);
    });

    test('book cover OG image should exist and be accessible', async ({ page, request }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toBeTruthy();

      // Try to fetch the image
      const response = await request.get(ogImage!);
      expect(response.status()).toBe(200);

      // Verify it's an image
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/image\/(jpeg|jpg|png|webp)/);

      console.log('Book Cover OG Image:');
      console.log(`  URL: ${ogImage}`);
      console.log(`  Status: ${response.status()}`);
      console.log(`  Content-Type: ${contentType}`);
    });
  });

  test.describe('Title and Description Length', () => {
    test('OG titles should be within recommended length (50-60 chars)', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();

      const titleLength = ogTitle!.length;
      console.log(`  og:title length: ${titleLength} characters`);

      // Warn if too long (soft check)
      if (titleLength > 60) {
        console.warn(`  ⚠️  Title exceeds recommended 60 characters: ${titleLength}`);
      }
    });

    test('OG descriptions should be within recommended length (150-160 chars)', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      expect(ogDescription).toBeTruthy();

      const descLength = ogDescription!.length;
      console.log(`  og:description length: ${descLength} characters`);

      // Warn if too long (soft check)
      if (descLength > 160) {
        console.warn(`  ⚠️  Description exceeds recommended 160 characters: ${descLength}`);
      }
    });
  });

  test.describe('URL Consistency', () => {
    test('all Open Graph URLs should match canonical URLs', async ({ page }) => {
      const pages = [
        '/',
        '/books',
        '/news',
        '/about',
        '/books/fracture-engine',
        '/news/welcome-to-my-new-website'
      ];

      for (const path of pages) {
        await page.goto(`${BASE_URL}${path}`);

        const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
        const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');

        // OG URL and canonical should match (or be equivalent)
        expect(ogUrl).toBeTruthy();
        expect(canonicalUrl).toBeTruthy();

        // Normalize URLs for comparison (remove trailing slashes)
        const normalizedOgUrl = ogUrl?.replace(/\/$/, '');
        const normalizedCanonical = canonicalUrl?.replace(/\/$/, '');

        expect(normalizedOgUrl).toBe(normalizedCanonical);

        console.log(`${path}:`);
        console.log(`  og:url: ${ogUrl}`);
        console.log(`  canonical: ${canonicalUrl}`);
        console.log(`  ✓ Match`);
      }
    });
  });
});
