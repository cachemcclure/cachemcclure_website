import { test, expect } from '@playwright/test';

test.describe('Robots.txt', () => {
  test.describe('Robots.txt Accessibility', () => {
    test('should be accessible at /robots.txt', async ({ page }) => {
      const response = await page.goto('/robots.txt');
      expect(response?.status()).toBe(200);
    });

    test('should have correct content type', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const contentType = response.headers()['content-type'];

      // Accept text/plain or no content-type (Astro may serve static files without explicit content-type)
      if (contentType) {
        expect(contentType).toMatch(/text\/plain|text\/x-robots/);
      }
    });
  });

  test.describe('Robots.txt Structure', () => {
    test('should contain User-agent directive', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      expect(content).toContain('User-agent:');
    });

    test('should allow all crawlers by default', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      // Check for "User-agent: *" (allow all)
      expect(content).toMatch(/User-agent:\s*\*/);
    });

    test('should contain Allow directive', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      expect(content).toContain('Allow:');
    });

    test('should reference sitemap location', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      expect(content).toContain('Sitemap:');
    });
  });

  test.describe('Robots.txt Content', () => {
    test('should reference correct sitemap URL', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      expect(content).toContain('Sitemap: https://cachemcclure.com/sitemap-index.xml');
    });

    test('should allow access to root path', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      expect(content).toMatch(/Allow:\s*\//);
    });

    test('should not have typos or syntax errors', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      // Check for common typos
      expect(content.toLowerCase()).not.toContain('user-agents:'); // Plural
      expect(content.toLowerCase()).not.toContain('useragent:'); // No hyphen
      expect(content.toLowerCase()).not.toContain('sitemaps:'); // Plural
    });
  });

  test.describe('Robots.txt Format Validation', () => {
    test('should use correct line structure', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      // Split into lines and filter out empty lines and comments
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      // Each non-comment line should be a valid directive
      lines.forEach(line => {
        // Should match pattern: "Directive: value"
        const validDirectives = ['User-agent:', 'Allow:', 'Disallow:', 'Sitemap:', 'Crawl-delay:'];
        const hasValidDirective = validDirectives.some(directive =>
          line.startsWith(directive)
        );

        expect(hasValidDirective).toBeTruthy();
      });
    });

    test('should not be empty', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      expect(content.trim().length).toBeGreaterThan(0);
    });

    test('should have reasonable file size', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      // robots.txt should be small (< 10KB is reasonable)
      expect(content.length).toBeLessThan(10000);
    });
  });

  test.describe('SEO Best Practices', () => {
    test('should follow 2025 robots.txt format', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      // Should have the basic structure:
      // User-agent: *
      // Allow: /
      // Sitemap: [URL]

      const hasUserAgent = content.includes('User-agent:');
      const hasSitemap = content.includes('Sitemap:');

      expect(hasUserAgent).toBeTruthy();
      expect(hasSitemap).toBeTruthy();
    });

    test('sitemap URL should use HTTPS', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      const sitemapLine = content
        .split('\n')
        .find(line => line.trim().startsWith('Sitemap:'));

      expect(sitemapLine).toBeDefined();
      expect(sitemapLine).toContain('https://');
    });

    test('should not block important content accidentally', async ({ request }) => {
      const response = await request.get('/robots.txt');
      const content = await response.text();

      // Make sure we're not accidentally blocking important paths
      // For this author website, we want books and news to be crawlable
      expect(content).not.toContain('Disallow: /books');
      expect(content).not.toContain('Disallow: /news');
      expect(content).not.toContain('Disallow: /about');
    });
  });
});
