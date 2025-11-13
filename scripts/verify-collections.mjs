#!/usr/bin/env node

/**
 * Collection Verification Script
 *
 * This script builds the site and verifies that:
 * 1. Collections API endpoint is generated correctly
 * 2. Debug page is built successfully
 * 3. Collection data is valid and accessible
 *
 * Run this script after making changes to content collections:
 * node scripts/verify-collections.mjs
 */

import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

console.log('🔍 Verifying Content Collections...\n');

// Step 1: Build the site
console.log('📦 Building site...');
try {
  const { stdout, stderr } = await execAsync('npm run build', {
    cwd: projectRoot,
  });

  if (stderr && !stderr.includes('[content]')) {
    console.error('Build warnings:', stderr);
  }

  console.log('✓ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Verify API endpoint exists
console.log('🔍 Checking API endpoint...');
try {
  const apiPath = resolve(projectRoot, 'dist/api/collections.json');
  const apiContent = await readFile(apiPath, 'utf-8');
  const apiData = JSON.parse(apiContent);

  console.log(`✓ API endpoint exists at dist/api/collections.json`);
  console.log(`  - Books: ${apiData.books.length}`);
  console.log(`  - News: ${apiData.news.length}`);
  console.log(`  - Blog: ${apiData.blog.length}`);
  console.log(`  - Generated: ${apiData.meta.generatedAt}\n`);

  // Verify data structure
  if (!Array.isArray(apiData.books)) {
    throw new Error('Books is not an array');
  }
  if (!Array.isArray(apiData.news)) {
    throw new Error('News is not an array');
  }
  if (!Array.isArray(apiData.blog)) {
    throw new Error('Blog is not an array');
  }

  // Verify books schema
  apiData.books.forEach((book, index) => {
    if (!book.id || !book.slug || !book.data) {
      throw new Error(`Book ${index} has invalid structure`);
    }
    if (!book.data.title || !book.data.description || !book.data.coverImage) {
      throw new Error(`Book ${index} missing required fields`);
    }
    if (!['published', 'upcoming', 'draft'].includes(book.data.status)) {
      throw new Error(`Book ${index} has invalid status: ${book.data.status}`);
    }
  });
  console.log('✓ Books schema valid');

  // Verify news schema
  apiData.news.forEach((post, index) => {
    if (!post.id || !post.slug || !post.data) {
      throw new Error(`News ${index} has invalid structure`);
    }
    if (!post.data.title || !post.data.description) {
      throw new Error(`News ${index} missing required fields`);
    }
    if (!['releases', 'events', 'updates'].includes(post.data.category)) {
      throw new Error(`News ${index} has invalid category: ${post.data.category}`);
    }
  });
  console.log('✓ News schema valid\n');

} catch (error) {
  console.error('❌ API endpoint verification failed:', error.message);
  process.exit(1);
}

// Step 3: Verify debug page exists
console.log('🔍 Checking debug page...');
try {
  const debugPath = resolve(projectRoot, 'dist/debug/collections/index.html');
  const debugContent = await readFile(debugPath, 'utf-8');

  // Check for expected content
  if (!debugContent.includes('Content Collections Debug Console')) {
    throw new Error('Debug page missing expected title');
  }
  if (!debugContent.includes('window.collections')) {
    throw new Error('Debug page missing collections data');
  }
  if (!debugContent.includes('window.queryBooks')) {
    throw new Error('Debug page missing queryBooks function');
  }
  if (!debugContent.includes('window.queryNews')) {
    throw new Error('Debug page missing queryNews function');
  }

  console.log('✓ Debug page exists at dist/debug/collections/index.html');
  console.log('✓ Debug page includes collection data and helpers\n');

} catch (error) {
  console.error('❌ Debug page verification failed:', error.message);
  process.exit(1);
}

// Step 4: Verify collection queries work
console.log('🔍 Testing collection queries...');
try {
  const apiPath = resolve(projectRoot, 'dist/api/collections.json');
  const apiContent = await readFile(apiPath, 'utf-8');
  const apiData = JSON.parse(apiContent);

  // Test filtering books by status
  const upcomingBooks = apiData.books.filter(b => b.data.status === 'upcoming');
  console.log(`✓ Filter upcoming books: ${upcomingBooks.length} found`);

  // Test filtering books by series
  const booksInSeries = apiData.books.filter(b => b.data.series);
  console.log(`✓ Filter books with series: ${booksInSeries.length} found`);

  // Test filtering news by category
  const releaseNews = apiData.news.filter(n => n.data.category === 'releases');
  console.log(`✓ Filter release news: ${releaseNews.length} found`);

  // Test sorting by date
  const sortedBooks = [...apiData.books].sort((a, b) =>
    new Date(b.data.publishDate) - new Date(a.data.publishDate)
  );
  console.log(`✓ Sort books by date: ${sortedBooks.length} sorted`);

  // Test date filtering
  const recentNews = apiData.news.filter(n =>
    new Date(n.data.publishDate) >= new Date('2025-01-01')
  );
  console.log(`✓ Filter recent news (2025+): ${recentNews.length} found\n`);

} catch (error) {
  console.error('❌ Collection query tests failed:', error.message);
  process.exit(1);
}

// Summary
console.log('✅ All verification checks passed!\n');
console.log('📋 Next steps:');
console.log('   1. Start dev server: npm run dev');
console.log('   2. Visit: http://localhost:4321/debug/collections');
console.log('   3. Open browser console (F12)');
console.log('   4. Try: window.showExamples()');
console.log('   5. Test queries interactively\n');

console.log('💡 Tip: The debug page provides interactive testing');
console.log('   of collection queries in the browser console.\n');
