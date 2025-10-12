// ABOUTME: RSS 2.0 feed generation for blog content syndication
// ABOUTME: Dynamically generates feed from blog posts with proper XML escaping

import { getAllPosts } from '@/lib/blog';
import { getSiteUrl, escapeXml } from '@/lib/metadata';

/**
 * Generate RSS 2.0 feed for blog posts
 * Accessible at /feed.xml
 *
 * @returns Response with RSS XML and appropriate headers
 */
export async function GET() {
  const siteUrl = getSiteUrl();
  const feedUrl = `${siteUrl}/feed.xml`;
  const posts = getAllPosts();
  const buildDate = new Date().toUTCString();

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
    ${posts
      .map((post) => {
        const postUrl = `${siteUrl}/blog/${post.slug}`;
        const pubDate = new Date(post.date).toUTCString();

        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>ben@koucai.chat (Ben Redmond)</author>
      <category>${escapeXml(post.category)}</category>${
        post.tags
          ? post.tags.map((tag) => `\n      <category>${escapeXml(tag)}</category>`).join('')
          : ''
      }
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
