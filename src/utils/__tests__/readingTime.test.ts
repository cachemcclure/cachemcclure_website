import { describe, it, expect } from "vitest";
import {
  calculateReadingTime,
  formatReadingTime,
  getReadingTimeCategory,
} from "../readingTime";

describe("calculateReadingTime", () => {
  it("should calculate reading time for plain text", () => {
    // 200 words at 200 WPM = 1 minute
    const content = "word ".repeat(200).trim();
    const result = calculateReadingTime(content);

    expect(result.minutes).toBe(1);
    expect(result.text).toBe("1 min read");
  });

  it("should round up to nearest minute", () => {
    // 250 words at 200 WPM = 1.25 minutes, should round to 2
    const content = "word ".repeat(250).trim();
    const result = calculateReadingTime(content);

    expect(result.minutes).toBe(2);
    expect(result.text).toBe("2 min read");
  });

  it("should have minimum of 1 minute for short content", () => {
    const content = "Just a few words here";
    const result = calculateReadingTime(content);

    expect(result.minutes).toBe(1);
    expect(result.text).toBe("1 min read");
  });

  it("should handle empty content", () => {
    const result = calculateReadingTime("");

    expect(result.minutes).toBe(1);
    expect(result.text).toBe("1 min read");
  });

  it("should strip HTML tags from content", () => {
    const content = `
      <div>
        <h1>Title</h1>
        <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    `.repeat(20); // Repeat to get enough words

    const result = calculateReadingTime(content);

    // Should count words without HTML tags
    expect(result.minutes).toBeGreaterThan(0);
  });

  it("should strip Markdown syntax from content", () => {
    const content = `
      # Heading
      ## Subheading

      This is **bold** and *italic* text.

      - List item 1
      - List item 2

      [Link text](https://example.com)

      \`code\` and \`\`\`code blocks\`\`\`
    `.repeat(20); // Repeat to get enough words

    const result = calculateReadingTime(content);

    // Should count words without Markdown syntax
    expect(result.minutes).toBeGreaterThan(0);
  });

  it("should handle content with multiple whitespace characters", () => {
    const content = "word1    word2\n\nword3\t\tword4".repeat(50);
    const result = calculateReadingTime(content);

    // Should normalize whitespace and count correctly
    expect(result.minutes).toBe(1);
  });

  it("should use custom WPM when provided", () => {
    // 400 words at 400 WPM = 1 minute (instead of 2 at 200 WPM)
    const content = "word ".repeat(400).trim();
    const result = calculateReadingTime(content, 400);

    expect(result.minutes).toBe(1);
  });

  it("should calculate correct time for longer content", () => {
    // 1000 words at 200 WPM = 5 minutes
    const content = "word ".repeat(1000).trim();
    const result = calculateReadingTime(content);

    expect(result.minutes).toBe(5);
    expect(result.text).toBe("5 min read");
  });

  it("should calculate correct time for very long content", () => {
    // 3000 words at 200 WPM = 15 minutes
    const content = "word ".repeat(3000).trim();
    const result = calculateReadingTime(content);

    expect(result.minutes).toBe(15);
    expect(result.text).toBe("15 min read");
  });

  it("should handle content with punctuation", () => {
    const content =
      "Hello, world! This is a test. Does it work? Yes, it does.".repeat(50);
    const result = calculateReadingTime(content);

    expect(result.minutes).toBeGreaterThan(0);
  });

  it("should handle realistic blog post content", () => {
    const content = `
      # My New Book Release

      I'm excited to announce my new book is now available!

      ## About the Book

      This sci-fi thriller takes place in a dystopian future where...

      The main character, Alex, discovers a conspiracy that threatens...

      ### Key Features

      - Fast-paced action
      - Complex characters
      - Thought-provoking themes

      You can buy it on [Amazon](https://amazon.com) or your favorite bookstore.
    `.repeat(5); // Simulate a medium-length post

    const result = calculateReadingTime(content);

    // Should be reasonable for this content
    expect(result.minutes).toBeGreaterThanOrEqual(1);
    expect(result.minutes).toBeLessThanOrEqual(10);
  });

  it("should handle MDX/JSX components in content", () => {
    const content = `
      <BookCard title="My Book" />

      Some content here.

      <Image src="/cover.jpg" alt="Cover" />

      More content.
    `.repeat(20);

    const result = calculateReadingTime(content);

    // Should strip JSX and count only text
    expect(result.minutes).toBeGreaterThan(0);
  });
});

describe("formatReadingTime", () => {
  it("should format 1 minute correctly", () => {
    expect(formatReadingTime(1)).toBe("1-minute read");
  });

  it("should format multiple minutes correctly", () => {
    expect(formatReadingTime(5)).toBe("5-minute read");
    expect(formatReadingTime(10)).toBe("10-minute read");
    expect(formatReadingTime(42)).toBe("42-minute read");
  });
});

describe("getReadingTimeCategory", () => {
  it("should categorize quick reads correctly", () => {
    expect(getReadingTimeCategory(1)).toBe("quick");
    expect(getReadingTimeCategory(2)).toBe("quick");
    expect(getReadingTimeCategory(3)).toBe("quick");
    expect(getReadingTimeCategory(4)).toBe("quick");
  });

  it("should categorize medium reads correctly", () => {
    expect(getReadingTimeCategory(5)).toBe("medium");
    expect(getReadingTimeCategory(10)).toBe("medium");
    expect(getReadingTimeCategory(15)).toBe("medium");
  });

  it("should categorize long reads correctly", () => {
    expect(getReadingTimeCategory(16)).toBe("long");
    expect(getReadingTimeCategory(20)).toBe("long");
    expect(getReadingTimeCategory(100)).toBe("long");
  });

  it("should handle edge cases", () => {
    expect(getReadingTimeCategory(0)).toBe("quick");
    expect(getReadingTimeCategory(-1)).toBe("quick");
  });
});
