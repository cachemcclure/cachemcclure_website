# Screen Reader Testing Guide

This guide provides instructions for manually testing the Cache McClure website with screen readers to ensure WCAG 2.1 AA compliance.

## Why Screen Reader Testing?

While automated tests can catch many accessibility issues, screen readers are used by millions of people with visual impairments. Manual testing with screen readers ensures that:

1. Content is announced in a logical order
2. Interactive elements are properly labeled
3. Form fields and buttons are clear and actionable
4. Navigation is intuitive
5. No content is hidden or confusing

## Recommended Screen Readers

### macOS - VoiceOver (Free, Built-in)

**Activation:**
- Press `Cmd + F5` to toggle VoiceOver on/off
- Or: System Settings → Accessibility → VoiceOver → Enable

**Basic Navigation:**
- `VO` = `Control + Option`
- `VO + Right Arrow` = Next item
- `VO + Left Arrow` = Previous item
- `VO + Space` = Activate link/button
- `VO + U` = Open rotor (lists headings, links, landmarks)
- `VO + H` = Next heading
- `VO + Shift + H` = Previous heading
- `VO + A` = Read all from current position

### Windows - NVDA (Free, Open Source)

**Download:** https://www.nvaccess.org/download/

**Basic Navigation:**
- `Insert` or `Caps Lock` = NVDA modifier key
- `Down Arrow` = Next item
- `Up Arrow` = Previous item
- `Enter` = Activate link/button
- `H` = Next heading
- `Shift + H` = Previous heading
- `D` = Next landmark
- `K` = Next link
- `Insert + Down Arrow` = Read all

### Windows - JAWS (Commercial, Most Popular)

**Download:** https://www.freedomscientific.com/products/software/jaws/

**Basic Navigation:**
- Similar to NVDA
- `Insert` = JAWS modifier key
- `Insert + F7` = List of links
- `Insert + F6` = List of headings
- `Insert + Down Arrow` = Read all

## Testing Checklist

### 1. Page Structure & Landmarks

**What to Test:**
- Navigate using landmarks (Header, Navigation, Main, Footer)
- Verify logical content flow
- Check heading hierarchy (H1 → H2 → H3)

**How to Test:**
- **VoiceOver**: Press `VO + U`, select "Landmarks"
- **NVDA/JAWS**: Press `D` to cycle through landmarks

**Expected Results:**
- ✅ Header landmark present
- ✅ Navigation landmark present with label "Main navigation"
- ✅ Main content landmark present with id "main-content"
- ✅ Footer landmark present with label "Site footer"
- ✅ Newsletter section announced as "Newsletter signup" landmark
- ✅ One H1 per page, followed by H2s, then H3s

### 2. Navigation

**What to Test:**
- Header navigation links
- Active page indication
- Mobile menu (if testing on small viewport)
- Skip link functionality

**How to Test:**
1. Navigate to homepage
2. Listen for skip link announcement (should be first focusable element)
3. Activate skip link
4. Verify jump to main content
5. Return to header, navigate through menu links
6. Verify current page is announced with "current page" or similar

**Expected Results:**
- ✅ Skip link announced as "Skip to content"
- ✅ Navigation announced as "Main navigation"
- ✅ Current page indicated (e.g., "Books, current page")
- ✅ Links have clear, descriptive text
- ✅ Mobile menu button announces state ("expanded" or "collapsed")

### 3. Interactive Elements

**What to Test:**
- Buttons and their states
- Links and their purposes
- Form controls (when newsletter is implemented)

**How to Test:**
- Navigate through all interactive elements
- Verify each announces its type (button, link, etc.)
- Check aria-label announcements

**Expected Results:**
- ✅ Theme toggle: "Toggle light and dark mode, button"
- ✅ Mobile menu: "Open Menu, button, collapsed" or "Close Menu, button, expanded"
- ✅ Social links: "Follow Cache McClure on Twitter, link"
- ✅ Buy links: "Buy [Book Title] from Amazon, opens in new tab, link"
- ✅ Back to Top: "Back to top, button"

### 4. Content Structure

**What to Test:**
- Book cards
- News cards
- Headings and descriptions
- Images and alt text

**How to Test:**
- Navigate to `/books` page
- Use heading navigation (`H` key) to jump between books
- Listen to each card's content

**Expected Results:**
- ✅ Each book card has heading (H2 or H3)
- ✅ Cover images announced with descriptive alt text: "Cover of [Book Title]"
- ✅ Status and series badges announced
- ✅ Links have context (e.g., "Read more about Fracture Engine")
- ✅ Same for news cards on `/news` page

### 5. Decorative vs. Functional Icons

**What to Test:**
- Icons should be hidden from screen reader if decorative
- Icons should be announced if they convey meaning

**How to Test:**
- Navigate through pages with icons (header, footer, cards)
- Listen for icon announcements

**Expected Results:**
- ✅ Calendar icons (next to dates) NOT announced (decorative)
- ✅ Hash icons (in tags) NOT announced (decorative)
- ✅ Arrow icons (in navigation/buttons) NOT announced (text provides context)
- ✅ Social media icons NOT announced (aria-label on link provides context)
- ✅ Progress indicator on scroll NOT announced (purely visual)

### 6. Forms & Input (When Implemented in v1.1)

**What to Test:**
- Newsletter signup form
- Field labels
- Error messages
- Success messages

**How to Test:**
- Navigate to newsletter section
- Tab through form fields
- Listen for label announcements
- Submit form with errors
- Submit form successfully

**Expected Results:**
- ✅ Email input has label: "Email address"
- ✅ Submit button clearly labeled: "Subscribe to newsletter"
- ✅ Required fields announced
- ✅ Error messages announced immediately
- ✅ Success message announced after submission

### 7. Tables (If Any)

**What to Test:**
- Table headers
- Row and column announcements
- Navigation within tables

**How to Test:**
- Navigate to any page with tables
- Use table navigation commands

**Expected Results:**
- ✅ Tables announced as tables with row/column count
- ✅ Headers properly associated with data cells

### 8. Dynamic Content

**What to Test:**
- Theme toggle (light/dark mode switch)
- Mobile menu expand/collapse
- Back to Top button visibility

**How to Test:**
- Activate theme toggle
- Listen for state change announcement
- Expand/collapse mobile menu
- Scroll page to show/hide Back to Top button

**Expected Results:**
- ✅ Theme change announces new mode (if aria-live region present)
- ✅ Mobile menu state changes announced ("expanded" → "collapsed")
- ✅ Back to Top button appears/disappears gracefully without confusing announcements

## Common Issues to Watch For

### ❌ Issues That Fail WCAG 2.1 AA

1. **Missing alt text on images**
   - Every `<img>` must have alt attribute
   - Decorative images should have `alt=""`

2. **Unlabeled form controls**
   - Inputs without labels
   - Buttons without text or aria-label

3. **Poor heading hierarchy**
   - Skipping heading levels (H1 → H3)
   - Multiple H1s on same page

4. **Generic link text**
   - "Click here" or "Read more" without context
   - Use aria-label or sr-only text for context

5. **Missing landmark roles**
   - Content not wrapped in semantic HTML or ARIA landmarks

6. **Inaccessible custom components**
   - Divs used as buttons without proper ARIA
   - Custom dropdowns without keyboard support

### ✅ What Good Accessibility Sounds Like

When navigating the Cache McClure website with a screen reader, you should hear:

**Homepage:**
```
Link, Skip to content
Cache McClure, link, heading level 1
Navigation, Main navigation
Link, Books
Link, News, current page
Link, About
Main, main content
Heading level 2, Welcome to Cache McClure's Official Website
Paragraph, Science fiction author of...
...
Footer, Site footer
Aside, Newsletter signup
Heading level 3, Stay Updated
Link, Follow Cache McClure on Twitter
```

**Books Page:**
```
Link, Skip to content
Navigation, Main navigation
Link, Books, current page
Main, main content
Heading level 1, Books
Article
Heading level 2, Fracture Engine
Image, Cover of Fracture Engine
Published
Link, Read more about Fracture Engine
```

## Testing Schedule

**Recommended Testing Frequency:**
- ✅ After implementing new components
- ✅ After major layout changes
- ✅ Before each production deployment
- ✅ After dependency updates that affect UI
- ✅ When user feedback suggests accessibility issues

**Recommended Pages to Test:**
1. Homepage (`/`)
2. Books listing (`/books`)
3. Individual book page (`/books/[slug]`)
4. News listing (`/news`)
5. Individual news post (`/news/[slug]`)
6. About page (`/about`)

## Automated Testing Complement

Screen reader testing should complement automated testing:

**Automated Tests** (tests/accessibility.spec.ts):
- Semantic HTML structure
- ARIA attributes presence
- Heading hierarchy
- Landmark roles
- Alt text presence
- Keyboard navigation

**Manual Screen Reader Tests** (this guide):
- Content flow and reading order
- Announcement quality and clarity
- Context and meaningfulness
- User experience with actual assistive tech
- Edge cases and real-world usage

## Resources

**Learning Screen Readers:**
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)

**WCAG 2.1 Guidelines:**
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM's WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)

**Testing Tools:**
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## Reporting Issues

If you find accessibility issues during screen reader testing:

1. **Document the issue:**
   - What page/component is affected?
   - What screen reader are you using?
   - What is announced vs. what should be announced?
   - Steps to reproduce

2. **Classify severity:**
   - **Critical**: Cannot access core functionality
   - **High**: Significant confusion or poor experience
   - **Medium**: Minor confusion but workarounds exist
   - **Low**: Enhancement opportunity

3. **File an issue** with the development team

4. **Verify the fix** after implementation

---

**Last Updated**: 2025-11-16
**Version**: 1.0
