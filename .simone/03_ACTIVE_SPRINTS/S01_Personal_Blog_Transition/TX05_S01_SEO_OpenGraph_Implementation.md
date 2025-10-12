---
task_id: T05_S01
sprint_id: S01
status: open
priority: critical
complexity: Medium
estimated_hours: 3-4
created: 2025-10-11T04:10:00Z
depends_on: [T01_S01]
blocks: [T04_S01]
---

# Task: Implement Comprehensive SEO and OpenGraph Tags

## Description
Add comprehensive SEO and OpenGraph meta tags to blog pages to enable professional social sharing previews and improve search engine optimization. Currently, blog detail pages have **zero meta tags**, and the listing page only has basic title/description.

## Goal / Objectives
- Enable professional social sharing previews (LinkedIn, Twitter, Facebook, Slack, iMessage)
- Implement dynamic meta tags per blog post
- Add OpenGraph and Twitter Card support
- Create fallback OG image for posts
- Improve SEO with canonical URLs

## Acceptance Criteria
- [ ] Blog detail pages have dynamic `<Head>` component with per-post metadata
- [ ] OpenGraph tags implemented (og:title, og:description, og:image, og:url, og:type, article:*)
- [ ] Twitter Card tags implemented (twitter:card, twitter:title, twitter:description, twitter:image)
- [ ] Fallback OG image created at `/public/images/og-default.jpg` (1200x630px)
- [ ] Blog listing page has OpenGraph tags
- [ ] Canonical URLs added for SEO
- [ ] Social sharing previews tested on LinkedIn, Twitter, Facebook

## Critical Context

### Current State (From Research)
**Blog Detail Page** (`pages/blog/[slug].jsx`):
- ❌ **No `<Head>` component at all** (237 lines of code, zero meta tags)
- ❌ No dynamic meta tag generation
- **Impact**: Sharing blog posts on social media produces generic/ugly previews

**Blog Listing Page** (`pages/blog/index.jsx:79-85`):
- ✅ Basic `<title>` and `<meta description>` exist
- ❌ Zero OpenGraph tags
- ❌ Current title outdated: "Neo-Bauhaus Design Insights"

### Why This Is Critical
- **Social sharing is the primary distribution mechanism for personal blogs**
- Without OpenGraph: Poor click-through rates from LinkedIn/Twitter
- Without proper meta tags: Reduced search engine visibility
- Professional appearance = credibility for personal brand

## Technical Guidance

### Implementation 1: Blog Detail Page Meta Tags

**File**: `pages/blog/[slug].jsx`

**Add after line 6** (after imports, before page component):
```jsx
import Head from 'next/head';

export default function BlogPost() {
  // ... existing state and useEffect code ...

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!post) return null;

  // Generate meta tag values
  const pageTitle = `${post.title} - Ben Redmond`;
  const pageDescription = post.excerpt;
  const pageUrl = `https://yourdomain.com/${post.slug}`;
  const ogImage = post.coverImage || '/images/og-default.jpg';
  const publishedTime = post.date;

  return (
    <>
      <Head>
        {/* Basic SEO */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* OpenGraph meta tags (LinkedIn, Facebook, iMessage) */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`https://yourdomain.com${ogImage}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Ben Redmond" />
        <meta property="article:published_time" content={publishedTime} />
        <meta property="article:author" content={post.author || "Ben Redmond"} />
        {post.tags && post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`https://yourdomain.com${ogImage}`} />
        {/* Uncomment if Ben has Twitter: <meta name="twitter:creator" content="@benredmond" /> */}
      </Head>

      <MasterGrid>
        {/* existing blog post rendering */}
      </MasterGrid>
    </>
  );
}
```

### Implementation 2: Blog Listing Page Meta Tags

**File**: `pages/blog/index.jsx`

**Update lines 79-85**:
```jsx
<Head>
  {/* Basic SEO */}
  <title>Ben Redmond - AI Coding & Product Building</title>
  <meta
    name="description"
    content="Thoughts on building with frontier AI, coding techniques, and shipping real products. Monthly essays on AI-assisted development."
  />
  <link rel="canonical" href="https://yourdomain.com" />

  {/* OpenGraph meta tags */}
  <meta property="og:title" content="Ben Redmond - AI Coding & Product Building" />
  <meta property="og:description" content="Thoughts on building with frontier AI, coding techniques, and shipping real products." />
  <meta property="og:url" content="https://yourdomain.com" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://yourdomain.com/images/og-default.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Ben Redmond" />

  {/* Twitter Card meta tags */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Ben Redmond - AI Coding & Product Building" />
  <meta name="twitter:description" content="Thoughts on building with frontier AI, coding techniques, and shipping real products." />
  <meta name="twitter:image" content="https://yourdomain.com/images/og-default.jpg" />
</Head>
```

### Implementation 3: Create Fallback OG Image

**File**: `public/images/og-default.jpg`

**Requirements**:
- Dimensions: **1200x630px** (OpenGraph standard)
- Format: JPG or PNG
- Content suggestions:
  - Simple text: "Ben Redmond - AI Coding & Product Building"
  - Clean background (white or subtle gradient)
  - Professional typography
  - Optional: Small Koucai logo in corner

**Design Tools**:
- Figma (recommended for precision)
- Canva (quick templates)
- Adobe Photoshop
- Or use a simple HTML/CSS screenshot tool

**Placement**: Save to `/Users/ben/dev/chinese-bot/public/images/og-default.jpg`

## Testing Checklist

### 1. LinkedIn Post Inspector
- [ ] Visit: https://www.linkedin.com/post-inspector/
- [ ] Test URL: `https://yourdomain.com/ai-changes-everything-thinking-vs-doing`
- [ ] Verify: Title, description, and image display correctly
- [ ] Check: Image is 1200x630px and renders properly

### 2. Twitter Card Validator
- [ ] Visit: https://cards-dev.twitter.com/validator
- [ ] Test URL: `https://yourdomain.com/ai-changes-everything-thinking-vs-doing`
- [ ] Verify: Summary Large Image card renders
- [ ] Check: Title, description, image display

### 3. Facebook Sharing Debugger
- [ ] Visit: https://developers.facebook.com/tools/debug/
- [ ] Test URL: `https://yourdomain.com/ai-changes-everything-thinking-vs-doing`
- [ ] Verify: Preview looks professional
- [ ] Click "Scrape Again" to clear cache if needed

### 4. iMessage Preview Test
- [ ] Send URL via iMessage to another device
- [ ] Verify: Rich preview appears with image, title, description

### 5. Slack Preview Test
- [ ] Paste URL in Slack channel
- [ ] Verify: Unfurl shows image, title, description

### 6. Google Search Preview
- [ ] Use Google Rich Results Test: https://search.google.com/test/rich-results
- [ ] Verify: No errors, article structured data recognized

## Before Starting
- [ ] Read OpenGraph protocol: https://ogp.me/
- [ ] Read Twitter Card docs: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- [ ] Create or source fallback OG image (1200x630px)
- [ ] Verify blog is accessible at yourdomain.com (may need to test locally with subdomain)

## Common Gotchas
- **Image URLs must be absolute** (https://yourdomain.com/images/...), not relative
- **Image dimensions must be exact** (1200x630px for optimal display)
- **Social platforms cache aggressively** - use debuggers to force re-scrape
- **Missing Head import** - don't forget `import Head from 'next/head'`
- **OG image 404** - ensure image exists at specified path before deploying
- **Twitter creator tag** - only add if Ben has Twitter handle

## Success Indicators
✅ Blog detail pages have comprehensive meta tags in `<Head>`
✅ OpenGraph tags present on all blog pages
✅ Twitter Card tags implemented
✅ Fallback OG image created and deployed
✅ LinkedIn Post Inspector shows professional preview
✅ Twitter Card Validator shows summary_large_image card
✅ Facebook Sharing Debugger renders correctly
✅ iMessage shows rich preview
✅ Slack unfurls properly

## Dependencies
- **Depends on**: T01_S01 (needs blog-posts.json with post data)
- **Blocks**: T04_S01 (deployment should include SEO tags)
- **Parallel with**: T02_S01, T03_S01, T06_S01

## Related References
- Research: `.simone/research_personal_blog_validation.md` - Gap 1 analysis
- OpenGraph Protocol: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
