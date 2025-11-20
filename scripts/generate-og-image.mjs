#!/usr/bin/env node
/**
 * Generate default Open Graph image for Cache McClure website.
 * Creates a 1200x630px image with site branding using Playwright.
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// HTML template for the OG image
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OG Image</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Arial', 'Helvetica', sans-serif;
      position: relative;
      overflow: hidden;
    }

    /* Decorative corner elements */
    .corner {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 4px solid #6366f1;
    }

    .corner.top-left {
      top: 80px;
      left: 80px;
      border-right: none;
      border-bottom: none;
    }

    .corner.top-right {
      top: 80px;
      right: 80px;
      border-left: none;
      border-bottom: none;
    }

    .corner.bottom-left {
      bottom: 80px;
      left: 80px;
      border-right: none;
      border-top: none;
    }

    .corner.bottom-right {
      bottom: 80px;
      right: 80px;
      border-left: none;
      border-top: none;
    }

    /* Horizontal accent lines */
    .accent-line {
      position: absolute;
      left: 100px;
      right: 100px;
      height: 4px;
      background: linear-gradient(90deg, transparent, #6366f1, transparent);
    }

    .accent-line.top {
      top: 195px;
    }

    .accent-line.bottom {
      bottom: 195px;
    }

    /* Content container */
    .content {
      text-align: center;
      z-index: 10;
    }

    .title {
      font-size: 90px;
      font-weight: bold;
      color: #f1f5f9;
      letter-spacing: 8px;
      margin-bottom: 20px;
      text-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
    }

    .subtitle {
      font-size: 42px;
      color: #94a3b8;
      letter-spacing: 3px;
      font-weight: 300;
    }

    /* Sci-fi grid background */
    .grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
        linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      opacity: 0.3;
    }

    /* Glow effect */
    .glow {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="grid"></div>
  <div class="glow"></div>

  <div class="corner top-left"></div>
  <div class="corner top-right"></div>
  <div class="corner bottom-left"></div>
  <div class="corner bottom-right"></div>

  <div class="accent-line top"></div>
  <div class="accent-line bottom"></div>

  <div class="content">
    <div class="title">CACHE McCLURE</div>
    <div class="subtitle">Science Fiction Author</div>
  </div>
</body>
</html>
`;

async function generateOGImage() {
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to OG image dimensions
  await page.setViewportSize({ width: 1200, height: 630 });

  console.log('📄 Loading HTML template...');
  await page.setContent(htmlTemplate);

  // Wait for fonts and styles to load
  await page.waitForTimeout(1000);

  console.log('📸 Capturing screenshot...');
  const screenshot = await page.screenshot({
    type: 'jpeg',
    quality: 90,
  });

  await browser.close();

  // Save the image
  const outputPath = join(projectRoot, 'public', 'cache-mcclure-og.jpg');
  writeFileSync(outputPath, screenshot);

  const fileSizeKB = (screenshot.length / 1024).toFixed(1);

  console.log(`✅ Created Open Graph image: ${outputPath}`);
  console.log(`   Dimensions: 1200x630px`);
  console.log(`   File size: ${fileSizeKB}KB`);

  if (parseFloat(fileSizeKB) > 300) {
    console.log(`   ⚠️  Warning: File size exceeds recommended 300KB`);
  } else {
    console.log(`   ✅ File size is within recommended limits`);
  }
}

// Run the generator
generateOGImage().catch(error => {
  console.error('❌ Error generating OG image:', error);
  process.exit(1);
});
