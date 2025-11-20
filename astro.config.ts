import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  output: "static", // Explicit static site generation
  compressHTML: true, // Compress HTML output (enabled by default, explicit for clarity)
  build: {
    format: "directory", // Generate /about/index.html (SEO-friendly, Cloudflare Pages compatible)
    inlineStylesheets: "auto", // Inline stylesheets <4KB for better performance
  },
  integrations: [
    mdx(),
    sitemap({
      filter: page => {
        // Exclude archives if showArchives is false
        if (!SITE.showArchives && page.endsWith("/archives/")) return false;

        // Exclude debug pages
        if (page.includes("/debug/")) return false;

        // Exclude disabled pages
        if (page.includes(".disabled/")) return false;

        // Exclude search page (not useful for SEO)
        if (page.endsWith("/search/")) return false;

        // Exclude posts and tags pages (using news instead)
        if (page.endsWith("/posts/") || page.endsWith("/tags/")) return false;

        return true;
      },
      serialize: item => {
        const url = item.url;

        // Homepage
        if (url.endsWith("cachemcclure.com/")) {
          item.priority = 1.0;
          item.changefreq = "weekly" as any;
        }
        // Individual book pages
        else if (url.includes("/books/") && !url.endsWith("/books/")) {
          item.priority = 0.9;
          item.changefreq = "monthly" as any;
        }
        // Books index
        else if (url.endsWith("/books/")) {
          item.priority = 0.9;
          item.changefreq = "weekly" as any;
        }
        // About page
        else if (url.endsWith("/about/")) {
          item.priority = 0.8;
          item.changefreq = "monthly" as any;
        }
        // Individual news posts
        else if (url.includes("/news/") && !url.endsWith("/news/")) {
          item.priority = 0.7;
          item.changefreq = "monthly" as any;
        }
        // News index
        else if (url.endsWith("/news/")) {
          item.priority = 0.7;
          item.changefreq = "weekly" as any;
        }
        // All other pages
        else {
          item.priority = 0.5;
          item.changefreq = "monthly" as any;
        }

        return item;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      // Phase 1.0 - Current variables
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),

      // Phase 1.1 - Newsletter integration (Buttondown)
      BUTTONDOWN_API_KEY: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
      PUBLIC_BUTTONDOWN_USERNAME: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),

      // Phase 2.0 - Polling system (Cloudflare)
      CLOUDFLARE_ACCOUNT_ID: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
      CLOUDFLARE_API_TOKEN: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),
      CLOUDFLARE_D1_DATABASE_ID: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),

      // Phase 2.0 - Turnstile CAPTCHA (anti-bot)
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        access: "secret",
        context: "server",
        optional: true,
      }),

      // Analytics (TBD)
      PUBLIC_PLAUSIBLE_DOMAIN: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_PLAUSIBLE_API_HOST: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_FATHOM_SITE_ID: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),

      // Development
      DEBUG: envField.boolean({
        access: "public",
        context: "server",
        optional: true,
        default: false,
      }),
    },
  },
  experimental: {
    preserveScriptOrder: true,
  },
});
