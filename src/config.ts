export const SITE = {
  website: "https://cachemcclure.com/",
  author: "Cache McClure",
  profile: "https://cachemcclure.com/about",
  desc: "Sci-fi author Cache McClure's official website featuring books, news, and updates.",
  title: "Cache McClure",
  ogImage: "cache-mcclure-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false, // Not needed for v1.0 (per CLAUDE.md)
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/cachemcclure/cachemcclure_website/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "America/Los_Angeles", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
