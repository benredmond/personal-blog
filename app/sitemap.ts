// ABOUTME: Sitemap generation using Next.js metadata API for SEO
// ABOUTME: Includes homepage and all blog posts with lastmod and priority metadata

import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { getSiteUrl } from '@/lib/metadata';

/**
 * Generate sitemap for search engines
 * Next.js automatically converts this to XML at /sitemap.xml
 *
 * @returns Array of URL entries with metadata
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const posts = getAllPosts();

  // Homepage entry
  const homepageEntry: MetadataRoute.Sitemap[number] = {
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  };

  // Blog post entries
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [homepageEntry, ...postEntries];
}
