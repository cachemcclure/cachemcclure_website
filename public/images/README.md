# Author Photo Guidelines

## Current Status

The current author photo is a placeholder SVG (`cache-mcclure-author.svg`).

## Replacing with Your Real Photo

When you're ready to replace the placeholder with your actual headshot:

### 1. Photo Requirements

**Recommended specs:**
- **Format**: JPG or WebP (WebP preferred for performance)
- **Dimensions**:
  - Minimum: 800×800px (square)
  - Recommended: 1200×1200px or higher
  - Aspect ratio: 1:1 (square) or 2:3 (portrait)
- **Quality**: High resolution, professional quality
- **File size**: Target under 200KB (will be optimized)

**Photo style:**
- Professional headshot or author photo
- Clear, well-lit face
- Neutral or complementary background
- Appropriate for professional author website

### 2. Optimization Steps

Once you have your photo, I can optimize it:

1. **Resize**: Scale to optimal dimensions (e.g., 800×800px for display, 1200×1200px for retina)
2. **Convert to WebP**: Modern format with better compression
3. **Compress**: Reduce file size while maintaining quality
4. **Generate fallback**: Create JPG version for older browsers
5. **Create variants**:
   - Full size for About page
   - Thumbnail for bylines/cards
   - OG image for social sharing

### 3. File Naming Convention

Place your photo in this directory with one of these names:
- `cache-mcclure-author.jpg` (JPG version)
- `cache-mcclure-author.webp` (WebP version, preferred)
- `cache-mcclure-author-original.jpg` (Keep original for reference)

### 4. Update Instructions

After adding your photo, update these files:
- `src/config.ts` - Update author photo reference if needed
- `src/pages/about.astro` - Verify photo displays correctly
- Any components that use the author photo

### 5. Current Placeholder Details

**File**: `cache-mcclure-author.svg`
- Size: ~2KB (vector, scales perfectly)
- Dimensions: 800×800px viewBox
- Style: Sci-fi themed silhouette with gradient background
- Colors: Blue/purple gradient matching site theme
- Features: "CACHE McCLURE" text, tech/circuit decorative elements

---

**Note**: SVG is already web-optimized (vector format). When you provide your real photo, I'll handle all optimization automatically.
