# Known Issues

This document tracks known issues that need to be addressed.

## Duplicate HTML IDs

**Status**: Documented, not yet fixed
**Priority**: Medium (HTML validation issue, not functional)
**Detected**: 2025-11-14 (page load tests)

### Description

The homepage (and potentially other pages) contain duplicate HTML `id` attributes, which violates HTML5 standards and WCAG 4.1.1 (Parsing).

### Duplicate IDs Found

1. **`id="a"`** - Appears 2 times
   - Source: SVG gradient elements (linearGradient and radialGradient)
   - Location: Inline SVG icons or cover images on homepage
   - Impact: SVG gradients may reference wrong gradient definitions

2. **`id="selected-style"`** - Appears 10 times
   - Source: Component scoped `<style>` tags
   - Location: Multiple UI components throughout the page
   - Impact: Style scoping may be affected

### Testing

Run the duplicate ID detection script:
```bash
node tests/find-duplicate-ids.mjs http://localhost:4321/
```

Or run the full page load test suite:
```bash
npm run test:loads
```

### Remediation Plan

#### For SVG Gradient IDs

1. Search for SVG files or inline SVGs with generic gradient IDs
2. Replace `id="a"` with unique, descriptive IDs (e.g., `id="gradient-book-cover-1"`, `id="gradient-icon-2"`)
3. Update corresponding `url(#a)` references in the same SVG

#### For Style Tag IDs

1. Investigate the component library/theme system generating `id="selected-style"`
2. Either:
   - Remove the IDs entirely (if not functionally necessary)
   - Make them unique (e.g., `id="selected-style-${componentId}"`)
   - Use data attributes or classes instead

### Notes

- These duplicate IDs don't prevent pages from loading or functioning correctly
- The page load test suite has been updated to track these as known issues
- Any NEW duplicate IDs will cause test failures, ensuring the problem doesn't worsen

### References

- Test: `tests/page-loads.spec.ts`
- Detection script: `tests/find-duplicate-ids.mjs`
- Inspection script: `tests/inspect-duplicate-ids.mjs`
- WCAG 4.1.1: https://www.w3.org/WAI/WCAG21/Understanding/parsing.html
