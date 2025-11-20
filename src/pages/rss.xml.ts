import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@/config";

export async function GET() {
  // Get all news posts from the news collection
  const newsPosts = await getCollection("news");

  // Filter out drafts and sort by publish date (newest first)
  const publishedPosts = newsPosts
    .filter(post => !post.data.draft)
    .sort((a, b) => {
      const dateA = new Date(a.data.publishDate).getTime();
      const dateB = new Date(b.data.publishDate).getTime();
      return dateB - dateA; // newest first
    })
    .slice(0, 20); // Limit to 20 most recent posts

  return rss({
    title: `${SITE.title} - News`,
    description: "Latest news, updates, and announcements from sci-fi author Cache McClure",
    site: SITE.website,
    items: publishedPosts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      link: `${SITE.website}news/${post.id}`,
      pubDate: new Date(post.data.publishDate),
      categories: [post.data.category],
      // Add custom namespaced elements for additional metadata
      customData: `<category>${post.data.category}</category>`,
    })),
    // Add custom RSS namespace for additional elements
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    customData: `<atom:link href="${SITE.website}rss.xml" rel="self" type="application/rss+xml" />`,
  });
}
