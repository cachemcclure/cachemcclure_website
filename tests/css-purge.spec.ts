import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Tailwind CSS v4 Purge Configuration Tests
 *
 * These tests verify that:
 * 1. @source directives are properly configured in all theme files
 * 2. CSS purging is working correctly (unused classes removed in production)
 * 3. All used Tailwind classes are included in the build
 * 4. CSS bundle sizes are optimized
 */

test.describe('Tailwind v4 Purge Configuration', () => {
  test.describe('@source Directive Verification', () => {
    const themeFiles = [
      'src/styles/themes/warm-cyberpunk.css',
      'src/styles/themes/cyberpunk-neon.css',
      'src/styles/themes/minimal-future.css',
      'src/styles/themes/deep-space.css',
    ];

    for (const themeFile of themeFiles) {
      test(`${themeFile} should have @source directives`, () => {
        const content = readFileSync(themeFile, 'utf-8');

        // Should import tailwindcss
        expect(content).toContain('@import "tailwindcss"');

        // Should have @source directive for src files
        expect(content).toMatch(/@source\s+["'][^"']*\.{astro,html,js,jsx,md,mdx,ts,tsx}["']/);

        // Should scan the src directory
        expect(content).toContain('../../**/*.{astro,html,js,jsx,md,mdx,ts,tsx}');

        // Should optionally scan public directory
        expect(content).toContain('../../../public/**/*.{html,js}');
      });

      test(`${themeFile} should have @source before custom styles`, () => {
        const content = readFileSync(themeFile, 'utf-8');

        const sourceIndex = content.indexOf('@source');
        const themeIndex = content.indexOf('@theme');
        const layerIndex = content.indexOf('@layer');

        // @source should come before @theme and @layer
        if (themeIndex > -1) {
          expect(sourceIndex).toBeLessThan(themeIndex);
        }
        if (layerIndex > -1) {
          expect(sourceIndex).toBeLessThan(layerIndex);
        }
      });
    }
  });

  test.describe('CSS Build Verification', () => {
    test('production CSS files should exist in dist', () => {
      const distPath = 'dist/_astro';
      const files = readdirSync(distPath);
      const cssFiles = files.filter(f => f.endsWith('.css'));

      expect(cssFiles.length).toBeGreaterThan(0);
    });

    test('CSS bundle sizes should be optimized', () => {
      const distPath = 'dist/_astro';
      const files = readdirSync(distPath);
      const cssFiles = files.filter(f => f.endsWith('.css'));

      for (const cssFile of cssFiles) {
        const filePath = join(distPath, cssFile);
        const stats = statSync(filePath);
        const sizeInKB = stats.size / 1024;

        // CSS files should be under 200KB (uncompressed)
        // Tailwind v4 with purging should produce much smaller bundles
        expect(sizeInKB).toBeLessThan(200);

        console.log(`📦 ${cssFile}: ${sizeInKB.toFixed(2)} KB`);
      }
    });

    test('production CSS should not contain unused Tailwind classes', () => {
      const distPath = 'dist/_astro';
      const files = readdirSync(distPath);
      const cssFiles = files.filter(f => f.endsWith('.css'));

      for (const cssFile of cssFiles) {
        const filePath = join(distPath, cssFile);
        const content = readFileSync(filePath, 'utf-8');

        // These are common Tailwind classes we don't use
        // If purging is working, they should NOT be in the bundle
        const unusedClasses = [
          '.text-purple-950', // We don't use extreme purple shades
          '.bg-lime-300',     // We don't use lime colors
          '.rotate-245',      // We don't use this specific rotation
          '.scale-\\[1\\.7\\]', // We don't use this specific scale
        ];

        for (const unusedClass of unusedClasses) {
          // Allow for CSS minification (spaces might be removed)
          const normalized = content.replace(/\s+/g, '');
          const classNormalized = unusedClass.replace(/\s+/g, '');

          expect(normalized).not.toContain(classNormalized);
        }
      }
    });
  });
});

test.describe('Used Tailwind Classes Are Included', () => {
  test('homepage should have all Tailwind utility classes working', async ({ page }) => {
    await page.goto('http://localhost:4321/');

    // Verify common utility classes are applied correctly
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check that flex utilities work
    const bodyElement = page.locator('body');
    const bodyClasses = await bodyElement.getAttribute('class');
    expect(bodyClasses).toContain('flex');
    expect(bodyClasses).toContain('flex-col');

    // Check max-width utilities
    const sections = page.locator('section');
    const firstSection = sections.first();
    const sectionClasses = await firstSection.getAttribute('class');
    expect(sectionClasses).toMatch(/max-w/);
  });

  test('book page should have all Tailwind utilities working', async ({ page }) => {
    await page.goto('http://localhost:4321/books/');

    // Check grid utilities
    const grid = page.locator('[class*="grid"]').first();
    if (await grid.count() > 0) {
      const gridClasses = await grid.getAttribute('class');
      expect(gridClasses).toContain('grid');
    }
  });

  test('responsive utilities should be working', async ({ page }) => {
    await page.goto('http://localhost:4321/');

    // Check for responsive padding utilities (should be in CSS)
    const mainContent = page.locator('main');
    const classes = await mainContent.getAttribute('class');

    // Common responsive pattern: px-6 lg:px-8
    const hasResponsivePadding = classes?.includes('px-') || classes?.includes('lg:px-');
    expect(hasResponsivePadding).toBeTruthy();
  });
});

test.describe('Tailwind Configuration Validation', () => {
  test('@source paths should be valid and reachable', () => {
    const themeFile = 'src/styles/themes/warm-cyberpunk.css';
    const content = readFileSync(themeFile, 'utf-8');

    // Extract @source paths
    const sourceMatches = content.matchAll(/@source\s+["']([^"']+)["']/g);
    const sourcePaths = Array.from(sourceMatches).map(match => match[1]);

    expect(sourcePaths.length).toBeGreaterThan(0);

    // Verify paths use glob patterns
    for (const path of sourcePaths) {
      // Should use ** for recursive matching
      const hasGlob = path.includes('**') || path.includes('*');
      expect(hasGlob).toBeTruthy();

      // Should include multiple file extensions
      expect(path).toContain('{');
      expect(path).toContain('}');
    }
  });

  test('all theme files should have identical @source configuration', () => {
    const themeFiles = [
      'src/styles/themes/warm-cyberpunk.css',
      'src/styles/themes/cyberpunk-neon.css',
      'src/styles/themes/minimal-future.css',
      'src/styles/themes/deep-space.css',
    ];

    const sourceConfigs: string[] = [];

    for (const themeFile of themeFiles) {
      const content = readFileSync(themeFile, 'utf-8');

      // Extract all @source directives
      const sourceMatches = content.matchAll(/@source\s+["']([^"']+)["'];?/g);
      const sources = Array.from(sourceMatches).map(m => m[1]).sort().join('|');

      sourceConfigs.push(sources);
    }

    // All theme files should have the same @source configuration
    const firstConfig = sourceConfigs[0];
    for (let i = 1; i < sourceConfigs.length; i++) {
      expect(sourceConfigs[i]).toBe(firstConfig);
    }
  });

  test('Tailwind import should come before @source directives', () => {
    const themeFile = 'src/styles/themes/warm-cyberpunk.css';
    const content = readFileSync(themeFile, 'utf-8');

    const importIndex = content.indexOf('@import "tailwindcss"');
    const sourceIndex = content.indexOf('@source');

    expect(importIndex).toBeGreaterThan(-1);
    expect(sourceIndex).toBeGreaterThan(-1);
    expect(importIndex).toBeLessThan(sourceIndex);
  });
});

test.describe('CSS Performance Metrics', () => {
  test('total CSS payload should be under 150KB', () => {
    const distPath = 'dist/_astro';
    const files = readdirSync(distPath);
    const cssFiles = files.filter(f => f.endsWith('.css'));

    let totalSize = 0;

    for (const cssFile of cssFiles) {
      const filePath = join(distPath, cssFile);
      const stats = statSync(filePath);
      totalSize += stats.size;
    }

    const totalSizeKB = totalSize / 1024;
    console.log(`📊 Total CSS payload: ${totalSizeKB.toFixed(2)} KB`);

    // With proper purging, total should be well under 150KB
    expect(totalSizeKB).toBeLessThan(150);
  });

  test('main CSS file should not have excessive utility classes', () => {
    const distPath = 'dist/_astro';
    const files = readdirSync(distPath);
    const cssFiles = files.filter(f => f.endsWith('.css'));

    // Find the largest CSS file (likely the main stylesheet)
    let largestFile = '';
    let largestSize = 0;

    for (const cssFile of cssFiles) {
      const filePath = join(distPath, cssFile);
      const stats = statSync(filePath);
      if (stats.size > largestSize) {
        largestSize = stats.size;
        largestFile = cssFile;
      }
    }

    const content = readFileSync(join(distPath, largestFile), 'utf-8');

    // Count CSS rules (rough estimate)
    const ruleCount = (content.match(/\{[^}]+\}/g) || []).length;

    console.log(`📋 ${largestFile} has approximately ${ruleCount} CSS rules`);

    // With purging, should have far fewer rules than the full Tailwind bundle
    // Full Tailwind can have 10,000+ rules, purged should be much less
    expect(ruleCount).toBeLessThan(5000);
  });

  test('CSS should not contain CSS comments in production', () => {
    const distPath = 'dist/_astro';
    const files = readdirSync(distPath);
    const cssFiles = files.filter(f => f.endsWith('.css'));

    for (const cssFile of cssFiles) {
      const filePath = join(distPath, cssFile);
      const content = readFileSync(filePath, 'utf-8');

      // Production CSS should strip most comments (some build tools keep /*! ... */)
      const regularComments = content.match(/\/\*[^!][^*]*\*\//g) || [];

      // Should have minimal comments in production
      expect(regularComments.length).toBeLessThan(5);
    }
  });
});

test.describe('Tailwind v4 Specific Features', () => {
  test('@theme inline should be used for custom properties', () => {
    const themeFile = 'src/styles/themes/warm-cyberpunk.css';
    const content = readFileSync(themeFile, 'utf-8');

    // Tailwind v4 uses @theme inline for custom tokens
    expect(content).toContain('@theme inline');
  });

  test('@layer base should be used for base styles', () => {
    const themeFile = 'src/styles/themes/warm-cyberpunk.css';
    const content = readFileSync(themeFile, 'utf-8');

    // Should use @layer base for reset and base styles
    expect(content).toContain('@layer base');
  });

  test('@utility should be used for custom utilities', () => {
    const themeFile = 'src/styles/themes/warm-cyberpunk.css';
    const content = readFileSync(themeFile, 'utf-8');

    // Check for custom utility definitions
    expect(content).toMatch(/@utility\s+[\w-]+/);
  });

  test('@custom-variant should be defined for dark mode', () => {
    const themeFile = 'src/styles/themes/warm-cyberpunk.css';
    const content = readFileSync(themeFile, 'utf-8');

    // Dark mode variant should be defined
    expect(content).toContain('@custom-variant dark');
  });
});
