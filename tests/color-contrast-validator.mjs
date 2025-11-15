/**
 * Color Contrast Validator for Theme Testing
 * Tests all themes for WCAG AA compliance (minimum 4.5:1 for text, 3:1 for UI)
 */

// Color definitions for all 4 themes
const themes = {
  'warm-cyberpunk': {
    light: {
      background: '#e0ddd7',
      foreground: '#2d2a26',
      accent: '#92400e',
      border: '#78736d',
      subtle: '#57524d',
    },
    dark: {
      background: '#2e2d2b',
      foreground: '#e8e3d9',
      accent: '#c4a574',
      border: '#8a857f',
      subtle: '#a8a29e',
    }
  },
  'cyberpunk-neon': {
    light: {
      background: '#ffffff',
      foreground: '#0a0e27',
      accent: '#00f0ff',
      border: '#e1e4e8',
    },
    dark: {
      background: '#0a0e27',
      foreground: '#e4e7eb',
      accent: '#00f0ff',
      border: '#2a3152',
    }
  },
  'minimal-future': {
    light: {
      background: '#fafaf9',
      foreground: '#1c1917',
      accent: '#2563eb',
      border: '#e7e5e4',
      subtle: '#78716c',
    },
    dark: {
      background: '#18181b',
      foreground: '#fafafa',
      accent: '#60a5fa',
      border: '#3f3f46',
      subtle: '#a1a1aa',
    }
  },
  'deep-space': {
    light: {
      background: '#f8f9fc',
      foreground: '#1a1a2e',
      accent: '#6366f1',
      border: '#c7d2fe',
    },
    dark: {
      background: '#0f0f1e',
      foreground: '#e0e7ff',
      accent: '#818cf8',
      border: '#312e81',
    }
  }
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
function meetsWCAG(ratio, level = 'AA', type = 'text') {
  if (type === 'text') {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7; // AA: 4.5:1, AAA: 7:1
  } else if (type === 'large-text') {
    return level === 'AA' ? ratio >= 3 : ratio >= 4.5; // AA: 3:1, AAA: 4.5:1
  } else if (type === 'ui') {
    return level === 'AA' ? ratio >= 3 : ratio >= 4.5; // AA: 3:1 for UI components
  }
  return false;
}

/**
 * Format contrast ratio for display
 */
function formatRatio(ratio) {
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Get status emoji
 */
function getStatus(passes) {
  return passes ? '✅' : '❌';
}

/**
 * Test a single theme mode
 */
function testThemeMode(themeName, modeName, colors) {
  const results = [];
  const { background, foreground, accent, border, subtle } = colors;

  console.log(`\n  ${modeName.toUpperCase()} MODE:`);
  console.log(`  ${'─'.repeat(60)}`);

  // Test foreground on background (body text)
  const fgBgRatio = getContrastRatio(foreground, background);
  const fgBgPass = meetsWCAG(fgBgRatio, 'AA', 'text');
  results.push({ test: 'Body Text', passes: fgBgPass });
  console.log(`  Body text (foreground/background): ${formatRatio(fgBgRatio)} ${getStatus(fgBgPass)}`);

  // Test accent on background (links, buttons)
  const accentBgRatio = getContrastRatio(accent, background);
  const accentBgPass = meetsWCAG(accentBgRatio, 'AA', 'text');
  results.push({ test: 'Accent Text', passes: accentBgPass });
  console.log(`  Accent text (accent/background):   ${formatRatio(accentBgRatio)} ${getStatus(accentBgPass)}`);

  // Test border on background (UI elements)
  if (border) {
    const borderBgRatio = getContrastRatio(border, background);
    const borderBgPass = meetsWCAG(borderBgRatio, 'AA', 'ui');
    results.push({ test: 'UI Borders', passes: borderBgPass });
    console.log(`  UI borders (border/background):    ${formatRatio(borderBgRatio)} ${getStatus(borderBgPass)}`);
  }

  // Test subtle text on background
  if (subtle) {
    const subtleBgRatio = getContrastRatio(subtle, background);
    const subtleBgPass = meetsWCAG(subtleBgRatio, 'AA', 'text');
    results.push({ test: 'Subtle Text', passes: subtleBgPass });
    console.log(`  Subtle text (subtle/background):   ${formatRatio(subtleBgRatio)} ${getStatus(subtleBgPass)}`);
  }

  const allPass = results.every(r => r.passes);
  const passCount = results.filter(r => r.passes).length;

  console.log(`  ${'─'.repeat(60)}`);
  console.log(`  ${modeName} Mode: ${passCount}/${results.length} tests passed ${getStatus(allPass)}`);

  return { results, allPass, passCount, totalCount: results.length };
}

/**
 * Test all themes
 */
function testAllThemes() {
  console.log('\n' + '═'.repeat(70));
  console.log('  COLOR CONTRAST VALIDATION - WCAG AA COMPLIANCE');
  console.log('═'.repeat(70));
  console.log('\nStandards:');
  console.log('  • Body text: 4.5:1 minimum (WCAG AA)');
  console.log('  • Large text: 3:1 minimum (WCAG AA)');
  console.log('  • UI elements: 3:1 minimum (WCAG AA)');

  const summary = [];

  for (const [themeName, modes] of Object.entries(themes)) {
    console.log('\n' + '─'.repeat(70));
    console.log(`\n🎨 THEME: ${themeName.toUpperCase()}`);

    const lightResults = testThemeMode(themeName, 'light', modes.light);
    const darkResults = testThemeMode(themeName, 'dark', modes.dark);

    const totalPass = lightResults.passCount + darkResults.passCount;
    const totalTests = lightResults.totalCount + darkResults.totalCount;
    const bothPass = lightResults.allPass && darkResults.allPass;

    summary.push({
      theme: themeName,
      light: lightResults,
      dark: darkResults,
      totalPass,
      totalTests,
      bothPass
    });

    console.log(`\n  THEME SUMMARY: ${totalPass}/${totalTests} total tests passed ${getStatus(bothPass)}`);
  }

  // Overall summary
  console.log('\n' + '═'.repeat(70));
  console.log('  OVERALL SUMMARY');
  console.log('═'.repeat(70));

  for (const theme of summary) {
    const percentage = ((theme.totalPass / theme.totalTests) * 100).toFixed(1);
    const status = theme.bothPass ? '✅ PASS' : '⚠️  REVIEW';
    console.log(`  ${theme.theme.padEnd(20)} ${theme.totalPass}/${theme.totalTests} (${percentage}%) ${status}`);
  }

  const allThemesPass = summary.every(t => t.bothPass);
  console.log('\n' + '═'.repeat(70));
  if (allThemesPass) {
    console.log('  🎉 ALL THEMES PASS WCAG AA STANDARDS!');
  } else {
    console.log('  ⚠️  SOME THEMES NEED COLOR ADJUSTMENTS');
  }
  console.log('═'.repeat(70) + '\n');

  return { summary, allThemesPass };
}

// Run the tests
const results = testAllThemes();

// Export for use in other tests
export { testAllThemes, getContrastRatio, meetsWCAG };

// Exit with appropriate code
process.exit(results.allThemesPass ? 0 : 1);
