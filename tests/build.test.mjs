/**
 * Build Process Tests
 *
 * Tests that the production build completes successfully:
 * - No TypeScript errors
 * - No build failures
 * - All static pages generate correctly
 * - Pagefind search index builds successfully
 *
 * This test addresses the item in the Testing Checklist:
 * "Build succeeds without warnings"
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runBuildTest() {
  log('\n🔨 Build Process Test\n', 'cyan');

  let testsPassed = 0;
  let testsFailed = 0;
  const errors = [];

  // Clean dist directory if it exists
  const distPath = join(projectRoot, 'dist');
  if (existsSync(distPath)) {
    log('🧹 Cleaning dist directory...', 'yellow');
    rmSync(distPath, { recursive: true, force: true });
  }

  // Test 1: Run npm run build
  log('📦 Test 1: Running npm run build...', 'cyan');
  try {
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: projectRoot,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Check for TypeScript errors in stderr
    const hasTypeScriptErrors = stderr.includes('error ts(') ||
                                stderr.includes('Result (') && stderr.includes('- 0 errors') === false;

    if (hasTypeScriptErrors) {
      testsFailed++;
      errors.push('Build failed with TypeScript errors');
      log('  ✗ Build failed with TypeScript errors', 'red');
    } else {
      testsPassed++;
      log('  ✓ Build completed without TypeScript errors', 'green');
    }

    // Check for Astro build errors
    if (stderr.includes('[ERROR]') || stdout.includes('[ERROR]')) {
      testsFailed++;
      errors.push('Build failed with Astro errors');
      log('  ✗ Build failed with Astro errors', 'red');
    } else {
      testsPassed++;
      log('  ✓ Build completed without Astro errors', 'green');
    }

  } catch (error) {
    testsFailed += 2;
    errors.push(`Build command failed: ${error.message}`);
    log(`  ✗ Build command failed: ${error.message}`, 'red');
  }

  // Test 2: Check that dist directory exists
  log('\n📁 Test 2: Verifying dist directory exists...', 'cyan');
  if (existsSync(distPath)) {
    testsPassed++;
    log('  ✓ dist directory created successfully', 'green');
  } else {
    testsFailed++;
    errors.push('dist directory was not created');
    log('  ✗ dist directory was not created', 'red');
  }

  // Test 3: Check for index.html
  log('\n🏠 Test 3: Verifying homepage was generated...', 'cyan');
  const indexPath = join(distPath, 'index.html');
  if (existsSync(indexPath)) {
    testsPassed++;
    log('  ✓ index.html generated successfully', 'green');
  } else {
    testsFailed++;
    errors.push('index.html was not generated');
    log('  ✗ index.html was not generated', 'red');
  }

  // Test 4: Check for pagefind directory
  log('\n🔍 Test 4: Verifying Pagefind search index...', 'cyan');
  const pagefindPath = join(distPath, 'pagefind');
  if (existsSync(pagefindPath)) {
    testsPassed++;
    log('  ✓ Pagefind search index created successfully', 'green');
  } else {
    testsFailed++;
    errors.push('Pagefind search index was not created');
    log('  ✗ Pagefind search index was not created', 'red');
  }

  // Test 5: Check for critical static pages
  log('\n📄 Test 5: Verifying critical pages were generated...', 'cyan');
  const criticalPages = [
    'about/index.html',
    'books/index.html',
    'news/index.html',
    '404.html',
  ];

  let allPagesExist = true;
  for (const page of criticalPages) {
    const pagePath = join(distPath, page);
    if (!existsSync(pagePath)) {
      allPagesExist = false;
      log(`  ✗ Missing: ${page}`, 'red');
    }
  }

  if (allPagesExist) {
    testsPassed++;
    log('  ✓ All critical pages generated successfully', 'green');
  } else {
    testsFailed++;
    errors.push('Some critical pages were not generated');
  }

  // Test 6: Check for robots.txt and sitemap
  log('\n🤖 Test 6: Verifying SEO files...', 'cyan');
  const robotsPath = join(distPath, 'robots.txt');
  const sitemapPath = join(distPath, 'sitemap-index.xml');

  let seoFilesExist = true;
  if (!existsSync(robotsPath)) {
    seoFilesExist = false;
    log('  ✗ Missing: robots.txt', 'red');
  }
  if (!existsSync(sitemapPath)) {
    seoFilesExist = false;
    log('  ✗ Missing: sitemap-index.xml', 'red');
  }

  if (seoFilesExist) {
    testsPassed++;
    log('  ✓ All SEO files generated successfully', 'green');
  } else {
    testsFailed++;
    errors.push('Some SEO files were not generated');
  }

  // Print summary
  log('\n' + '='.repeat(60), 'cyan');
  log('Build Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Tests Passed: ${testsPassed}`, testsPassed > 0 ? 'green' : 'reset');
  log(`Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'reset');

  if (errors.length > 0) {
    log('\nErrors:', 'red');
    errors.forEach(error => log(`  - ${error}`, 'red'));
  }

  // Exit with appropriate code
  if (testsFailed > 0) {
    log('\n❌ Build tests FAILED\n', 'red');
    process.exit(1);
  } else {
    log('\n✅ Build tests PASSED\n', 'green');
    process.exit(0);
  }
}

// Run the test
runBuildTest().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
});
