/**
 * Test suite for Image Accessibility (Alt Text)
 * Tests that all <img> elements have proper alt attributes
 * Verifies WCAG 2.1 Level A compliance for images (Success Criterion 1.1.1)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

let testsPassed = 0;
let testsFailed = 0;
const issues = [];

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (details) {
      console.log(`  ${colors.yellow}${details}${colors.reset}`);
      issues.push({ test: testName, details });
    }
    testsFailed++;
  }
}

function testSection(name) {
  console.log(`\n${colors.blue}${name}${colors.reset}`);
}

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract all <img> tags from HTML content
 */
function extractImages(html) {
  // Match <img> tags (both self-closing and non-self-closing)
  const imgRegex = /<img[^>]*>/gi;
  const matches = html.match(imgRegex) || [];

  return matches.map(imgTag => {
    // Extract src attribute
    const srcMatch = imgTag.match(/src="([^"]*)"/i);
    const src = srcMatch ? srcMatch[1] : 'unknown';

    // Extract alt attribute
    const altMatch = imgTag.match(/alt="([^"]*)"/i);
    const alt = altMatch ? altMatch[1] : null;

    // Check if alt attribute exists (even if empty)
    const hasAltAttr = /\salt=/i.test(imgTag);

    return { imgTag, src, alt, hasAltAttr };
  });
}

/**
 * Check if an image is decorative (should have empty alt="")
 * Currently unused but kept for future enhancement
 */
function _isLikelyDecorative(imgTag) {
  // SVG icons with aria-hidden should have empty alt
  // Background images or decorative elements
  return imgTag.includes('aria-hidden="true"');
}

// Find all HTML files in dist directory
const distPath = join(dirname(__dirname), 'dist');
let htmlFiles;

try {
  htmlFiles = findHtmlFiles(distPath);
} catch (error) {
  console.error(`${colors.red}✗${colors.reset} Could not read dist directory. Make sure to run 'npm run build' first.`);
  console.error(error.message);
  process.exit(1);
}

console.log(`${colors.blue}Testing Image Accessibility (Alt Text)${colors.reset}`);
console.log('='.repeat(50));
console.log(`Found ${htmlFiles.length} HTML files to test\n`);

let totalImages = 0;
let imagesWithAlt = 0;
let imagesWithoutAlt = 0;
let imagesWithEmptyAlt = 0;
let imagesWithDescriptiveAlt = 0;

// Test each HTML file
htmlFiles.forEach(filePath => {
  const relativePath = filePath.replace(distPath, '').replace(/\\/g, '/');
  const html = readFileSync(filePath, 'utf-8');
  const images = extractImages(html);

  if (images.length === 0) {
    return; // Skip files with no images
  }

  testSection(`${relativePath} (${images.length} images)`);

  images.forEach((img, index) => {
    totalImages++;
    const shortSrc = img.src.length > 50 ? img.src.substring(0, 47) + '...' : img.src;
    const testName = `Image ${index + 1}: ${shortSrc}`;

    // Test 1: Image has alt attribute
    if (!img.hasAltAttr) {
      assert(
        false,
        `${testName} - Has alt attribute`,
        `Missing alt attribute. Add alt="" for decorative images or alt="description" for informative images.`
      );
      imagesWithoutAlt++;
      return;
    }

    imagesWithAlt++;

    // Test 2: Alt text is appropriate
    if (img.alt === '') {
      // Empty alt is acceptable for decorative images
      imagesWithEmptyAlt++;
      assert(
        true,
        `${testName} - Has alt attribute (decorative)`,
        ''
      );
    } else if (img.alt === null) {
      // This should not happen if hasAltAttr is true, but check anyway
      assert(
        false,
        `${testName} - Has alt value`,
        `Alt attribute exists but has no value.`
      );
      imagesWithoutAlt++;
    } else {
      // Non-empty alt text
      imagesWithDescriptiveAlt++;

      // Test 3: Alt text is not just whitespace
      const hasContent = img.alt.trim().length > 0;
      assert(
        hasContent,
        `${testName} - Has meaningful alt text`,
        hasContent ? '' : 'Alt text is only whitespace.'
      );

      // Test 4: Alt text is not a filename (common mistake)
      const isFilename = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(img.alt);
      if (isFilename) {
        assert(
          false,
          `${testName} - Alt text is descriptive (not filename)`,
          `Alt text appears to be a filename: "${img.alt}". Use descriptive text instead.`
        );
      }

      // Test 5: Alt text is not too long (>125 chars is excessive)
      const reasonableLength = img.alt.length <= 125;
      if (!reasonableLength) {
        assert(
          false,
          `${testName} - Alt text is concise`,
          `Alt text is ${img.alt.length} characters. Consider shortening to 125 characters or less.`
        );
      }

      // Test 6: Alt text doesn't start with redundant phrases
      const redundantPhrases = [
        'image of',
        'picture of',
        'photo of',
        'graphic of',
        'icon of'
      ];
      const startsWithRedundant = redundantPhrases.some(phrase =>
        img.alt.toLowerCase().startsWith(phrase)
      );
      if (startsWithRedundant) {
        console.log(
          `  ${colors.yellow}⚠${colors.reset} Consider removing redundant prefix from alt text: "${img.alt}"`
        );
      }
    }
  });
});

// Summary Statistics
testSection('Summary Statistics');
console.log(`Total images found: ${totalImages}`);
console.log(`Images with alt attribute: ${imagesWithAlt} (${Math.round(imagesWithAlt / totalImages * 100)}%)`);
console.log(`Images without alt attribute: ${imagesWithoutAlt} (${Math.round(imagesWithoutAlt / totalImages * 100)}%)`);
console.log(`Decorative images (empty alt): ${imagesWithEmptyAlt}`);
console.log(`Informative images (descriptive alt): ${imagesWithDescriptiveAlt}`);

// WCAG Compliance Check
testSection('WCAG 2.1 Compliance');
const wcagCompliant = imagesWithoutAlt === 0;
assert(
  wcagCompliant,
  'All images have alt attributes (WCAG 2.1 Level A - SC 1.1.1)',
  wcagCompliant ? '' : `${imagesWithoutAlt} image(s) missing alt attribute.`
);

// Detailed Issues Report
if (issues.length > 0) {
  testSection('Detailed Issues Report');
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.test}`);
    console.log(`   ${issue.details}`);
  });
}

// Final Summary
console.log('\n' + '='.repeat(50));
console.log(`${colors.blue}Test Summary${colors.reset}`);
console.log(`${colors.green}Passed:${colors.reset} ${testsPassed}`);
console.log(`${colors.red}Failed:${colors.reset} ${testsFailed}`);

if (testsFailed > 0) {
  console.log(`\n${colors.red}Some tests failed! Fix the issues above to ensure WCAG 2.1 compliance.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}All tests passed! Your site is WCAG 2.1 Level A compliant for images.${colors.reset}`);
  process.exit(0);
}
