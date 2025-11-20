import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test.describe('Twitter Cards', () => {
  test.describe('Required Twitter Card Tags', () => {
    test('homepage should have all required Twitter Card meta tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      const twitterUrl = await page.locator('meta[name="twitter:url"]').getAttribute('content');
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');

      // Verify required tags exist
      expect(twitterCard).toBe('summary_large_image');
      expect(twitterUrl).toBeTruthy();
      expect(twitterTitle).toBeTruthy();
      expect(twitterDescription).toBeTruthy();
      expect(twitterImage).toBeTruthy();

      // Verify image URL is absolute
      expect(twitterImage).toMatch(/^https?:\/\//);

      // Verify URL contains the base URL
      expect(twitterUrl).toContain(BASE_URL);

      console.log('Homepage Twitter Card Tags:');
      console.log(`  twitter:card: ${twitterCard}`);
      console.log(`  twitter:title: ${twitterTitle}`);
      console.log(`  twitter:description: ${twitterDescription}`);
      console.log(`  twitter:image: ${twitterImage}`);
      console.log(`  twitter:url: ${twitterUrl}`);
    });

    test('book page should have all required Twitter Card meta tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

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

      console.log('Book Page Twitter Card Tags:');
      console.log(`  twitter:card: ${twitterCard}`);
      console.log(`  twitter:title: ${twitterTitle}`);
    });

    test('news page should have all required Twitter Card meta tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/news/welcome-to-my-new-website`);

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

      console.log('News Page Twitter Card Tags:');
      console.log(`  twitter:card: ${twitterCard}`);
      console.log(`  twitter:title: ${twitterTitle}`);
    });

    test('about page should have all required Twitter Card meta tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);

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

      console.log('About Page Twitter Card Tags:');
      console.log(`  twitter:card: ${twitterCard}`);
      console.log(`  twitter:title: ${twitterTitle}`);
    });
  });

  test.describe('Optional Twitter Card Tags', () => {
    test('should check for optional twitter:site tag', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterSite = page.locator('meta[name="twitter:site"]');
      const twitterSiteCount = await twitterSite.count();

      if (twitterSiteCount > 0) {
        const content = await twitterSite.getAttribute('content');
        expect(content).toBeTruthy();
        expect(content).toMatch(/^@/); // Should start with @
        console.log(`  twitter:site: ${content} (configured)`);
      } else {
        console.log('  twitter:site: not configured (optional)');
      }
    });

    test('should check for optional twitter:creator tag', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterCreator = page.locator('meta[name="twitter:creator"]');
      const twitterCreatorCount = await twitterCreator.count();

      if (twitterCreatorCount > 0) {
        const content = await twitterCreator.getAttribute('content');
        expect(content).toBeTruthy();
        expect(content).toMatch(/^@/); // Should start with @
        console.log(`  twitter:creator: ${content} (configured)`);
      } else {
        console.log('  twitter:creator: not configured (optional)');
      }
    });

    test('book page should have same optional tags as homepage', async ({ page }) => {
      // Get homepage tags
      await page.goto(`${BASE_URL}/`);
      const homepageSite = await page.locator('meta[name="twitter:site"]').count();
      const homepageCreator = await page.locator('meta[name="twitter:creator"]').count();

      // Get book page tags
      await page.goto(`${BASE_URL}/books/fracture-engine`);
      const bookSite = await page.locator('meta[name="twitter:site"]').count();
      const bookCreator = await page.locator('meta[name="twitter:creator"]').count();

      // Should be consistent across pages
      expect(bookSite).toBe(homepageSite);
      expect(bookCreator).toBe(homepageCreator);

      console.log('Optional tags consistency:');
      console.log(`  twitter:site present: ${bookSite > 0 ? 'yes' : 'no'}`);
      console.log(`  twitter:creator present: ${bookCreator > 0 ? 'yes' : 'no'}`);
    });
  });

  test.describe('Twitter Card Images', () => {
    test('homepage should use default OG image for Twitter Card', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

      // Twitter image should match OG image
      expect(twitterImage).toBe(ogImage);

      // Should contain the default OG image filename
      expect(twitterImage).toContain('cache-mcclure-og.jpg');

      console.log('Homepage Twitter Card Image:');
      console.log(`  Image URL: ${twitterImage}`);
    });

    test('book page should use book cover for Twitter Card', async ({ page }) => {
      await page.goto(`${BASE_URL}/books/fracture-engine`);

      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

      // Twitter image should match OG image
      expect(twitterImage).toBe(ogImage);

      // Should not use default image
      expect(twitterImage).not.toContain('cache-mcclure-og.jpg');

      // Should contain book-specific imagery
      expect(twitterImage?.toLowerCase()).toMatch(/cover|fracture-engine/);

      console.log('Book Page Twitter Card Image:');
      console.log(`  Image URL: ${twitterImage}`);
    });

    test('Twitter Card images should be accessible', async ({ page, request }) => {
      const pages = [
        '/',
        '/books/fracture-engine',
        '/news/welcome-to-my-new-website',
        '/about'
      ];

      for (const path of pages) {
        await page.goto(`${BASE_URL}${path}`);

        const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
        expect(twitterImage).toBeTruthy();

        // Try to fetch the image
        const response = await request.get(twitterImage!);
        expect(response.status()).toBe(200);

        // Verify it's an image
        const contentType = response.headers()['content-type'];
        expect(contentType).toMatch(/image\/(jpeg|jpg|png|webp)/);

        console.log(`${path}:`);
        console.log(`  Twitter image: ${twitterImage}`);
        console.log(`  Status: ${response.status()}`);
        console.log(`  Type: ${contentType}`);
      }
    });

    test('Twitter Card images should meet size requirements', async ({ page, request }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
      expect(twitterImage).toBeTruthy();

      const response = await request.get(twitterImage!);
      const buffer = await response.body();
      const sizeInBytes = buffer.length;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      // Twitter recommends images under 5MB
      expect(sizeInMB).toBeLessThan(5);

      console.log('Twitter Card Image Size:');
      console.log(`  Size: ${(sizeInBytes / 1024).toFixed(2)} KB`);
      console.log(`  Size: ${sizeInMB.toFixed(2)} MB`);
      console.log(`  Under 5MB limit: ✓`);
    });
  });

  test.describe('Twitter Card Content Consistency', () => {
    test('Twitter Card title should match og:title', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');

      expect(twitterTitle).toBe(ogTitle);

      console.log('Title consistency:');
      console.log(`  twitter:title: ${twitterTitle}`);
      console.log(`  og:title: ${ogTitle}`);
      console.log(`  Match: ✓`);
    });

    test('Twitter Card description should match og:description', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');

      expect(twitterDescription).toBe(ogDescription);

      console.log('Description consistency:');
      console.log(`  twitter:description: ${twitterDescription}`);
      console.log(`  og:description: ${ogDescription}`);
      console.log(`  Match: ✓`);
    });

    test('Twitter Card URL should match canonical URL', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterUrl = await page.locator('meta[name="twitter:url"]').getAttribute('content');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');

      // Normalize URLs for comparison (remove trailing slashes)
      const normalizedTwitterUrl = twitterUrl?.replace(/\/$/, '');
      const normalizedCanonical = canonicalUrl?.replace(/\/$/, '');

      expect(normalizedTwitterUrl).toBe(normalizedCanonical);

      console.log('URL consistency:');
      console.log(`  twitter:url: ${twitterUrl}`);
      console.log(`  canonical: ${canonicalUrl}`);
      console.log(`  Match: ✓`);
    });

    test('all pages should have consistent Twitter Card format', async ({ page }) => {
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

        const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');

        // All pages should use summary_large_image
        expect(twitterCard).toBe('summary_large_image');

        console.log(`${path}: twitter:card = ${twitterCard}`);
      }
    });
  });

  test.describe('Twitter Card Validation', () => {
    test('should not have duplicate Twitter Card tags', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const cardCount = await page.locator('meta[name="twitter:card"]').count();
      const titleCount = await page.locator('meta[name="twitter:title"]').count();
      const descCount = await page.locator('meta[name="twitter:description"]').count();
      const imageCount = await page.locator('meta[name="twitter:image"]').count();
      const urlCount = await page.locator('meta[name="twitter:url"]').count();

      expect(cardCount).toBe(1);
      expect(titleCount).toBe(1);
      expect(descCount).toBe(1);
      expect(imageCount).toBe(1);
      expect(urlCount).toBe(1);

      console.log('Twitter Card tag uniqueness:');
      console.log(`  twitter:card: ${cardCount} instance(s)`);
      console.log(`  twitter:title: ${titleCount} instance(s)`);
      console.log(`  twitter:description: ${descCount} instance(s)`);
      console.log(`  twitter:image: ${imageCount} instance(s)`);
      console.log(`  twitter:url: ${urlCount} instance(s)`);
      console.log('  All unique: ✓');
    });

    test('Twitter Card tags should be in page head', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const headTags = await page.locator('head meta[name^="twitter:"]').count();
      const bodyTags = await page.locator('body meta[name^="twitter:"]').count();

      expect(headTags).toBeGreaterThan(0);
      expect(bodyTags).toBe(0);

      console.log('Twitter Card tag location:');
      console.log(`  In <head>: ${headTags} tags`);
      console.log(`  In <body>: ${bodyTags} tags`);
      console.log('  All in head: ✓');
    });

    test('required Twitter Card values should not be empty', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
      const twitterUrl = await page.locator('meta[name="twitter:url"]').getAttribute('content');

      expect(twitterCard?.trim()).not.toBe('');
      expect(twitterTitle?.trim()).not.toBe('');
      expect(twitterDescription?.trim()).not.toBe('');
      expect(twitterImage?.trim()).not.toBe('');
      expect(twitterUrl?.trim()).not.toBe('');

      console.log('Twitter Card values are non-empty: ✓');
    });
  });
});
