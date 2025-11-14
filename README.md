# Cache McClure Author Website

A modern, blazingly fast author website for sci-fi author Cache McClure, built with Astro 4.x and designed for performance, maintainability, and SEO.

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Content Management](#content-management)
- [Additional Documentation](#additional-documentation)

## About

This is the official website for **cachemcclure.com**, featuring:

- 📚 Book showcase with individual pages for each title
- 📰 News and updates section with RSS feed
- 👤 Author bio and press kit
- 🎨 Clean, minimalist design with dark mode support
- ⚡ Lightning-fast performance (95+ Lighthouse scores)
- 📱 Fully responsive mobile-first design
- ♿ WCAG 2.1 AA accessibility compliant

## Tech Stack

- **Framework**: [Astro 5.x](https://astro.build) - Static site generator
- **Content**: MDX (Markdown + JSX components)
- **Language**: TypeScript (strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Theme Base**: [AstroPaper](https://github.com/satnaing/astro-paper)
- **Hosting**: Cloudflare Pages
- **Version Control**: Git + GitHub

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.17.1 or higher (v20+ recommended)
  - Check version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)
- **npm**: v9.6.7 or higher (comes with Node.js)
  - Check version: `npm --version`
- **Git**: For version control
  - Check version: `git --version`
  - Download: [git-scm.com](https://git-scm.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/cachemcclure/cachemcclure_website.git
cd cachemcclure_website
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including Astro, Tailwind CSS, TypeScript, and other packages defined in `package.json`.

### 3. Start Development Server

```bash
npm run dev
```

The site will be available at:

- **Local**: http://localhost:4321/
- **Network**: Use `--host` flag to expose to network

The development server includes:

- ⚡ Hot Module Replacement (HMR) - changes appear instantly
- 🔄 Auto-reload on file changes
- 🎨 Live CSS updates without full page refresh

## Development

### Available Scripts

| Command                | Description                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `npm run dev`          | Start development server at `localhost:4321`                                          |
| `npm run build`        | Build production site to `./dist/` (includes type checking and Pagefind search index) |
| `npm run preview`      | Preview production build locally at `localhost:4321`                                  |
| `npm run sync`         | Generate TypeScript types for content collections                                     |
| `npm run format`       | Format code with Prettier                                                             |
| `npm run format:check` | Check code formatting without making changes                                          |
| `npm run lint`         | Lint code with ESLint                                                                 |

### Development Workflow

1. **Make changes** to files in `/src` directory
2. **View changes** automatically in browser (HMR)
3. **Type-check** as you code (if using TypeScript-aware editor)
4. **Test locally** before committing

### Hot Module Replacement

The dev server supports instant updates without full page reloads:

- ✅ Astro components (.astro)
- ✅ TypeScript/JavaScript files
- ✅ CSS/Tailwind styles
- ✅ MDX content files

## Building for Production

### 1. Build the Site

```bash
npm run build
```

This command:

1. Runs TypeScript type checking (`astro check`)
2. Builds static site to `./dist/` directory
3. Generates Pagefind search index
4. Optimizes images, CSS, and JavaScript
5. Creates sitemap.xml and robots.txt

### 2. Preview Production Build

```bash
npm run preview
```

This serves the `./dist/` folder at http://localhost:4321/ to verify the production build works correctly before deployment.

### Build Output

The build process creates:

- `./dist/` - Production-ready static files
- `./dist/pagefind/` - Search index files
- Optimized assets with cache-busting hashes
- Minified HTML, CSS, and JavaScript

### Performance Targets

Built site should achieve:

- First Contentful Paint: <1s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Total Blocking Time: <200ms
- Lighthouse Score: 95+ (all categories)

## Deployment

### Automated Deployment (Cloudflare Pages)

The site auto-deploys when changes are pushed to the `main` branch:

1. **Push to GitHub**: `git push origin main`
2. **Cloudflare builds**: Runs `npm run build` automatically
3. **Deploy to CDN**: Live at cachemcclure.com (~30-60 seconds)

### Manual Deployment

If deploying to a different host:

```bash
# Build the site
npm run build

# Deploy the ./dist folder to your hosting provider
# (Netlify, Vercel, AWS S3, etc.)
```

### Cloudflare Pages Configuration

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: 18 or higher
- **Environment variables**: None required (uses .env if needed)

## Project Structure

```
cachemcclure_website/
├── src/
│   ├── content/              # MDX content files
│   │   ├── config.ts         # Content collection schemas
│   │   ├── books/            # Book pages (*.mdx)
│   │   └── news/             # News posts (*.mdx)
│   ├── pages/                # Route pages
│   │   ├── index.astro       # Homepage
│   │   ├── books/            # Books routes
│   │   ├── news/             # News routes
│   │   └── about.astro       # About page
│   ├── components/           # Reusable components
│   ├── layouts/              # Layout templates
│   ├── styles/               # Global CSS (Tailwind)
│   └── utils/                # Utility functions
├── public/                   # Static assets
│   ├── covers/               # Book cover images
│   ├── images/               # General images
│   └── favicon.svg           # Site favicon
├── planning/                 # Project planning docs
├── dist/                     # Production build (generated)
├── CLAUDE.md                 # Comprehensive project docs
├── README.md                 # This file
├── astro.config.ts           # Astro configuration
├── tailwind.config.mjs       # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Content Management

### Adding a New Book

1. Create a new MDX file in `/src/content/books/`:

```bash
touch src/content/books/my-new-book.mdx
```

2. Add frontmatter and content:

```mdx
---
title: "My New Book"
description: "A gripping sci-fi adventure"
coverImage: "/covers/my-new-book.jpg"
publishDate: 2025-03-15
status: "published"
buyLinks:
  - name: "Amazon"
    url: "https://amazon.com/..."
  - name: "Barnes & Noble"
    url: "https://www.barnesandnoble.com/..."
---

# Book Synopsis

Your book description here...
```

3. Add cover image to `/public/covers/my-new-book.jpg`
4. Commit and push to deploy

### Adding a News Post

1. Create a new MDX file in `/src/content/news/`:

```bash
touch src/content/news/2025-03-announcement.mdx
```

2. Add frontmatter and content:

```mdx
---
title: "Big Announcement!"
description: "Exciting news about my next book"
publishDate: 2025-03-15
category: "releases"
---

Your announcement content here...
```

### Content Workflow

```bash
# 1. Create or edit content
vim src/content/books/new-book.mdx

# 2. Preview changes locally
npm run dev

# 3. Build to verify no errors
npm run build

# 4. Commit and deploy
git add .
git commit -m "Add new book: Title"
git push origin main
```

## Additional Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Comprehensive project documentation, architecture decisions, and development roadmap
- **[planning/](./planning/)**: Phase-by-phase implementation plans and checklists
- **[Astro Docs](https://docs.astro.build/)**: Official Astro framework documentation
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)**: Official Tailwind CSS documentation

## Troubleshooting

### Common Issues

**Port 4321 already in use:**

```bash
# Find and kill the process using port 4321
lsof -ti:4321 | xargs kill -9
# Or use a different port
npm run dev -- --port 3000
```

**TypeScript errors after installing dependencies:**

```bash
npm run sync  # Regenerate content collection types
```

**Build fails with type errors:**

```bash
npx astro check  # See detailed type errors
```

**Missing images:**

- Ensure images are in `/public/` directory
- Reference without `/public/` prefix (e.g., `/covers/book.jpg`)

### Getting Help

- Check the [Astro Discord](https://astro.build/chat)
- Review [AstroPaper documentation](https://github.com/satnaing/astro-paper)
- Open an issue on the GitHub repository

## License

Copyright © 2025 Cache McClure. All rights reserved.

---

**Built with** [Astro](https://astro.build) • **Styled with** [Tailwind CSS](https://tailwindcss.com) • **Deployed on** [Cloudflare Pages](https://pages.cloudflare.com)
