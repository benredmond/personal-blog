---
task_id: T06_S01
sprint_id: S01
status: open
priority: high
complexity: Simple
estimated_hours: 2-3
created: 2025-10-11T04:10:00Z
depends_on: [T01_S01]
---

# Task: Implement RSS Feed and Sitemap

## Description
Add standard blog infrastructure: RSS feed for content syndication and sitemap for search engine optimization. These are expected features for any professional blog and critical for content discovery and SEO.

## Goal / Objectives
- Create RSS 2.0 feed for blog posts
- Generate sitemap.xml for search engine crawling
- Enable content syndication via RSS readers
- Improve SEO and organic discovery

## Acceptance Criteria
- [ ] RSS feed accessible at `/api/feed.xml`
- [ ] RSS feed includes all blog posts with title, description, link, published date
- [ ] RSS feed validates against RSS 2.0 specification
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Sitemap includes all blog post URLs with lastmod and priority
- [ ] Sitemap validates against sitemap protocol
- [ ] RSS feed updates automatically when new posts added
- [ ] Sitemap regenerates on build

## Critical Context

### Current State (From Research)
- ❌ **No RSS feed** - Standard blog feature missing
- ❌ **No sitemap** - SEO infrastructure missing
- ✅ Blog posts stored in JSON file (easy to iterate for feed/sitemap)

### Why This Matters
**RSS Feed**:
- Standard expectation for blogs
- Enables content syndication via Feedly, Inoreader, etc.
- Low-friction way for readers to follow content
- Professional signal for personal blog

**Sitemap**:
- **Critical for SEO** - helps Google discover and index posts
- Improves organic search visibility
- Signals content freshness to search engines
- Faster indexing of new posts

## Technical Guidance

### Implementation 1: RSS Feed

**File**: `pages/api/feed.xml.ts` (NEW)

```typescript
// ABOUTME: RSS 2.0 feed for blog posts, enabling content syndication
// ABOUTME: Dynamically generates feed from blog-posts.json data

import { NextApiRequest, NextApiResponse } from 'next';
import posts from '../../data/blog-posts.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const siteUrl = 'https://yourdomain.com';
  const feedUrl = `${siteUrl}/api/feed.xml`;
  const buildDate = new Date().toUTCString();

  // Sort posts by date (newest first)
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Generate RSS 2.0 XML
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ben Redmond - AI Coding &amp; Product Building</title>
    <link>${siteUrl}</link>
    <description>Thoughts on building with frontier AI, coding techniques, and shipping real products. Monthly essays on AI-assisted development.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${sortedPosts.map(post => {
      const postUrl = `${siteUrl}/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>ben@koucai.chat (Ben Redmond)</author>
      <category>${escapeXml(post.category)}</category>
      ${post.tags?.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ') || ''}
    </item>`;
    }).join('\n')}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
  res.status(200).send(rss);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### Implementation 2: Sitemap

**File**: `pages/sitemap.xml.ts` (NEW)

```typescript
// ABOUTME: Sitemap generation for SEO and search engine crawling
// ABOUTME: Includes all blog posts with lastmod and priority metadata

import { NextApiRequest, NextApiResponse } from 'next';
import posts from '../data/blog-posts.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const siteUrl = 'https://yourdomain.com';

  // Sort posts by date for lastmod accuracy
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ${sortedPosts.map(post => {
    const postUrl = `${siteUrl}/${post.slug}`;
    const lastmod = new Date(post.date).toISOString();

    return `
  <url>
    <loc>${escapeXml(postUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.status(200).send(sitemap);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### Implementation 3: Add RSS Link to Blog Pages (Optional)

**File**: `pages/blog/index.jsx`

**Add to `<Head>` section**:
```jsx
<link
  rel="alternate"
  type="application/rss+xml"
  title="Ben Redmond - AI Coding & Product Building"
  href="https://yourdomain.com/api/feed.xml"
/>
```

**File**: `components/blog/BlogHeader.jsx` (if created in T02)

**Add RSS icon/link**:
```jsx
<nav>
  <Link href="/">Home</Link>
  <Link href="/blog">Blog</Link>
  <a href="/api/feed.xml" target="_blank" rel="noopener noreferrer">
    RSS
  </a>
  {/* other links */}
</nav>
```

## Testing Checklist

### RSS Feed Validation
- [ ] Visit locally: `http://localhost:3000/api/feed.xml`
- [ ] Verify XML is well-formed (no syntax errors)
- [ ] Check all blog posts appear in feed
- [ ] Verify: W3C Feed Validator - https://validator.w3.org/feed/
- [ ] Test in RSS reader (Feedly, Inoreader, NetNewsWire)
- [ ] Verify: Feed updates when blog-posts.json changes

### Sitemap Validation
- [ ] Visit locally: `http://localhost:3000/sitemap.xml`
- [ ] Verify XML is well-formed
- [ ] Check all blog post URLs included
- [ ] Verify lastmod dates are correct (ISO 8601 format)
- [ ] Validate: XML Sitemap Validator - https://www.xml-sitemaps.com/validate-xml-sitemap.html
- [ ] Test: Google Search Console (submit sitemap after deployment)

### Production Testing
- [ ] RSS feed accessible at: `https://yourdomain.com/api/feed.xml`
- [ ] Sitemap accessible at: `https://yourdomain.com/sitemap.xml`
- [ ] RSS link in `<head>` works
- [ ] Feed validates in production
- [ ] Sitemap validates in production

## Before Starting
- [ ] Review RSS 2.0 specification: https://www.rssboard.org/rss-specification
- [ ] Review sitemap protocol: https://www.sitemaps.org/protocol.html
- [ ] Ensure blog-posts.json has all required fields (date, title, excerpt, slug)
- [ ] Decide on author email format (ben@koucai.chat or generic)

## Common Gotchas
- **XML escaping required** - Must escape `&`, `<`, `>`, `"`, `'` in content
- **Date format matters** - RSS uses RFC-822, sitemap uses ISO 8601
- **URLs must be absolute** - No relative URLs (e.g., `/blog/post` won't work)
- **Cache headers** - Set appropriate caching to avoid excessive regeneration
- **TypeScript import** - blog-posts.json may need type assertion
- **File extension** - Must be `.xml.ts` not `.xml.js` for TypeScript

## Success Indicators
✅ RSS feed accessible at `/api/feed.xml`
✅ RSS feed validates against RSS 2.0 specification
✅ Feed includes all blog posts with correct metadata
✅ Feed displays correctly in RSS readers (Feedly, etc.)
✅ Sitemap accessible at `/sitemap.xml`
✅ Sitemap validates against sitemap protocol
✅ Sitemap includes all blog post URLs
✅ Google Search Console accepts sitemap
✅ RSS link in blog header works

## Optional Enhancements (Post-Launch)

### Enhanced Blog Analytics (1 hour)
If time permits, add PostHog event tracking:

**File**: `pages/blog/[slug].jsx`

```jsx
import { useAnalytics } from '../../lib/hooks/useAnalytics';

export default function BlogPost() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (post) {
      trackEvent('blog_post_viewed', {
        post_id: post.id,
        post_title: post.title,
        post_category: post.category,
        post_slug: post.slug,
        post_read_time: post.readTime
      });
    }
  }, [post]);

  // ... rest of component
}
```

**Benefits**:
- Track which posts are most popular
- Measure reading engagement
- Understand content performance

## Dependencies
- **Depends on**: T01_S01 (needs blog-posts.json with post data)
- **Parallel with**: T02_S01, T03_S01, T05_S01

## Related References
- Research: `.simone/research_personal_blog_validation.md` - Gap 2 analysis
- RSS 2.0 Specification: https://www.rssboard.org/rss-specification
- Sitemap Protocol: https://www.sitemaps.org/protocol.html
- W3C Feed Validator: https://validator.w3.org/feed/
- Google Search Console: https://search.google.com/search-console
