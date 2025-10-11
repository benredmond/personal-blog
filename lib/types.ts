// ABOUTME: Shared TypeScript interfaces and Zod validation schemas for blog posts
// ABOUTME: Single source of truth for Post type across components, API routes, and lib functions

import { z } from 'zod';

/**
 * Blog post metadata (without full content)
 * Used for listing pages where content is not needed
 */
export interface BlogPostMeta {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // ISO 8601 format
  readTime: number; // Minutes as integer
  tags?: string[];
  coverImage?: string;
}

/**
 * Complete blog post with full markdown content
 * Used for detail pages and RSS feed
 */
export interface BlogPost extends BlogPostMeta {
  content: string; // Full markdown content
}

/**
 * API response for paginated blog listing
 */
export interface BlogListingResponse {
  posts: BlogPostMeta[];
  total: number;
}

/**
 * API response for single blog post
 */
export interface BlogPostResponse {
  post: BlogPost;
}

/**
 * Zod schema for runtime validation of blog posts
 * Catches malformed data from JSON file before it causes errors
 */
export const blogPostSchema = z.object({
  id: z.union([z.string(), z.number()]),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.string().min(1),
  author: z.string().min(1),
  date: z.string().datetime(),
  readTime: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().url().optional(),
});

/**
 * Type guard to check if object is a valid BlogPost
 */
export function isBlogPost(obj: unknown): obj is BlogPost {
  try {
    blogPostSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom error for blog data issues
 */
export class BlogDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlogDataError';
  }
}

/**
 * Normalize post to ensure consistent field names
 * Supports legacy field names (published_date, read_time) for compatibility
 */
export function normalizePost(post: Record<string, unknown>): BlogPost {
  return {
    id: post.id as string | number,
    slug: post.slug as string,
    title: post.title as string,
    excerpt: post.excerpt as string,
    content: post.content as string,
    category: post.category as string,
    author: post.author as string,
    date: (post.date || post.published_date) as string,
    readTime: (post.readTime || post.read_time) as number,
    tags: post.tags as string[] | undefined,
    coverImage: (post.coverImage || post.cover_image) as string | undefined,
  };
}
