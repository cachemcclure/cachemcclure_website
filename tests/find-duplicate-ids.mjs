/**
 * Script to find duplicate IDs on a page
 * Usage: node tests/find-duplicate-ids.mjs [url]
 */

import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4321/';

console.log(`🔍 Checking for duplicate IDs on: ${url}\n`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(url, { waitUntil: 'networkidle' });

// Get all elements with IDs
const elementsWithIds = await page.locator('[id]').all();
const ids = await Promise.all(elementsWithIds.map(el => el.getAttribute('id')));

// Count occurrences of each ID
const idCounts = new Map();
for (const id of ids) {
  if (id) {
    idCounts.set(id, (idCounts.get(id) || 0) + 1);
  }
}

// Find duplicates
const duplicates = Array.from(idCounts.entries()).filter(
  ([_, count]) => count > 1
);

if (duplicates.length === 0) {
  console.log('✅ No duplicate IDs found!');
} else {
  console.log(`❌ Found ${duplicates.length} duplicate IDs:\n`);
  duplicates.forEach(([id, count]) => {
    console.log(`  "${id}" appears ${count} times`);
  });

  console.log(`\n📊 Total elements with IDs: ${ids.length}`);
  console.log(`📊 Unique IDs: ${idCounts.size}`);
  console.log(`📊 Duplicate instances: ${ids.length - idCounts.size}`);
}

await browser.close();

process.exit(duplicates.length > 0 ? 1 : 0);
