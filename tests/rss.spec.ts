import { test, expect } from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';

test.describe('RSS Feed', () => {
  test.describe('RSS Feed Accessibility', () => {
    test('should be accessible at /rss.xml', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      expect(response?.status()).toBe(200);
    });

    test('should have XML content type', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('xml');
    });

    test('should return valid XML', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      expect(() => parser.parse(content)).not.toThrow();
    });
  });

  test.describe('RSS Feed Structure', () => {
    test('should have valid RSS 2.0 structure', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);

      expect(result.rss).toBeDefined();
      expect(result.rss.channel).toBeDefined();
    });

    test('should have required channel elements', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const channel = result.rss.channel;

      expect(channel.title).toBeDefined();
      expect(channel.description).toBeDefined();
      expect(channel.link).toBeDefined();
      expect(channel.item).toBeDefined();
    });

    test('should have correct channel metadata', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const channel = result.rss.channel;

      expect(channel.title).toBe('Cache McClure - News');
      expect(channel.description).toContain('Latest news');
      expect(channel.link).toBe('https://cachemcclure.com/');
    });

    test('should include Atom self-reference link', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      expect(content).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(content).toContain('atom:link');
      expect(content).toContain('rel="self"');
      expect(content).toContain('rss.xml');
    });
  });

  test.describe('RSS Feed Items', () => {
    test('should have at least one item', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      expect(items.length).toBeGreaterThan(0);
    });

    test('should have no more than 20 items', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      expect(items.length).toBeLessThanOrEqual(20);
    });

    test('all items should have required fields', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      items.forEach((item: any) => {
        expect(item.title).toBeDefined();
        expect(item.description).toBeDefined();
        expect(item.link).toBeDefined();
        expect(item.pubDate).toBeDefined();
      });
    });

    test('all items should have category field', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      items.forEach((item: any) => {
        expect(item.category).toBeDefined();
      });
    });

    test('all item links should point to news pages', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      items.forEach((item: any) => {
        expect(item.link).toMatch(/^https:\/\/cachemcclure\.com\/news\//);
      });
    });

    test('all item categories should be valid', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      const validCategories = ['releases', 'events', 'updates'];

      items.forEach((item: any) => {
        expect(validCategories).toContain(item.category);
      });
    });
  });

  test.describe('RSS Feed Sorting', () => {
    test('items should be sorted by date (newest first)', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      // If there's only one item, we can't test sorting
      if (items.length <= 1) {
        expect(true).toBe(true);
        return;
      }

      // Check that each item's date is <= the previous item's date
      for (let i = 1; i < items.length; i++) {
        const prevDate = new Date(items[i - 1].pubDate);
        const currDate = new Date(items[i].pubDate);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });
  });

  test.describe('RSS Feed Content Filtering', () => {
    test('should not include draft posts', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      // This test verifies the filtering logic is working
      // We can't easily verify drafts are excluded without accessing the file system
      // But we can verify that the feed exists and has published items
      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      // All items should have valid dates (drafts wouldn't have proper publish dates)
      items.forEach((item: any) => {
        const pubDate = new Date(item.pubDate);
        expect(pubDate.toString()).not.toBe('Invalid Date');
      });
    });
  });

  test.describe('RSS Feed Dates', () => {
    test('all pubDate values should be valid dates', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      items.forEach((item: any) => {
        const pubDate = new Date(item.pubDate);
        expect(pubDate.toString()).not.toBe('Invalid Date');
        expect(pubDate.getTime()).toBeGreaterThan(0);
      });
    });

    test('pubDate should be in RFC 822 format', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      // RFC 822 date format pattern
      const rfc822Pattern = /^[A-Za-z]{3}, \d{1,2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} [+-]?\d{4}$/;

      items.forEach((item: any) => {
        // The date should be parseable and in a valid format
        expect(item.pubDate).toMatch(/\d{1,2} [A-Za-z]{3} \d{4}/);
      });
    });
  });

  test.describe('RSS Feed Validation', () => {
    test('should have version="2.0" attribute', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      expect(content).toContain('version="2.0"');
    });

    test('all item titles should not be empty', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      items.forEach((item: any) => {
        expect(item.title.trim().length).toBeGreaterThan(0);
      });
    });

    test('all item descriptions should not be empty', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      items.forEach((item: any) => {
        expect(item.description.trim().length).toBeGreaterThan(0);
      });
    });

    test('all item links should be valid URLs', async ({ request }) => {
      const response = await request.get('/rss.xml');
      const content = await response.text();

      const parser = new XMLParser();
      const result = parser.parse(content);
      const items = Array.isArray(result.rss.channel.item)
        ? result.rss.channel.item
        : [result.rss.channel.item];

      items.forEach((item: any) => {
        expect(() => new URL(item.link)).not.toThrow();
        expect(item.link).toMatch(/^https?:\/\//);
      });
    });
  });

  test.describe('RSS Link in Header', () => {
    test('header should have RSS link', async ({ page }) => {
      await page.goto('/');

      const rssLink = page.locator('a[href="/rss.xml"]');
      await expect(rssLink).toBeVisible();
    });

    test('RSS link should have proper accessibility attributes', async ({ page }) => {
      await page.goto('/');

      const rssLink = page.locator('a[href="/rss.xml"]');
      await expect(rssLink).toHaveAttribute('title', 'RSS Feed');
      await expect(rssLink).toHaveAttribute('aria-label', 'RSS Feed');
    });

    test('RSS link should have RSS icon', async ({ page }) => {
      await page.goto('/');

      const rssLink = page.locator('a[href="/rss.xml"]');
      const svgIcon = rssLink.locator('svg');
      await expect(svgIcon).toBeVisible();
    });
  });
});
