#!/usr/bin/env node

/**
 * Color Contrast Accessibility Test
 * Tests WCAG 2.1 Level AA compliance for all color combinations across all themes
 *
 * WCAG 2.1 AA Requirements:
 * - Normal text: 4.5:1 minimum contrast ratio
 * - Large text (18pt+ or 14pt+ bold): 3:1 minimum contrast ratio
 * - UI components and graphics: 3:1 minimum contrast ratio
 *
 * Success Criteria:
 * - SC 1.4.3: Contrast (Minimum) - Level AA
 * - SC 1.4.11: Non-text Contrast - Level AA
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// WCAG 2.1 contrast ratio calculation functions
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle shorthand hex (e.g., #fff)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

function getLuminance(r, g, b) {
  // Normalize RGB values
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function checkContrast(foreground, background, requirement = 4.5) {
  const ratio = getContrastRatio(foreground, background);
  const passes = ratio >= requirement;
  return { ratio, passes, requirement };
}

// Parse theme CSS file to extract color variables
function parseThemeColors(themePath) {
  const content = readFileSync(themePath, 'utf-8');
  const colors = {};

  // Match CSS custom properties - updated to match actual theme file format
  // Light mode: :root, html[data-theme="light"] { ... }
  const lightModeMatch = content.match(/(?::root|html\[data-theme="light"\])[^{]*{([^}]+)}/s);
  // Dark mode: html[data-theme="dark"] { ... }
  const darkModeMatch = content.match(/html\[data-theme="dark"\]\s*{([^}]+)}/s);

  function extractColors(cssBlock, _mode) {
    if (!cssBlock) return {};
    const colorVars = {};
    const matches = cssBlock.matchAll(/--([^:]+):\s*([^;/]+)/g);

    for (const match of matches) {
      const varName = match[1].trim();
      let value = match[2].trim();

      // Remove inline comments
      value = value.replace(/\/\*.*?\*\//, '').trim();

      // Only extract hex colors (skip HSL and other formats for now)
      if (value.match(/^#[0-9a-fA-F]{3,8}$/)) {
        // Normalize to 6-character hex (ignore alpha channel for contrast calculation)
        if (value.length === 9) {
          value = value.substring(0, 7); // Remove alpha channel
        }
        colorVars[varName] = value;
      }
    }

    return colorVars;
  }

  colors.light = extractColors(lightModeMatch?.[1], 'light');
  colors.dark = extractColors(darkModeMatch?.[1], 'dark');

  return colors;
}

// Define all critical color combinations to test
function getColorCombinations(colors, mode) {
  const c = colors[mode];
  const combinations = [];

  // Helper to add combination
  const add = (fg, bg, type, description, requirement = 4.5) => {
    if (c[fg] && c[bg]) {
      combinations.push({
        foreground: c[fg],
        background: c[bg],
        foregroundName: fg,
        backgroundName: bg,
        type,
        description,
        requirement
      });
    }
  };

  // Main text on backgrounds (4.5:1 for normal text)
  add('foreground', 'background', 'text', 'Body text on main background', 4.5);
  add('foreground', 'card-bg', 'text', 'Body text on card background', 4.5);
  add('foreground', 'muted', 'text', 'Body text on muted background', 4.5);

  // Accent text on backgrounds (4.5:1 for normal text)
  add('accent', 'background', 'text', 'Accent text (links) on main background', 4.5);
  add('accent', 'card-bg', 'text', 'Accent text on card background', 4.5);
  add('accent', 'muted', 'text', 'Accent text on muted background', 4.5);

  // Accent secondary on backgrounds
  if (c['accent-secondary']) {
    add('accent-secondary', 'background', 'text', 'Accent secondary on main background', 4.5);
    add('accent-secondary', 'card-bg', 'text', 'Accent secondary on card background', 4.5);
  }

  // Subtle text (usually for metadata, timestamps, etc.)
  if (c['subtle']) {
    add('subtle', 'background', 'text', 'Subtle text on main background', 4.5);
    add('subtle', 'card-bg', 'text', 'Subtle text on card background', 4.5);
  }

  // UI components (3:1 for borders, focus indicators)
  add('border', 'background', 'ui', 'Border on main background', 3.0);
  add('border', 'card-bg', 'ui', 'Border on card background', 3.0);
  add('accent', 'background', 'ui', 'Accent borders/focus indicators', 3.0);

  return combinations;
}

// Test hardcoded badge colors (BookCard and NewsCard components)
function getBadgeColorCombinations() {
  return [
    // BookCard status badges
    { foreground: '#ffffff', background: '#15803d', type: 'text', description: 'Published badge (white on green-700)', requirement: 4.5 },
    { foreground: '#ffffff', background: '#2563eb', type: 'text', description: 'Upcoming badge (white on blue-600)', requirement: 4.5 },
    { foreground: '#ffffff', background: '#4b5563', type: 'text', description: 'Draft badge (white on gray-600)', requirement: 4.5 },

    // NewsCard category badges
    { foreground: '#ffffff', background: '#9333ea', type: 'text', description: 'Releases badge (white on purple-600)', requirement: 4.5 },
    { foreground: '#ffffff', background: '#2563eb', type: 'text', description: 'Events badge (white on blue-600)', requirement: 4.5 },
    { foreground: '#ffffff', background: '#c2410c', type: 'text', description: 'Updates badge (white on orange-700)', requirement: 4.5 },
  ];
}

// Main test function
function testTheme(themeName, themePath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing Theme: ${themeName}`);
  console.log('='.repeat(80));

  const colors = parseThemeColors(themePath);
  const results = {
    themeName,
    light: { passed: 0, failed: 0, tests: [] },
    dark: { passed: 0, failed: 0, tests: [] }
  };

  // Test light mode
  console.log(`\n--- Light Mode ---`);
  const lightCombos = getColorCombinations(colors, 'light');

  for (const combo of lightCombos) {
    const result = checkContrast(combo.foreground, combo.background, combo.requirement);
    const status = result.passes ? '✓ PASS' : '✗ FAIL';
    const grade = result.passes ? '' : ` [Required: ${combo.requirement}:1]`;

    console.log(`${status} ${combo.description}`);
    console.log(`      ${combo.foreground} on ${combo.background} = ${result.ratio.toFixed(2)}:1${grade}`);

    results.light.tests.push({ ...combo, ...result });
    if (result.passes) {
      results.light.passed++;
    } else {
      results.light.failed++;
    }
  }

  // Test dark mode
  console.log(`\n--- Dark Mode ---`);
  const darkCombos = getColorCombinations(colors, 'dark');

  for (const combo of darkCombos) {
    const result = checkContrast(combo.foreground, combo.background, combo.requirement);
    const status = result.passes ? '✓ PASS' : '✗ FAIL';
    const grade = result.passes ? '' : ` [Required: ${combo.requirement}:1]`;

    console.log(`${status} ${combo.description}`);
    console.log(`      ${combo.foreground} on ${combo.background} = ${result.ratio.toFixed(2)}:1${grade}`);

    results.dark.tests.push({ ...combo, ...result });
    if (result.passes) {
      results.dark.passed++;
    } else {
      results.dark.failed++;
    }
  }

  return results;
}

// Test hardcoded badge colors
function testBadges() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing Hardcoded Badge Colors (BookCard & NewsCard)`);
  console.log('='.repeat(80));

  const badges = getBadgeColorCombinations();
  const results = { passed: 0, failed: 0, tests: [] };

  for (const badge of badges) {
    const result = checkContrast(badge.foreground, badge.background, badge.requirement);
    const status = result.passes ? '✓ PASS' : '✗ FAIL';
    const grade = result.passes ? '' : ` [Required: ${badge.requirement}:1]`;

    console.log(`${status} ${badge.description}`);
    console.log(`      ${badge.foreground} on ${badge.background} = ${result.ratio.toFixed(2)}:1${grade}`);

    results.tests.push({ ...badge, ...result });
    if (result.passes) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  return results;
}

// Generate summary report
function generateSummary(allResults) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`WCAG 2.1 AA Color Contrast Compliance Summary`);
  console.log('='.repeat(80));

  let totalPassed = 0;
  let totalFailed = 0;

  // Theme results
  for (const result of allResults.themes) {
    console.log(`\n${result.themeName}:`);
    console.log(`  Light Mode: ${result.light.passed} passed, ${result.light.failed} failed`);
    console.log(`  Dark Mode:  ${result.dark.passed} passed, ${result.dark.failed} failed`);

    totalPassed += result.light.passed + result.dark.passed;
    totalFailed += result.light.failed + result.dark.failed;
  }

  // Badge results
  console.log(`\nHardcoded Badges: ${allResults.badges.passed} passed, ${allResults.badges.failed} failed`);
  totalPassed += allResults.badges.passed;
  totalFailed += allResults.badges.failed;

  // Overall
  const totalTests = totalPassed + totalFailed;
  const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Overall: ${totalPassed}/${totalTests} tests passed (${passRate}%)`);
  console.log('='.repeat(80));

  if (totalFailed === 0) {
    console.log(`\n✓ SUCCESS: All color combinations meet WCAG 2.1 AA standards!`);
    console.log(`           Site achieves Level AA compliance for color contrast.`);
    return 0; // Exit code 0 for success
  } else {
    console.log(`\n✗ FAILURE: ${totalFailed} color combination(s) do not meet WCAG 2.1 AA standards.`);
    console.log(`           Please review and adjust the failing combinations above.`);
    return 1; // Exit code 1 for failure
  }
}

// Main execution
async function main() {
  console.log('WCAG 2.1 Level AA Color Contrast Testing');
  console.log('Testing all themes and hardcoded color combinations...\n');

  const themes = [
    { name: 'Warm Cyberpunk (ACTIVE)', path: join(rootDir, 'src/styles/themes/warm-cyberpunk.css') },
    { name: 'Cyberpunk Neon', path: join(rootDir, 'src/styles/themes/cyberpunk-neon.css') },
    { name: 'Minimal Future', path: join(rootDir, 'src/styles/themes/minimal-future.css') },
    { name: 'Deep Space', path: join(rootDir, 'src/styles/themes/deep-space.css') },
  ];

  const allResults = {
    themes: [],
    badges: null
  };

  // Test each theme
  for (const theme of themes) {
    const result = testTheme(theme.name, theme.path);
    allResults.themes.push(result);
  }

  // Test hardcoded badges
  allResults.badges = testBadges();

  // Generate and display summary
  const exitCode = generateSummary(allResults);

  process.exit(exitCode);
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
