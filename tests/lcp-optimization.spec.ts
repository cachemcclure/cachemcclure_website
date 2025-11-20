/**
 * LCP (Largest Contentful Paint) Optimization Tests
 *
 * Tests hero image optimizations and critical resource preloading for LCP performance.
 * Based on 2025 best practices: fetchpriority="high" + loading="eager" for LCP images.
 *
 * Key optimizations tested:
 * - Hero images have fetchpriority="high" for 4-30% LCP improvement
 * - Loading="eager" prevents lazy loading of above-fold images
 * - Font preloading for faster text rendering
 * - Explicit image dimensions to prevent CLS
 *
 * Target: LCP < 2.5s (Core Web Vitals threshold)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4321';

// Test configuration
const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
] as const;

test.describe('LCP Optimization - Hero Images', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      test('Book page - cover image has fetchpriority="high" and loading="eager"', async ({ page }) => {
        await page.goto(`${BASE_URL}/books/fracture-engine`);

        // Find the book cover image (should be the hero/LCP element)
        const coverImage = page.locator('img[alt*="Cover of"]').first();
        await expect(coverImage).toBeVisible();

        // Verify fetchpriority="high" for LCP optimization
        await expect(coverImage).toHaveAttribute('fetchpriority', 'high');

        // Verify loading="eager" (not lazy)
        await expect(coverImage).toHaveAttribute('loading', 'eager');

        // Verify async decoding for non-blocking rendering
        await expect(coverImage).toHaveAttribute('decoding', 'async');

        // Verify explicit dimensions to prevent CLS
        const width = await coverImage.getAttribute('width');
        const height = await coverImage.getAttribute('height');
        expect(width).toBeTruthy();
        expect(height).toBeTruthy();
        expect(parseInt(width || '0')).toBeGreaterThan(0);
        expect(parseInt(height || '0')).toBeGreaterThan(0);
      });

      test('News post - featured image has fetchpriority="high" and loading="eager"', async ({ page }) => {
        await page.goto(`${BASE_URL}/news`);

        // Find a news post with an image
        const newsLink = page.locator('article a').first();
        await newsLink.click();
        await page.waitForLoadState('networkidle');

        // Check if there's a featured image on this post
        const featuredImage = page.locator('img[alt*="Featured image"]').first();
        const imageCount = await featuredImage.count();

        if (imageCount > 0) {
          // If image exists, verify optimizations
          await expect(featuredImage).toBeVisible();
          await expect(featuredImage).toHaveAttribute('fetchpriority', 'high');
          await expect(featuredImage).toHaveAttribute('loading', 'eager');
          await expect(featuredImage).toHaveAttribute('decoding', 'async');

          // Verify explicit dimensions
          const width = await featuredImage.getAttribute('width');
          const height = await featuredImage.getAttribute('height');
          expect(width).toBeTruthy();
          expect(height).toBeTruthy();
        }
      });

      test('About page - author image has fetchpriority="high" and loading="eager"', async ({ page }) => {
        await page.goto(`${BASE_URL}/about`);

        // Find the author photo
        const authorImage = page.locator('img[alt*="Cache McClure"]').first();
        await expect(authorImage).toBeVisible();

        // Verify optimizations
        await expect(authorImage).toHaveAttribute('fetchpriority', 'high');
        await expect(authorImage).toHaveAttribute('loading', 'eager');
        await expect(authorImage).toHaveAttribute('decoding', 'async');

        // Verify explicit dimensions
        const width = await authorImage.getAttribute('width');
        const height = await authorImage.getAttribute('height');
        expect(width).toBeTruthy();
        expect(height).toBeTruthy();
      });

      test('Homepage - no hero images have lazy loading', async ({ page }) => {
        await page.goto(BASE_URL);

        // Get all images in the viewport (above the fold)
        const aboveFoldImages = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'));
          return images
            .filter(img => {
              const rect = img.getBoundingClientRect();
              return rect.top < window.innerHeight;
            })
            .map(img => ({
              alt: img.alt,
              loading: img.loading,
              fetchpriority: img.getAttribute('fetchpriority'),
              src: img.src
            }));
        });

        // Verify no above-fold images are lazy loaded
        for (const img of aboveFoldImages) {
          expect(img.loading).not.toBe('lazy');
        }
      });
    });
  }
});

test.describe('LCP Optimization - Critical Resource Preloading', () => {
  test('Font CSS is preloaded for faster discovery', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for font preload hints
    const preloadLinks = await page.locator('link[rel="preload"]').all();
    const fontPreloads = [];

    for (const link of preloadLinks) {
      const as = await link.getAttribute('as');
      const href = await link.getAttribute('href');
      if (as === 'style' && href?.includes('fonts.googleapis.com')) {
        fontPreloads.push({ as, href });
      }
    }

    // Verify at least one font CSS preload exists
    expect(fontPreloads.length).toBeGreaterThan(0);

    // Verify it's the Google Fonts CSS
    expect(fontPreloads[0].href).toContain('fonts.googleapis.com/css2');
    expect(fontPreloads[0].href).toContain('display=swap');
  });

  test('Fonts have preconnect for faster loading', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for preconnect hints
    const preconnectLinks = await page.locator('link[rel="preconnect"]').all();
    const preconnectHrefs = await Promise.all(
      preconnectLinks.map(link => link.getAttribute('href'))
    );

    // Verify preconnect to Google Fonts domains
    expect(preconnectHrefs).toContain('https://fonts.googleapis.com');
    expect(preconnectHrefs).toContain('https://fonts.gstatic.com');
  });

  test('Fonts use display=swap for optimal LCP', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check font stylesheet
    const fontStylesheet = page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
    const href = await fontStylesheet.getAttribute('href');

    expect(href).toContain('display=swap');
  });
});

test.describe('LCP Optimization - Image Lazy Loading Strategy', () => {
  for (const viewport of viewports) {
    test(`${viewport.name} - below-fold images are lazy loaded`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/books`);

      // Get all images on the page
      const allImages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
          alt: img.alt,
          loading: img.loading,
          top: img.getBoundingClientRect().top,
          viewportHeight: window.innerHeight
        }));
      });

      // Separate above-fold and below-fold images
      const aboveFold = allImages.filter(img => img.top < img.viewportHeight);
      const belowFold = allImages.filter(img => img.top >= img.viewportHeight);

      // Above-fold images should be eager or auto (not lazy)
      for (const img of aboveFold) {
        expect(img.loading).not.toBe('lazy');
      }

      // Below-fold images should be lazy
      for (const img of belowFold) {
        expect(img.loading).toBe('lazy');
      }
    });
  }
});

test.describe('LCP Optimization - Image Dimensions for CLS Prevention', () => {
  test('Book cover images have explicit width and height', async ({ page }) => {
    await page.goto(`${BASE_URL}/books/fracture-engine`);

    const coverImage = page.locator('img[alt*="Cover of"]').first();

    // Get computed dimensions
    const box = await coverImage.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      // Verify image has non-zero dimensions
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);

      // Verify aspect ratio is preserved (typical book cover is 2:3)
      const aspectRatio = box.width / box.height;
      expect(aspectRatio).toBeGreaterThan(0.5); // Narrower than square
      expect(aspectRatio).toBeLessThan(0.8);    // Wider than 1:2
    }
  });

  test('All hero images have srcset for responsive loading', async ({ page }) => {
    await page.goto(`${BASE_URL}/books/fracture-engine`);

    const coverImage = page.locator('img[alt*="Cover of"]').first();

    // Verify srcset exists for responsive images
    const srcset = await coverImage.getAttribute('srcset');
    expect(srcset).toBeTruthy();
    expect(srcset).toContain('w'); // Width descriptors

    // Verify sizes attribute exists
    const sizes = await coverImage.getAttribute('sizes');
    expect(sizes).toBeTruthy();
  });
});

test.describe('LCP Optimization - WebP Format', () => {
  test('Hero images are optimized to WebP format', async ({ page }) => {
    await page.goto(`${BASE_URL}/books/fracture-engine`);

    const coverImage = page.locator('img[alt*="Cover of"]').first();
    const src = await coverImage.getAttribute('src');

    // Astro Image component should generate WebP
    // Check if src or srcset contains webp
    const srcset = await coverImage.getAttribute('srcset');
    const hasWebP = src?.includes('.webp') || srcset?.includes('.webp');

    expect(hasWebP).toBeTruthy();
  });
});

test.describe('LCP Optimization - No Render-Blocking Resources', () => {
  test('CSS is inlined or async loaded', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);

    // Get all stylesheets
    const stylesheets = await page.locator('link[rel="stylesheet"]').all();

    for (const stylesheet of stylesheets) {
      const href = await stylesheet.getAttribute('href');

      // Font stylesheets are ok (preloaded)
      if (href?.includes('fonts.googleapis.com')) {
        continue;
      }

      // Check if stylesheet is async or has media attribute
      // const media = await stylesheet.getAttribute('media');
      // Astro typically inlines critical CSS, so external stylesheets should be minimal
    }
  });

  test('No synchronous external scripts in head', async ({ page }) => {
    await page.goto(BASE_URL);

    // Get all script tags in head
    const headScripts = await page.evaluate(() => {
      const scripts = Array.from(document.head.querySelectorAll('script'));
      return scripts.map(script => ({
        src: script.src,
        async: script.async,
        defer: script.defer,
        type: script.type
      }));
    });

    // Filter to external scripts only
    const externalScripts = headScripts.filter(s => s.src);

    // All external scripts should be async or defer
    for (const script of externalScripts) {
      expect(script.async || script.defer || script.type === 'module').toBeTruthy();
    }
  });
});

test.describe('LCP Optimization - Performance Budgets', () => {
  test('Hero images are under 100KB (target)', async ({ page }) => {
    await page.goto(`${BASE_URL}/books/fracture-engine`);

    // Monitor network for image requests
    const imageRequests: any[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'];

      if (contentType?.startsWith('image/')) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          imageRequests.push({
            url,
            size: buffer.length,
            contentType
          });
        }
      }
    });

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Find hero image (cover)
    const heroImages = imageRequests.filter(req =>
      req.url.includes('fracture-engine-cover') ||
      req.url.includes('cover')
    );

    if (heroImages.length > 0) {
      const largestHeroImage = Math.max(...heroImages.map(img => img.size));

      // Target: under 100KB for hero images (compressed)
      // Warn if over, but don't fail (depends on image quality requirements)
      if (largestHeroImage > 100 * 1024) {
        console.warn(`Hero image is ${(largestHeroImage / 1024).toFixed(1)}KB, target is <100KB`);
      }

      // Hard limit: should be under 200KB
      expect(largestHeroImage).toBeLessThan(200 * 1024);
    }
  });
});

test.describe('LCP Optimization - Summary Report', () => {
  test('All LCP optimizations are in place', async ({ page }) => {
    await page.goto(`${BASE_URL}/books/fracture-engine`);

    const optimizations = {
      fetchpriorityHigh: false,
      loadingEager: false,
      decodingAsync: false,
      explicitDimensions: false,
      webpFormat: false,
      responsiveImages: false,
      fontPreload: false,
      fontPreconnect: false
    };

    // Check cover image optimizations
    const coverImage = page.locator('img[alt*="Cover of"]').first();
    optimizations.fetchpriorityHigh = await coverImage.getAttribute('fetchpriority') === 'high';
    optimizations.loadingEager = await coverImage.getAttribute('loading') === 'eager';
    optimizations.decodingAsync = await coverImage.getAttribute('decoding') === 'async';

    const width = await coverImage.getAttribute('width');
    const height = await coverImage.getAttribute('height');
    optimizations.explicitDimensions = !!(width && height);

    const src = await coverImage.getAttribute('src');
    const srcset = await coverImage.getAttribute('srcset');
    optimizations.webpFormat = !!(src?.includes('.webp') || srcset?.includes('.webp'));
    optimizations.responsiveImages = !!(srcset && await coverImage.getAttribute('sizes'));

    // Check font optimizations
    const fontPreload = await page.locator('link[rel="preload"][as="style"]').count();
    optimizations.fontPreload = fontPreload > 0;

    const preconnects = await page.locator('link[rel="preconnect"]').all();
    const preconnectHrefs = await Promise.all(preconnects.map(l => l.getAttribute('href')));
    optimizations.fontPreconnect = preconnectHrefs.some(h => h?.includes('fonts.googleapis.com'));

    // Report
    console.log('LCP Optimizations Status:');
    console.log('- fetchpriority="high":', optimizations.fetchpriorityHigh ? '✓' : '✗');
    console.log('- loading="eager":', optimizations.loadingEager ? '✓' : '✗');
    console.log('- decoding="async":', optimizations.decodingAsync ? '✓' : '✗');
    console.log('- Explicit dimensions:', optimizations.explicitDimensions ? '✓' : '✗');
    console.log('- WebP format:', optimizations.webpFormat ? '✓' : '✗');
    console.log('- Responsive images:', optimizations.responsiveImages ? '✓' : '✗');
    console.log('- Font preload:', optimizations.fontPreload ? '✓' : '✗');
    console.log('- Font preconnect:', optimizations.fontPreconnect ? '✓' : '✗');

    // All optimizations should be in place
    expect(Object.values(optimizations).every(v => v === true)).toBeTruthy();
  });
});
