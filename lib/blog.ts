// ABOUTME: Blog data access layer (repository pattern)
// ABOUTME: Pure functions for fetching, filtering, and validating blog posts from JSON storage

import postsData from '@/data/blog-posts.json';
import {
  BlogPost,
  BlogPostMeta,
  BlogListingResponse,
  blogPostSchema,
  BlogDataError,
  normalizePost,
} from './types';

/**
 * Load and validate all blog posts from JSON file
 * Throws BlogDataError if any post is invalid
 */
function loadPosts(): BlogPost[] {
  try {
    // Normalize and validate all posts
    const posts = postsData.map((post, index) => {
      try {
        const normalized = normalizePost(post);
        blogPostSchema.parse(normalized);
        return normalized as BlogPost;
      } catch (error) {
        const postIdentifier = post.title || post.slug || post.id || `index ${index}`;
        throw new BlogDataError(
          `Invalid post "${postIdentifier}": ${error instanceof Error ? error.message : 'Unknown validation error'}`
        );
      }
    });

    // Check for duplicate IDs
    const ids = new Set<string | number>();
    posts.forEach((post) => {
      if (ids.has(post.id)) {
        throw new BlogDataError(`Duplicate post ID: ${post.id}`);
      }
      ids.add(post.id);
    });

    // Check for duplicate slugs
    const slugs = new Set<string>();
    posts.forEach((post) => {
      if (slugs.has(post.slug)) {
        throw new BlogDataError(`Duplicate post slug: ${post.slug}`);
      }
      slugs.add(post.slug);
    });

    return posts;
  } catch (error) {
    if (error instanceof BlogDataError) {
      throw error;
    }
    throw new BlogDataError(`Failed to load blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all posts sorted by date (newest first)
 * Used internally and for RSS feed generation
 */
export function getAllPosts(): BlogPost[] {
  const posts = loadPosts();
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get paginated blog posts (without full content for performance)
 *
 * @param page - Page number (1-indexed)
 * @param limit - Number of posts per page (1-100)
 * @returns Paginated posts and total count
 * @throws BlogDataError if page/limit parameters are invalid
 */
export function getBlogPosts(page: number = 1, limit: number = 12): BlogListingResponse {
  // Validate pagination parameters
  if (!Number.isInteger(page) || page < 1 || page > 10000) {
    throw new BlogDataError('Page must be an integer between 1 and 10000');
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new BlogDataError('Limit must be an integer between 1 and 100');
  }

  const allPosts = getAllPosts();
  const total = allPosts.length;

  // Calculate pagination
  const start = (page - 1) * limit;
  const end = start + limit;

  // Check if page exceeds total pages (but allow empty first page)
  const totalPages = Math.ceil(total / limit) || 1;
  if (page > totalPages && total > 0) {
    throw new BlogDataError(`Page ${page} exceeds total pages (${totalPages})`);
  }

  const paginatedPosts = allPosts.slice(start, end);

  // Exclude content field for performance (listing doesn't need full markdown)
  const postsWithoutContent: BlogPostMeta[] = paginatedPosts.map(({ content: _content, ...meta }) => meta);

  return {
    posts: postsWithoutContent,
    total,
  };
}

/**
 * Get a single blog post by slug
 *
 * @param slug - URL-safe post identifier
 * @returns Blog post with full content, or null if not found
 */
export function getPostBySlug(slug: string): BlogPost | null {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  const allPosts = getAllPosts();
  const post = allPosts.find((p) => p.slug === slug);

  return post || null;
}

/**
 * Get total number of blog posts
 * Useful for generating sitemaps
 */
export function getPostCount(): number {
  return loadPosts().length;
}

/**
 * Get all unique categories
 * Useful for category pages or filters
 */
export function getCategories(): string[] {
  const posts = loadPosts();
  const categories = new Set(posts.map((p) => p.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags
 * Useful for tag pages or filters
 */
export function getTags(): string[] {
  const posts = loadPosts();
  const tags = new Set(posts.flatMap((p) => p.tags || []));
  return Array.from(tags).sort();
}
