import { test, expect } from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';

test.describe('Sitemap', () => {
  test.describe('Sitemap Accessibility', () => {
    test('should be accessible at /sitemap-index.xml', async ({ page }) => {
      const response = await page.goto('/sitemap-index.xml');
      expect(response?.status()).toBe(200);
      expect(response?.headers()['content-type']).toContain('xml');
    });

    test('should have a valid sitemap index structure', async ({ request }) => {
      const response = await request.get('/sitemap-index.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      expect(result.sitemapindex).toBeDefined();
      expect(result.sitemapindex.sitemap).toBeDefined();
    });

    test('should reference sitemap-0.xml in the index', async ({ request }) => {
      const response = await request.get('/sitemap-index.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const sitemap = result.sitemapindex.sitemap;
      expect(sitemap.loc).toContain('sitemap-0.xml');
    });

    test('should be accessible at /sitemap-0.xml', async ({ page }) => {
      const response = await page.goto('/sitemap-0.xml');
      expect(response?.status()).toBe(200);
      expect(response?.headers()['content-type']).toContain('xml');
    });
  });

  test.describe('Sitemap Structure', () => {
    test('should have valid XML structure', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      expect(result.urlset).toBeDefined();
      expect(result.urlset.url).toBeDefined();
      expect(Array.isArray(result.urlset.url)).toBeTruthy();
    });

    test('should include correct namespace declarations', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    });

    test('should have URLs with loc elements', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const urls = result.urlset.url;
      urls.forEach((url: any) => {
        expect(url.loc).toBeDefined();
        expect(url.loc).toMatch(/^https:\/\/cachemcclure\.com\//);
      });
    });
  });

  test.describe('Sitemap Content', () => {
    test('should include homepage', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).toContain('<loc>https://cachemcclure.com/</loc>');
    });

    test('should include about page', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).toContain('<loc>https://cachemcclure.com/about/</loc>');
    });

    test('should include books index', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).toContain('<loc>https://cachemcclure.com/books/</loc>');
    });

    test('should include news index', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).toContain('<loc>https://cachemcclure.com/news/</loc>');
    });

    test('should NOT include debug pages', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).not.toContain('/debug/');
    });

    test('should NOT include disabled pages', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).not.toContain('.disabled/');
    });

    test('should NOT include search page', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).not.toContain('<loc>https://cachemcclure.com/search/</loc>');
    });

    test('should NOT include posts and tags pages', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).not.toContain('<loc>https://cachemcclure.com/posts/</loc>');
      expect(content).not.toContain('<loc>https://cachemcclure.com/tags/</loc>');
    });

    test('should NOT include archives page', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      expect(content).not.toContain('<loc>https://cachemcclure.com/archives/</loc>');
    });
  });

  test.describe('Priority Values', () => {
    test('homepage should have priority 1.0', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const homepage = result.urlset.url.find(
        (url: any) => url.loc === 'https://cachemcclure.com/'
      );

      expect(homepage).toBeDefined();
      expect(homepage.priority).toBe(1.0);
    });

    test('about page should have priority 0.8', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const aboutPage = result.urlset.url.find(
        (url: any) => url.loc === 'https://cachemcclure.com/about/'
      );

      expect(aboutPage).toBeDefined();
      expect(aboutPage.priority).toBe(0.8);
    });

    test('books index should have priority 0.9', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const booksIndex = result.urlset.url.find(
        (url: any) => url.loc === 'https://cachemcclure.com/books/'
      );

      expect(booksIndex).toBeDefined();
      expect(booksIndex.priority).toBe(0.9);
    });

    test('individual book pages should have priority 0.9', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const bookPages = result.urlset.url.filter(
        (url: any) => url.loc.includes('/books/') && url.loc !== 'https://cachemcclure.com/books/'
      );

      expect(bookPages.length).toBeGreaterThan(0);
      bookPages.forEach((page: any) => {
        expect(page.priority).toBe(0.9);
      });
    });

    test('news index should have priority 0.7', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const newsIndex = result.urlset.url.find(
        (url: any) => url.loc === 'https://cachemcclure.com/news/'
      );

      expect(newsIndex).toBeDefined();
      expect(newsIndex.priority).toBe(0.7);
    });

    test('individual news posts should have priority 0.7', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const newsPages = result.urlset.url.filter(
        (url: any) => url.loc.includes('/news/') && url.loc !== 'https://cachemcclure.com/news/'
      );

      expect(newsPages.length).toBeGreaterThan(0);
      newsPages.forEach((page: any) => {
        expect(page.priority).toBe(0.7);
      });
    });
  });

  test.describe('Change Frequency', () => {
    test('homepage should have weekly changefreq', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const homepage = result.urlset.url.find(
        (url: any) => url.loc === 'https://cachemcclure.com/'
      );

      expect(homepage).toBeDefined();
      expect(homepage.changefreq).toBe('weekly');
    });

    test('about page should have monthly changefreq', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const aboutPage = result.urlset.url.find(
        (url: any) => url.loc === 'https://cachemcclure.com/about/'
      );

      expect(aboutPage).toBeDefined();
      expect(aboutPage.changefreq).toBe('monthly');
    });

    test('books index should have weekly changefreq', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const booksIndex = result.urlset.url.find(
        (url: any) => url.loc === 'https://cachemcclure.com/books/'
      );

      expect(booksIndex).toBeDefined();
      expect(booksIndex.changefreq).toBe('weekly');
    });

    test('individual book pages should have monthly changefreq', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const bookPages = result.urlset.url.filter(
        (url: any) => url.loc.includes('/books/') && url.loc !== 'https://cachemcclure.com/books/'
      );

      expect(bookPages.length).toBeGreaterThan(0);
      bookPages.forEach((page: any) => {
        expect(page.changefreq).toBe('monthly');
      });
    });

    test('news index should have weekly changefreq', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const newsIndex = result.urlset.url.find(
        (url: any) => url.loc === 'https://cachemcclure.com/news/'
      );

      expect(newsIndex).toBeDefined();
      expect(newsIndex.changefreq).toBe('weekly');
    });

    test('individual news posts should have monthly changefreq', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const newsPages = result.urlset.url.filter(
        (url: any) => url.loc.includes('/news/') && url.loc !== 'https://cachemcclure.com/news/'
      );

      expect(newsPages.length).toBeGreaterThan(0);
      newsPages.forEach((page: any) => {
        expect(page.changefreq).toBe('monthly');
      });
    });
  });

  test.describe('Sitemap Validation', () => {
    test('all URLs should be absolute URLs', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const urls = result.urlset.url;
      urls.forEach((url: any) => {
        expect(url.loc).toMatch(/^https?:\/\//);
      });
    });

    test('all URLs should use HTTPS', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const urls = result.urlset.url;
      urls.forEach((url: any) => {
        expect(url.loc).toMatch(/^https:\/\//);
      });
    });

    test('all changefreq values should be valid', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const validChangefreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

      const urls = result.urlset.url;
      urls.forEach((url: any) => {
        expect(validChangefreqs).toContain(url.changefreq);
      });
    });

    test('all priority values should be between 0.0 and 1.0', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      const urls = result.urlset.url;
      urls.forEach((url: any) => {
        expect(url.priority).toBeGreaterThanOrEqual(0.0);
        expect(url.priority).toBeLessThanOrEqual(1.0);
      });
    });
  });
});
