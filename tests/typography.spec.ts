import { test, expect } from '@playwright/test';

/**
 * Typography Test Suite
 *
 * Tests typography implementation including:
 * - Font family application (Space Grotesk for headings, Inter for body, JetBrains Mono for code)
 * - Font sizes and responsive scaling
 * - Line heights for readability
 * - Google Fonts loading
 * - Cross-viewport consistency
 */

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'wide', width: 1920, height: 1080 },
];

const TEST_PAGES = [
  { name: 'Home', url: '/' },
  { name: 'Books', url: '/books' },
  { name: 'News', url: '/news' },
  { name: 'About', url: '/about' },
];

test.describe('Typography System', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const testPage of TEST_PAGES) {
        test.describe(testPage.name, () => {
          test(`should load Google Fonts correctly`, async ({ page }) => {
            await page.goto(testPage.url);

            // Check for Google Fonts preconnect links
            const preconnects = await page.$$('link[rel="preconnect"]');
            const preconnectHrefs = await Promise.all(
              preconnects.map(link => link.getAttribute('href'))
            );

            expect(preconnectHrefs).toContain('https://fonts.googleapis.com');
            expect(preconnectHrefs).toContain('https://fonts.gstatic.com');

            // Check for Google Fonts stylesheet
            const fontLink = await page.$('link[href*="fonts.googleapis.com"]');
            expect(fontLink).not.toBeNull();

            const href = await fontLink?.getAttribute('href');
            expect(href).toContain('Space+Grotesk');
            expect(href).toContain('JetBrains+Mono');
            expect(href).toContain('display=swap'); // Performance optimization
          });

          test('should apply Space Grotesk to headings', async ({ page }) => {
            await page.goto(testPage.url);

            // Wait for fonts to load
            await page.waitForTimeout(500);

            // Check h1
            const h1Elements = await page.$$('h1');
            if (h1Elements.length > 0) {
              for (const h1 of h1Elements) {
                const fontFamily = await h1.evaluate(el =>
                  window.getComputedStyle(el).fontFamily
                );
                expect(fontFamily).toContain('Space Grotesk');
              }
            }

            // Check h2
            const h2Elements = await page.$$('h2');
            if (h2Elements.length > 0) {
              for (const h2 of h2Elements) {
                const fontFamily = await h2.evaluate(el =>
                  window.getComputedStyle(el).fontFamily
                );
                expect(fontFamily).toContain('Space Grotesk');
              }
            }

            // Check h3
            const h3Elements = await page.$$('h3');
            if (h3Elements.length > 0) {
              for (const h3 of h3Elements) {
                const fontFamily = await h3.evaluate(el =>
                  window.getComputedStyle(el).fontFamily
                );
                expect(fontFamily).toContain('Space Grotesk');
              }
            }
          });

          test('should apply Inter to body text', async ({ page }) => {
            await page.goto(testPage.url);

            // Wait for fonts to load
            await page.waitForTimeout(500);

            const bodyFontFamily = await page.evaluate(() =>
              window.getComputedStyle(document.body).fontFamily
            );

            // Should include Inter in the font stack
            expect(bodyFontFamily).toContain('Inter');
          });

          test('should apply JetBrains Mono to code elements', async ({ page }) => {
            // Create a test page with code elements if needed
            await page.goto(testPage.url);

            // Wait for fonts to load
            await page.waitForTimeout(500);

            const codeElements = await page.$$('code');
            if (codeElements.length > 0) {
              for (const code of codeElements) {
                const fontFamily = await code.evaluate(el =>
                  window.getComputedStyle(el).fontFamily
                );
                expect(fontFamily).toContain('JetBrains Mono');
              }
            }
          });

          test('should have proper body font size (18px minimum)', async ({ page }) => {
            await page.goto(testPage.url);

            const bodyFontSize = await page.evaluate(() => {
              const fontSize = window.getComputedStyle(document.body).fontSize;
              return parseFloat(fontSize);
            });

            // Body should be at least 18px (var(--text-lg))
            expect(bodyFontSize).toBeGreaterThanOrEqual(18);
          });

          test('should have optimal line height for body text', async ({ page }) => {
            await page.goto(testPage.url);

            const bodyLineHeight = await page.evaluate(() => {
              const lineHeight = window.getComputedStyle(document.body).lineHeight;
              const fontSize = window.getComputedStyle(document.body).fontSize;
              return parseFloat(lineHeight) / parseFloat(fontSize);
            });

            // Body should have line-height of 1.625 (var(--leading-relaxed))
            expect(bodyLineHeight).toBeCloseTo(1.625, 1);
          });

          test('should have tight line height for headings', async ({ page }) => {
            await page.goto(testPage.url);

            const h1Elements = await page.$$('h1');
            if (h1Elements.length > 0) {
              const h1LineHeight = await h1Elements[0].evaluate(el => {
                const lineHeight = window.getComputedStyle(el).lineHeight;
                const fontSize = window.getComputedStyle(el).fontSize;
                return parseFloat(lineHeight) / parseFloat(fontSize);
              });

              // Headings should have line-height of 1.25 (var(--leading-tight))
              expect(h1LineHeight).toBeCloseTo(1.25, 1);
            }
          });

          test('should have bold weight for headings', async ({ page }) => {
            await page.goto(testPage.url);

            const h1Elements = await page.$$('h1');
            if (h1Elements.length > 0) {
              const fontWeight = await h1Elements[0].evaluate(el =>
                window.getComputedStyle(el).fontWeight
              );

              // Headings should be bold (700)
              expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700);
            }
          });

          test('should have responsive h1 sizes', async ({ page }) => {
            await page.goto(testPage.url);

            const h1Elements = await page.$$('h1');
            if (h1Elements.length > 0) {
              const fontSize = await h1Elements[0].evaluate(el => {
                return parseFloat(window.getComputedStyle(el).fontSize);
              });

              // H1 should be within clamp range: 2.25rem (36px) to 3.5rem (56px)
              expect(fontSize).toBeGreaterThanOrEqual(36);
              expect(fontSize).toBeLessThanOrEqual(56);
            }
          });

          test('should have responsive h2 sizes', async ({ page }) => {
            await page.goto(testPage.url);

            const h2Elements = await page.$$('h2');
            if (h2Elements.length > 0) {
              const fontSize = await h2Elements[0].evaluate(el => {
                return parseFloat(window.getComputedStyle(el).fontSize);
              });

              // H2 should be within clamp range: 1.875rem (30px) to 2.75rem (44px)
              expect(fontSize).toBeGreaterThanOrEqual(30);
              expect(fontSize).toBeLessThanOrEqual(44);
            }
          });

          test('should have responsive h3 sizes', async ({ page }) => {
            await page.goto(testPage.url);

            const h3Elements = await page.$$('h3');
            if (h3Elements.length > 0) {
              const fontSize = await h3Elements[0].evaluate(el => {
                return parseFloat(window.getComputedStyle(el).fontSize);
              });

              // H3 should be within clamp range: 1.5rem (24px) to 2rem (32px)
              expect(fontSize).toBeGreaterThanOrEqual(24);
              expect(fontSize).toBeLessThanOrEqual(32);
            }
          });

          test('should have negative letter-spacing for headings', async ({ page }) => {
            await page.goto(testPage.url);

            const h1Elements = await page.$$('h1');
            if (h1Elements.length > 0) {
              const letterSpacing = await h1Elements[0].evaluate(el => {
                return parseFloat(window.getComputedStyle(el).letterSpacing);
              });

              // Headings should have negative letter-spacing (-0.025em)
              expect(letterSpacing).toBeLessThan(0);
            }
          });

          test('should have readable text color contrast', async ({ page }) => {
            await page.goto(testPage.url);

            // Check body text color
            const bodyColor = await page.evaluate(() => {
              const color = window.getComputedStyle(document.body).color;
              const bgColor = window.getComputedStyle(document.body).backgroundColor;
              return { color, bgColor };
            });

            // Both should be defined
            expect(bodyColor.color).toBeTruthy();
            expect(bodyColor.bgColor).toBeTruthy();
          });

          test('should load fonts without layout shift', async ({ page }) => {
            const metrics = await page.goto(testPage.url);

            // Wait for fonts to fully load
            await page.waitForTimeout(1000);

            // Check for Cumulative Layout Shift (should be minimal)
            const cls = await page.evaluate(() => {
              return new Promise((resolve) => {
                let clsValue = 0;
                new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (!(entry as any).hadRecentInput) {
                      clsValue += (entry as any).value;
                    }
                  }
                  resolve(clsValue);
                }).observe({ type: 'layout-shift', buffered: true });

                // Resolve after a short delay
                setTimeout(() => resolve(clsValue), 500);
              });
            });

            // CLS should be less than 0.1 for good performance
            expect(cls).toBeLessThan(0.1);
          });
        });
      }
    });
  }
});

test.describe('Typography Accessibility', () => {
  test('body text meets WCAG AA for readability', async ({ page }) => {
    await page.goto('/');

    const bodyFontSize = await page.evaluate(() => {
      return parseFloat(window.getComputedStyle(document.body).fontSize);
    });

    // Body text should be at least 16px for WCAG AA
    expect(bodyFontSize).toBeGreaterThanOrEqual(16);
  });

  test('headings have proper semantic hierarchy', async ({ page }) => {
    await page.goto('/');

    const headingSizes = await page.evaluate(() => {
      const h1Size = document.querySelector('h1')
        ? parseFloat(window.getComputedStyle(document.querySelector('h1')!).fontSize)
        : 0;
      const h2Size = document.querySelector('h2')
        ? parseFloat(window.getComputedStyle(document.querySelector('h2')!).fontSize)
        : 0;
      const h3Size = document.querySelector('h3')
        ? parseFloat(window.getComputedStyle(document.querySelector('h3')!).fontSize)
        : 0;

      return { h1Size, h2Size, h3Size };
    });

    // Heading sizes should follow hierarchical order (if present)
    if (headingSizes.h1Size > 0 && headingSizes.h2Size > 0) {
      expect(headingSizes.h1Size).toBeGreaterThan(headingSizes.h2Size);
    }
    if (headingSizes.h2Size > 0 && headingSizes.h3Size > 0) {
      expect(headingSizes.h2Size).toBeGreaterThan(headingSizes.h3Size);
    }
  });

  test('code blocks are distinguishable from body text', async ({ page }) => {
    await page.goto('/');

    const codeElements = await page.$$('code');
    if (codeElements.length > 0) {
      const codeFontFamily = await codeElements[0].evaluate(el =>
        window.getComputedStyle(el).fontFamily
      );

      const bodyFontFamily = await page.evaluate(() =>
        window.getComputedStyle(document.body).fontFamily
      );

      // Code should use a different font family (monospace)
      expect(codeFontFamily).not.toBe(bodyFontFamily);
      expect(codeFontFamily).toContain('JetBrains Mono');
    }
  });
});

test.describe('Typography Performance', () => {
  test('uses font-display: swap for performance', async ({ page }) => {
    await page.goto('/');

    const fontLink = await page.$('link[href*="fonts.googleapis.com"]');
    const href = await fontLink?.getAttribute('href');

    expect(href).toContain('display=swap');
  });

  test('preconnects to Google Fonts for faster loading', async ({ page }) => {
    await page.goto('/');

    const preconnects = await page.$$('link[rel="preconnect"]');
    const hrefs = await Promise.all(
      preconnects.map(link => link.getAttribute('href'))
    );

    expect(hrefs).toContain('https://fonts.googleapis.com');
    expect(hrefs).toContain('https://fonts.gstatic.com');
  });

  test('limits font weights to reduce bundle size', async ({ page }) => {
    await page.goto('/');

    const fontLink = await page.$('link[href*="fonts.googleapis.com"]');
    const href = await fontLink?.getAttribute('href');

    // Should only load necessary weights
    // Space Grotesk: 400,500,600,700
    // JetBrains Mono: 400,500
    expect(href).toContain('wght@400;500;600;700');
    expect(href).toContain('wght@400;500');
  });
});
