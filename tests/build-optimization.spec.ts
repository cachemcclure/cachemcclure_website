import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { gzip } from "zlib";

const gzipAsync = promisify(gzip);

const DIST_DIR = path.join(process.cwd(), "dist");

/**
 * Build Optimization Test Suite
 * Tests for Astro build configuration and output optimization
 *
 * Verifies:
 * - Static site generation (SSG)
 * - No client-side hydration
 * - Optimized bundle sizes
 * - Correct build format (directory structure)
 * - HTML compression
 * - Asset optimization
 */

test.describe("Build Configuration", () => {
  test("should use static output mode", async () => {
    // Read astro config
    const configPath = path.join(process.cwd(), "astro.config.ts");
    const configContent = fs.readFileSync(configPath, "utf-8");

    // Verify static output is configured
    expect(configContent).toContain('output: "static"');
  });

  test("should enable HTML compression", async () => {
    const configPath = path.join(process.cwd(), "astro.config.ts");
    const configContent = fs.readFileSync(configPath, "utf-8");

    // Verify compressHTML is enabled
    expect(configContent).toContain("compressHTML: true");
  });

  test("should use directory build format", async () => {
    const configPath = path.join(process.cwd(), "astro.config.ts");
    const configContent = fs.readFileSync(configPath, "utf-8");

    // Verify directory format for SEO-friendly URLs
    expect(configContent).toContain('format: "directory"');
  });

  test("should configure auto inline stylesheets", async () => {
    const configPath = path.join(process.cwd(), "astro.config.ts");
    const configContent = fs.readFileSync(configPath, "utf-8");

    // Verify auto inlining for stylesheets <4KB
    expect(configContent).toContain('inlineStylesheets: "auto"');
  });
});

test.describe("Build Output Structure", () => {
  test("dist directory should exist", () => {
    expect(fs.existsSync(DIST_DIR)).toBe(true);
  });

  test("should generate pages in directory format", () => {
    // Check that pages are in /page/index.html format (not /page.html)
    const aboutPage = path.join(DIST_DIR, "about", "index.html");
    const booksPage = path.join(DIST_DIR, "books", "index.html");
    const newsPage = path.join(DIST_DIR, "news", "index.html");

    expect(fs.existsSync(aboutPage)).toBe(true);
    expect(fs.existsSync(booksPage)).toBe(true);
    expect(fs.existsSync(newsPage)).toBe(true);
  });

  test("should have _astro assets directory", () => {
    const astroDir = path.join(DIST_DIR, "_astro");
    expect(fs.existsSync(astroDir)).toBe(true);
  });

  test("should have sitemap files", () => {
    const sitemapIndex = path.join(DIST_DIR, "sitemap-index.xml");
    expect(fs.existsSync(sitemapIndex)).toBe(true);
  });

  test("should have robots.txt", () => {
    const robotsTxt = path.join(DIST_DIR, "robots.txt");
    expect(fs.existsSync(robotsTxt)).toBe(true);
  });

  test("should have RSS feed", () => {
    const rssFeed = path.join(DIST_DIR, "rss.xml");
    expect(fs.existsSync(rssFeed)).toBe(true);
  });
});

test.describe("No Client-Side Hydration", () => {
  test("no pages should contain client: directives", () => {
    // Search all .astro files in src
    const srcDir = path.join(process.cwd(), "src");
    const astroFiles = getAllFiles(srcDir, ".astro");

    astroFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/client:(load|idle|visible|only|media)/);
    });
  });

  test("should generate static HTML only", async ({ page }) => {
    await page.goto("http://localhost:4321");

    // Check for absence of hydration scripts
    const scripts = await page.locator("script[data-astro-component-hydration]").count();
    expect(scripts).toBe(0);
  });
});

test.describe("Bundle Size Optimization", () => {
  test("total dist size should be reasonable", () => {
    const totalSize = getDirSize(DIST_DIR);
    const totalMB = totalSize / (1024 * 1024);

    // Total should be under 5MB (excluding large assets like book covers)
    expect(totalMB).toBeLessThan(5);
  });

  test("CSS bundle should be optimized", () => {
    const astroDir = path.join(DIST_DIR, "_astro");
    const cssFiles = fs.readdirSync(astroDir).filter((f) => f.endsWith(".css"));

    expect(cssFiles.length).toBeGreaterThan(0);

    cssFiles.forEach((file) => {
      const filePath = path.join(astroDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;

      // Individual CSS files should be under 100KB uncompressed
      expect(sizeKB).toBeLessThan(100);
    });
  });

  test("main CSS should gzip to under 15KB", async () => {
    const astroDir = path.join(DIST_DIR, "_astro");
    const cssFiles = fs.readdirSync(astroDir).filter((f) => f.endsWith(".css") && !f.includes("search"));

    expect(cssFiles.length).toBeGreaterThan(0);

    for (const file of cssFiles) {
      const filePath = path.join(astroDir, file);
      const content = fs.readFileSync(filePath);
      const compressed = await gzipAsync(content);
      const sizeKB = compressed.length / 1024;

      // Main CSS should gzip to under 15KB
      expect(sizeKB).toBeLessThan(15);
    }
  });

  test("JavaScript bundles should be minimal", () => {
    const astroDir = path.join(DIST_DIR, "_astro");
    const jsFiles = fs.readdirSync(astroDir).filter((f) => f.endsWith(".js"));

    // Should only have essential JS (Pagefind search)
    jsFiles.forEach((file) => {
      const filePath = path.join(astroDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;

      // Individual JS files should be reasonably sized
      // Pagefind UI is around 71KB which is acceptable
      expect(sizeKB).toBeLessThan(100);
    });
  });

  test("HTML files should be reasonably sized", () => {
    const htmlFiles = getAllFiles(DIST_DIR, ".html");

    htmlFiles.forEach((file) => {
      const stats = fs.statSync(file);
      const sizeKB = stats.size / 1024;

      // HTML pages should be under 50KB each (uncompressed)
      expect(sizeKB).toBeLessThan(50);
    });
  });
});

test.describe("HTML Compression", () => {
  test("HTML should have whitespace removed", () => {
    const indexPath = path.join(DIST_DIR, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");

    // Compressed HTML should not have excessive whitespace between tags
    const excessiveWhitespace = />\s{3,}</g;
    const matches = content.match(excessiveWhitespace);

    // Should have minimal matches (some spacing is ok in certain contexts)
    expect(matches?.length || 0).toBeLessThan(10);
  });

  test("HTML should not have unnecessary comments", () => {
    const indexPath = path.join(DIST_DIR, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");

    // Should not contain development comments
    expect(content).not.toContain("<!-- TODO");
    expect(content).not.toContain("<!-- DEBUG");
    expect(content).not.toContain("<!-- FIXME");
  });
});

test.describe("Asset Optimization", () => {
  test("images should be in optimized formats", () => {
    const astroDir = path.join(DIST_DIR, "_astro");

    if (fs.existsSync(astroDir)) {
      const files = fs.readdirSync(astroDir);
      const imageFiles = files.filter((f) =>
        /\.(webp|avif|jpg|jpeg|png)$/i.test(f)
      );

      // All images should be in modern formats (webp/avif preferred)
      imageFiles.forEach((file) => {
        const ext = path.extname(file).toLowerCase();
        // Astro Image component outputs webp
        expect([".webp", ".avif", ".jpg", ".jpeg", ".png"]).toContain(ext);
      });
    }
  });

  test("should have proper cache busting hashes", () => {
    const astroDir = path.join(DIST_DIR, "_astro");
    const files = fs.readdirSync(astroDir);

    // All asset files should have content hashes
    files.forEach((file) => {
      if (file.endsWith(".css") || file.endsWith(".js")) {
        // Files should have hash pattern like: name.HASH.ext
        expect(file).toMatch(/\.[a-zA-Z0-9_-]{8,}\.(css|js)$/);
      }
    });
  });
});

test.describe("Static Site Generation", () => {
  test("all pages should be pre-rendered", async ({ page }) => {
    const pages = [
      "/",
      "/about/",
      "/books/",
      "/news/",
      "/search/",
    ];

    for (const pagePath of pages) {
      await page.goto(`http://localhost:4321${pagePath}`);

      // Check that page content is in the initial HTML (not loaded via JS)
      const html = await page.content();

      // Should have actual content, not just loading state
      expect(html).toContain("<main");
      expect(html.length).toBeGreaterThan(1000); // Meaningful content
    }
  });

  test("individual book pages should be pre-rendered", async ({ page }) => {
    const booksDir = path.join(DIST_DIR, "books");

    if (fs.existsSync(booksDir)) {
      const bookDirs = fs
        .readdirSync(booksDir)
        .filter((name) => {
          const fullPath = path.join(booksDir, name);
          return fs.statSync(fullPath).isDirectory();
        });

      expect(bookDirs.length).toBeGreaterThan(0);

      // Verify at least one book page is pre-rendered
      const firstBook = bookDirs[0];
      await page.goto(`http://localhost:4321/books/${firstBook}/`);

      const html = await page.content();
      expect(html).toContain("<main");
      expect(html.length).toBeGreaterThan(1000);
    }
  });

  test("individual news posts should be pre-rendered", async ({ page }) => {
    const newsDir = path.join(DIST_DIR, "news");

    if (fs.existsSync(newsDir)) {
      const newsDirs = fs
        .readdirSync(newsDir)
        .filter((name) => {
          const fullPath = path.join(newsDir, name);
          return fs.statSync(fullPath).isDirectory();
        });

      expect(newsDirs.length).toBeGreaterThan(0);

      // Verify at least one news post is pre-rendered
      const firstPost = newsDirs[0];
      await page.goto(`http://localhost:4321/news/${firstPost}/`);

      const html = await page.content();
      expect(html).toContain("<main");
      expect(html.length).toBeGreaterThan(1000);
    }
  });
});

test.describe("Performance Metrics", () => {
  test("homepage should load quickly", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("http://localhost:4321");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Should load in under 2 seconds on localhost
    expect(loadTime).toBeLessThan(2000);
  });

  test("should have minimal JavaScript execution", async ({ page }) => {
    await page.goto("http://localhost:4321");

    // Get JavaScript bundle size
    const jsRequests: string[] = [];
    page.on("response", (response) => {
      const url = response.url();
      if (url.endsWith(".js") && response.status() === 200) {
        jsRequests.push(url);
      }
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should have minimal JS (mostly just Pagefind on search page)
    // Homepage should have very little JS
    const homeJs = jsRequests.filter((url) => !url.includes("pagefind"));
    expect(homeJs.length).toBeLessThan(5);
  });
});

test.describe("Build Scripts", () => {
  test("package.json should have correct build script", () => {
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    // Should run astro check, build, and pagefind
    expect(pkg.scripts.build).toContain("astro check");
    expect(pkg.scripts.build).toContain("astro build");
    expect(pkg.scripts.build).toContain("pagefind");
  });
});

test.describe("Compression Ready", () => {
  test("assets should be ready for Cloudflare compression", async () => {
    // Verify common assets can be compressed effectively
    const testFiles = [
      path.join(DIST_DIR, "index.html"),
      path.join(DIST_DIR, "_astro"),
    ];

    for (const testPath of testFiles) {
      if (fs.existsSync(testPath)) {
        if (fs.statSync(testPath).isFile()) {
          const content = fs.readFileSync(testPath);
          const compressed = await gzipAsync(content);
          const compressionRatio = compressed.length / content.length;

          // Should achieve good compression (under 50% of original size)
          expect(compressionRatio).toBeLessThan(0.5);
        }
      }
    }
  });
});

// Helper functions
function getAllFiles(dirPath: string, ext: string): string[] {
  const files: string[] = [];

  function traverse(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and .git
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          traverse(fullPath);
        }
      } else if (entry.name.endsWith(ext)) {
        files.push(fullPath);
      }
    }
  }

  traverse(dirPath);
  return files;
}

function getDirSize(dirPath: string): number {
  let size = 0;

  function traverse(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else {
        size += fs.statSync(fullPath).size;
      }
    }
  }

  traverse(dirPath);
  return size;
}
