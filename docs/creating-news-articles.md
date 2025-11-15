# Creating News Articles

## Quick Start

To create a new news article, add an MDX file to `src/data/news/`.

## File Location

```
src/data/news/your-article-slug.mdx
```

## Template

Copy and paste this template for new articles:

```mdx
---
title: "Your Article Title"
description: "A brief 1-2 sentence summary of the article for SEO and previews"
publishDate: 2025-01-15
category: "updates"  # Options: releases, events, updates
draft: false  # Set to true to hide from production
image: "/images/news/your-image.jpg"  # Optional featured image
imageAlt: "Descriptive alt text for the image"  # Required if image is set
---

Your article content goes here in **Markdown** format.

## You can use headings

- And lists
- With bullet points

1. Or numbered lists
2. Like this

You can also use [links](https://example.com) and **bold text** or *italic text*.

### Images in content

![Alt text for image](/images/your-image.jpg)

### Code blocks

\`\`\`javascript
const example = "code block";
\`\`\`
```

## Front Matter Fields

- **title** (required): The article headline
- **description** (required): 1-2 sentence summary for SEO/previews
- **publishDate** (required): Simple date format (YYYY-MM-DD)
- **category** (required): One of:
  - `releases` - Book launches, cover reveals
  - `events` - Conferences, signings, appearances
  - `updates` - General news, writing progress
- **draft** (optional): Set to `true` to hide from production build
- **image** (optional): Path to featured image (starts with `/`)
- **imageAlt** (optional but recommended): Descriptive alt text for accessibility

## Example: Book Announcement

Create `src/data/news/2025-01-neural-uprising-cover-reveal.mdx`:

```mdx
---
title: "Neural Uprising Cover Reveal"
description: "First look at the stunning cover art for Neural Uprising, coming this summer."
publishDate: 2025-01-15
category: "releases"
image: "/images/news/neural-uprising-cover.jpg"
imageAlt: "Neural Uprising book cover featuring a futuristic cityscape with neural network patterns"
---

I'm thrilled to reveal the cover for **Neural Uprising**, the second book in The Fracture Engines series!

## The Cover

![Neural Uprising Cover](/images/news/neural-uprising-cover.jpg)

The talented [Artist Name] perfectly captured the cyberpunk aesthetic and the tension between human consciousness and artificial intelligence that drives this story.

## What's Next

Neural Uprising releases June 15, 2025. Pre-orders open next month!

Stay tuned for more updates as we get closer to launch.
```

## Example: Writing Update

Create `src/data/news/2025-01-january-writing-update.mdx`:

```mdx
---
title: "January 2025 Writing Update"
description: "Progress on Book 3, upcoming events, and what's on my mind this month."
publishDate: 2025-01-31
category: "updates"
---

Happy New Year! Here's what I've been working on this month.

## Book 3 Progress

I've completed the first draft of Book 3 in The Fracture Engines series! The manuscript clocked in at 92,000 words. Now comes the fun part—revisions.

## Upcoming Events

I'll be attending:
- **WorldCon 2025** (August 10-14) - Panel on hard sci-fi worldbuilding
- **Local bookstore signing** (February 5) - Stop by if you're in the area!

## Reading List

Currently reading:
- *Project Hail Mary* by Andy Weir
- *The Quantum Thief* by Hannu Rajaniemi

## What's Next

February goals:
- Complete second draft revisions
- Finalize cover art for Neural Uprising
- Write 2 blog posts on worldbuilding techniques

Thanks for reading!
```

## Workflow

1. **Create** the MDX file in `src/data/news/`
2. **Write** your content using the template
3. **Test locally**: `npm run dev` and visit `http://localhost:4321/news`
4. **Build**: `npm run build` (checks for errors)
5. **Commit**: `git add . && git commit -m "Add news post: Your Title"`
6. **Deploy**: `git push` (auto-deploys to Cloudflare Pages)

## Tips

- Use descriptive slugs: `2025-01-book-announcement.mdx` not `post1.mdx`
- Include `publishDate` for proper chronological ordering
- Set `draft: true` while working on articles
- Always add alt text to images for accessibility
- Keep descriptions under 160 characters for SEO
- Use the `/images/news/` directory for article images

## Troubleshooting

**Article not showing?**
- Check `draft: false` in front matter
- Verify `publishDate` is in the past
- Run `npm run build` to check for errors
- Clear browser cache

**Images not loading?**
- Images must be in `public/` directory
- Paths start with `/` (e.g., `/images/news/photo.jpg`)
- Supported formats: JPG, PNG, WebP, SVG

**Build errors?**
- Check front matter YAML syntax
- Ensure all required fields are present
- Verify date format: `YYYY-MM-DD` (not `YYYY-MM-DDTHH:mm:ssZ`)
- Check for unclosed markdown code blocks
