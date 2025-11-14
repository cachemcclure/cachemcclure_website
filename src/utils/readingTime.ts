/**
 * Calculate estimated reading time for content
 * Based on industry standard of 200 words per minute (WPM)
 *
 * @param content - The text content to analyze (can be HTML, Markdown, or plain text)
 * @param wpm - Words per minute reading speed (default: 200)
 * @returns Object with minutes and text representation
 */
export function calculateReadingTime(
  content: string,
  wpm: number = 200
): { minutes: number; text: string } {
  // Strip HTML tags and MDX/Markdown syntax for accurate word count
  const plainText = content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[#*_~`[\]]/g, "") // Remove Markdown syntax chars
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Count words (split by whitespace)
  const words = plainText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time in minutes (minimum 1 minute)
  const rawMinutes = wordCount / wpm;
  const minutes = Math.max(1, Math.ceil(rawMinutes));

  // Generate human-readable text
  const text = `${minutes} min read`;

  return {
    minutes,
    text,
  };
}

/**
 * Format reading time with additional context
 *
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5-minute read" or "1-minute read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes}-minute read`;
}

/**
 * Get reading time category for styling/display purposes
 *
 * @param minutes - Reading time in minutes
 * @returns Category: "quick" (<5 min), "medium" (5-15 min), "long" (>15 min)
 */
export function getReadingTimeCategory(
  minutes: number
): "quick" | "medium" | "long" {
  if (minutes < 5) return "quick";
  if (minutes <= 15) return "medium";
  return "long";
}
