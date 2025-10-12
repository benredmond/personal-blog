// ABOUTME: Metadata utility functions for OpenGraph and Twitter Card generation
// ABOUTME: Centralized logic for URL construction, image fallbacks, and metadata objects

import type { Metadata } from 'next';
import type { BlogPost } from './types';

/**
 * Get the base site URL with environment variable fallback hierarchy
 * Priority: NEXT_PUBLIC_SITE_URL → VERCEL_URL → localhost (dev only)
 */
export function getSiteUrl(): string {
  // Explicit site URL (set in Vercel dashboard or .env.local)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Vercel auto-generated URL (available in preview and production deployments)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development fallback
  return 'http://localhost:3000';
}

/**
 * Get OpenGraph image URL with fallback to default
 * Returns post's cover image if present, otherwise fallback to og-default.jpg
 */
export function getOgImage(post?: { coverImage?: string }): string {
  return post?.coverImage || '/images/og-default.jpg';
}

/**
 * Generate complete metadata object for blog post pages
 * Includes OpenGraph, Twitter Card, and canonical URL
 */
export function getBlogPostMetadata(post: BlogPost): Metadata {
  const ogImage = getOgImage(post);

  return {
    title: `${post.title} | Ben Redmond`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.date,
      authors: [post.author],
      siteName: 'Ben Redmond',
      ...(post.tags && post.tags.length > 0 && { tags: post.tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

/**
 * Generate metadata for blog listing page
 */
export function getBlogListingMetadata(): Metadata {
  return {
    title: 'Ben Redmond - AI Coding & Product Building',
    description:
      'Thoughts on building with frontier AI, coding techniques, and shipping real products.',
    openGraph: {
      title: 'Ben Redmond - AI Coding & Product Building',
      description:
        'Thoughts on building with frontier AI, coding techniques, and shipping real products.',
      type: 'website',
      url: '/blog',
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'Ben Redmond - AI Coding & Product Building',
        },
      ],
      siteName: 'Ben Redmond',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Ben Redmond - AI Coding & Product Building',
      description:
        'Thoughts on building with frontier AI, coding techniques, and shipping real products.',
      images: ['/images/og-default.jpg'],
    },
    alternates: {
      canonical: '/blog',
    },
  };
}
