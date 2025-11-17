#!/usr/bin/env node

/**
 * Performance Validation Test Suite
 *
 * Tests the performance optimizations implemented in Phase 4:
 * - CSS bundle size (Tailwind v4 purging)
 * - JavaScript bundle size
 * - Image optimization
 * - Lazy loading
 * - Build output analysis
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Performance thresholds
const THRESHOLDS = {
  CSS_MAX_SIZE_KB: 100,      // Main CSS should be < 100KB
  JS_MAX_SIZE_KB: 100,       // Main JS bundle should be < 100KB
  HTML_MAX_SIZE_KB: 50,      // HTML pages should be < 50KB
  TOTAL_CSS_MAX_KB: 200,     // Total CSS across site < 200KB
  TOTAL_JS_MAX_KB: 300,      // Total JS across site < 300KB (including pagefind)
};

let testsPassed = 0;
let testsFailed = 0;

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    pass: '\x1b[32m',    // Green
    fail: '\x1b[31m',    // Red
    warn: '\x1b[33m',    // Yellow
    reset: '\x1b[0m'
  };

  const icon = type === 'pass' ? '✓' : type === 'fail' ? '✗' : 'ℹ';
  console.log(`${colors[type]}${icon} ${message}${colors.reset}`);
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return null;
  }
}

async function getAllFiles(dir, extension) {
  const files = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function testCSSBundleSize() {
  log('\n📦 Testing CSS Bundle Sizes...', 'info');

  const cssFiles = await getAllFiles(distDir, '.css');
  const nonPagefindCSS = cssFiles.filter(f => !f.includes('pagefind'));

  let totalSize = 0;
  let maxSize = 0;
  let maxFile = '';

  for (const file of nonPagefindCSS) {
    const size = await getFileSize(file);
    if (size) {
      totalSize += size;
      if (size > maxSize) {
        maxSize = size;
        maxFile = path.basename(file);
      }
    }
  }

  const totalKB = totalSize / 1024;
  const maxKB = maxSize / 1024;

  log(`  Total CSS: ${formatBytes(totalSize)} (${nonPagefindCSS.length} files)`);
  log(`  Largest file: ${maxFile} (${formatBytes(maxSize)})`);

  if (maxKB < THRESHOLDS.CSS_MAX_SIZE_KB) {
    log(`  ✓ Largest CSS file is under ${THRESHOLDS.CSS_MAX_SIZE_KB}KB threshold`, 'pass');
    testsPassed++;
  } else {
    log(`  ✗ Largest CSS file exceeds ${THRESHOLDS.CSS_MAX_SIZE_KB}KB threshold`, 'fail');
    testsFailed++;
  }

  if (totalKB < THRESHOLDS.TOTAL_CSS_MAX_KB) {
    log(`  ✓ Total CSS is under ${THRESHOLDS.TOTAL_CSS_MAX_KB}KB threshold`, 'pass');
    testsPassed++;
  } else {
    log(`  ✗ Total CSS exceeds ${THRESHOLDS.TOTAL_CSS_MAX_KB}KB threshold`, 'fail');
    testsFailed++;
  }
}

async function testJavaScriptBundleSize() {
  log('\n📦 Testing JavaScript Bundle Sizes...', 'info');

  const jsFiles = await getAllFiles(distDir, '.js');
  const nonPagefindJS = jsFiles.filter(f => !f.includes('pagefind'));

  let totalSize = 0;
  let maxSize = 0;
  let maxFile = '';

  for (const file of nonPagefindJS) {
    const size = await getFileSize(file);
    if (size) {
      totalSize += size;
      if (size > maxSize) {
        maxSize = size;
        maxFile = path.basename(file);
      }
    }
  }

  const totalKB = totalSize / 1024;
  const maxKB = maxSize / 1024;

  log(`  Total JS: ${formatBytes(totalSize)} (${nonPagefindJS.length} files)`);
  log(`  Largest file: ${maxFile} (${formatBytes(maxSize)})`);

  if (maxKB < THRESHOLDS.JS_MAX_SIZE_KB) {
    log(`  ✓ Largest JS file is under ${THRESHOLDS.JS_MAX_SIZE_KB}KB threshold`, 'pass');
    testsPassed++;
  } else {
    log(`  ✗ Largest JS file exceeds ${THRESHOLDS.JS_MAX_SIZE_KB}KB threshold`, 'fail');
    testsFailed++;
  }

  if (totalKB < THRESHOLDS.TOTAL_JS_MAX_KB) {
    log(`  ✓ Total JS is under ${THRESHOLDS.TOTAL_JS_MAX_KB}KB threshold`, 'pass');
    testsPassed++;
  } else {
    log(`  ✗ Total JS exceeds ${THRESHOLDS.TOTAL_JS_MAX_KB}KB threshold`, 'fail');
    testsFailed++;
  }
}

async function testHTMLSize() {
  log('\n📄 Testing HTML File Sizes...', 'info');

  const htmlFiles = await getAllFiles(distDir, 'index.html');
  const criticalPages = ['index.html', 'books/index.html', 'news/index.html', 'about/index.html']
    .map(p => path.join(distDir, p));

  let oversizedPages = [];

  for (const file of criticalPages) {
    const size = await getFileSize(file);
    if (size) {
      const kb = size / 1024;
      const pageName = path.relative(distDir, file);

      if (kb > THRESHOLDS.HTML_MAX_SIZE_KB) {
        oversizedPages.push({ name: pageName, size: formatBytes(size) });
        log(`  ${pageName}: ${formatBytes(size)} (exceeds threshold)`, 'warn');
      } else {
        log(`  ${pageName}: ${formatBytes(size)}`, 'info');
      }
    }
  }

  if (oversizedPages.length === 0) {
    log(`  ✓ All critical HTML pages are under ${THRESHOLDS.HTML_MAX_SIZE_KB}KB`, 'pass');
    testsPassed++;
  } else {
    log(`  ✗ ${oversizedPages.length} pages exceed ${THRESHOLDS.HTML_MAX_SIZE_KB}KB threshold`, 'fail');
    testsFailed++;
  }
}

async function testImageOptimization() {
  log('\n🖼️  Testing Image Optimization...', 'info');

  const publicImagesDir = path.join(rootDir, 'public', 'images');
  const imageFiles = await getAllFiles(publicImagesDir, '.webp').catch(() => []);
  const pngFiles = await getAllFiles(publicImagesDir, '.png').catch(() => []);
  const jpgFiles = [
    ...(await getAllFiles(publicImagesDir, '.jpg').catch(() => [])),
    ...(await getAllFiles(publicImagesDir, '.jpeg').catch(() => []))
  ];

  const totalWebP = imageFiles.length;
  const totalUnoptimized = pngFiles.length + jpgFiles.length;

  log(`  WebP images: ${totalWebP}`);
  log(`  Unoptimized images (PNG/JPG): ${totalUnoptimized}`);

  if (totalWebP > 0) {
    log(`  ✓ WebP format is being used`, 'pass');
    testsPassed++;
  } else {
    log(`  ✗ No WebP images found`, 'fail');
    testsFailed++;
  }

  // Check that main images are WebP
  const criticalImages = ['author.webp', 'site-ogp.webp'];
  let allCriticalOptimized = true;

  for (const img of criticalImages) {
    const exists = await getFileSize(path.join(publicImagesDir, img));
    if (!exists) {
      log(`  ${img}: Not found or not WebP`, 'warn');
      allCriticalOptimized = false;
    }
  }

  if (allCriticalOptimized) {
    log(`  ✓ Critical images are optimized`, 'pass');
    testsPassed++;
  } else {
    log(`  Some critical images may not be optimized`, 'warn');
  }
}

async function testBuildStructure() {
  log('\n🏗️  Testing Build Structure...', 'info');

  // Verify dist directory exists
  try {
    await fs.access(distDir);
    log(`  ✓ Dist directory exists`, 'pass');
    testsPassed++;
  } catch {
    log(`  ✗ Dist directory not found`, 'fail');
    testsFailed++;
    return;
  }

  // Check for key directories
  const keyDirs = ['_astro', 'books', 'news', 'about'];
  for (const dir of keyDirs) {
    try {
      await fs.access(path.join(distDir, dir));
      log(`  ✓ ${dir}/ exists`);
    } catch {
      log(`  ✗ ${dir}/ missing`, 'fail');
      testsFailed++;
    }
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  PERFORMANCE VALIDATION TEST SUITE');
  console.log('  Phase 4: Components & Styling - Performance Section');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    await testBuildStructure();
    await testCSSBundleSize();
    await testJavaScriptBundleSize();
    await testHTMLSize();
    await testImageOptimization();

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  SUMMARY`);
    console.log('═══════════════════════════════════════════════════════════');
    log(`\n  Tests passed: ${testsPassed}`, testsPassed > 0 ? 'pass' : 'info');
    log(`  Tests failed: ${testsFailed}`, testsFailed > 0 ? 'fail' : 'info');

    if (testsFailed === 0) {
      log('\n  ✅ All performance tests passed!', 'pass');
      console.log('\n  The site meets all performance targets:');
      console.log('  • CSS is properly purged (Tailwind v4)');
      console.log('  • JavaScript is minimal');
      console.log('  • Images are optimized (WebP)');
      console.log('  • Build output is efficient');
      process.exit(0);
    } else {
      log('\n  ❌ Some performance tests failed', 'fail');
      console.log('\n  Review the failures above and optimize accordingly.');
      process.exit(1);
    }

  } catch (error) {
    log(`\n✗ Test suite error: ${error.message}`, 'fail');
    console.error(error);
    process.exit(1);
  }
}

main();
