/**
 * Script to inspect duplicate IDs and show which elements have them
 * Usage: node tests/inspect-duplicate-ids.mjs [url]
 */

import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4321/';

console.log(`🔍 Inspecting duplicate IDs on: ${url}\n`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(url, { waitUntil: 'networkidle' });

// Get all elements with IDs and their details
const elements = await page.locator('[id]').all();

const idMap = new Map();

for (const el of elements) {
  const id = await el.getAttribute('id');
  const tagName = await el.evaluate(e => e.tagName.toLowerCase());
  const outerHTML = await el.evaluate(e => e.outerHTML.substring(0, 200));

  if (!idMap.has(id)) {
    idMap.set(id, []);
  }

  idMap.set(id, [
    ...idMap.get(id),
    {
      tagName,
      preview: outerHTML,
    },
  ]);
}

// Find duplicates
const duplicates = Array.from(idMap.entries()).filter(
  ([_, elements]) => elements.length > 1
);

if (duplicates.length === 0) {
  console.log('✅ No duplicate IDs found!');
} else {
  console.log(`❌ Found ${duplicates.length} duplicate IDs:\n`);

  duplicates.forEach(([id, elements]) => {
    console.log(`\n🔴 ID "${id}" (${elements.length} occurrences):`);
    elements.forEach((el, index) => {
      console.log(`  [${index + 1}] <${el.tagName}>`);
      console.log(`      ${el.preview.substring(0, 150)}...`);
    });
  });
}

await browser.close();

process.exit(duplicates.length > 0 ? 1 : 0);
