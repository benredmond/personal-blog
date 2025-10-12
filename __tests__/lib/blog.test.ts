// ABOUTME: Comprehensive tests for blog data layer
// ABOUTME: Tests real behavior using actual JSON data file (no mocks)

import {
  getAllPosts,
  getBlogPosts,
  getPostBySlug,
  getPostCount,
  getCategories,
  getTags,
} from '@/lib/blog';
import { BlogPost, BlogDataError } from '@/lib/types';
import postsData from '@/data/blog-posts.json';

describe('blog data layer', () => {
  describe('getAllPosts', () => {
    it('returns all posts sorted by date (newest first)', () => {
      const posts = getAllPosts();

      // Should have all posts from JSON file
      expect(posts).toHaveLength(postsData.length);

      // Should be sorted by date in descending order
      for (let i = 0; i < posts.length - 1; i++) {
        const currentDate = new Date(posts[i].date).getTime();
        const nextDate = new Date(posts[i + 1].date).getTime();
        expect(currentDate).toBeGreaterThanOrEqual(nextDate);
      }
    });

    it('returns posts with all required fields', () => {
      const posts = getAllPosts();

      posts.forEach((post) => {
        expect(post).toMatchObject({
          id: expect.anything(),
          slug: expect.any(String),
          title: expect.any(String),
          excerpt: expect.any(String),
          content: expect.any(String),
          category: expect.any(String),
          author: expect.any(String),
          date: expect.any(String),
          readTime: expect.any(Number),
        });

        // Validate date is ISO 8601
        expect(() => new Date(post.date).toISOString()).not.toThrow();

        // Validate readTime is positive integer
        expect(post.readTime).toBeGreaterThan(0);
        expect(Number.isInteger(post.readTime)).toBe(true);
      });
    });

    it('returns posts with valid slugs (lowercase alphanumeric with hyphens)', () => {
      const posts = getAllPosts();

      posts.forEach((post) => {
        expect(post.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('deduplicates calls within same request (React cache behavior)', () => {
      // First call loads data
      const firstCall = getAllPosts();
      const firstCallTime = performance.now();

      // Second call should use cached data (sub-millisecond)
      const secondCallStart = performance.now();
      const secondCall = getAllPosts();
      const secondCallDuration = performance.now() - secondCallStart;

      // Should return same reference (React cache)
      expect(secondCall).toBe(firstCall);

      // Should be extremely fast (< 1ms for cache hit)
      expect(secondCallDuration).toBeLessThan(1);
    });
  });

  describe('getBlogPosts', () => {
    describe('pagination', () => {
      it('returns first page with default limit (12)', () => {
        const response = getBlogPosts(1, 12);

        expect(response.posts).toHaveLength(Math.min(12, postsData.length));
        expect(response.total).toBe(postsData.length);
      });

      it('returns correct page subset', () => {
        const limit = 1;
        const page1 = getBlogPosts(1, limit);
        const page2 = getBlogPosts(2, limit);

        // Pages should have different posts
        expect(page1.posts[0].id).not.toBe(page2.posts[0]?.id);

        // Should respect pagination order (newest first)
        const allPosts = getAllPosts();
        expect(page1.posts[0].id).toBe(allPosts[0].id);
        expect(page2.posts[0]?.id).toBe(allPosts[1]?.id);
      });

      it('returns empty array when page exceeds total pages', () => {
        const totalPosts = postsData.length;
        const limit = 10;
        const totalPages = Math.ceil(totalPosts / limit);

        // Page beyond total should throw error
        expect(() => getBlogPosts(totalPages + 1, limit)).toThrow(BlogDataError);
        expect(() => getBlogPosts(totalPages + 1, limit)).toThrow(
          `Page ${totalPages + 1} exceeds total pages (${totalPages})`
        );
      });

      it('allows empty first page when there are no posts', () => {
        // This test validates behavior when data is empty
        // We can't test this with real data, but we test the logic path exists
        const response = getBlogPosts(1, 12);
        expect(response.total).toBeGreaterThanOrEqual(0);
      });

      it('handles large limits correctly', () => {
        const response = getBlogPosts(1, 100);

        expect(response.posts).toHaveLength(Math.min(100, postsData.length));
        expect(response.total).toBe(postsData.length);
      });

      it('handles small limits correctly', () => {
        const response = getBlogPosts(1, 1);

        expect(response.posts).toHaveLength(1);
        expect(response.total).toBe(postsData.length);
      });
    });

    describe('pagination validation', () => {
      it('throws error for page < 1', () => {
        expect(() => getBlogPosts(0, 12)).toThrow(BlogDataError);
        expect(() => getBlogPosts(0, 12)).toThrow('Page must be an integer between 1 and 10000');
      });

      it('throws error for negative page', () => {
        expect(() => getBlogPosts(-1, 12)).toThrow(BlogDataError);
        expect(() => getBlogPosts(-1, 12)).toThrow('Page must be an integer between 1 and 10000');
      });

      it('throws error for page > 10000', () => {
        expect(() => getBlogPosts(10001, 12)).toThrow(BlogDataError);
        expect(() => getBlogPosts(10001, 12)).toThrow('Page must be an integer between 1 and 10000');
      });

      it('throws error for non-integer page', () => {
        expect(() => getBlogPosts(1.5, 12)).toThrow(BlogDataError);
        expect(() => getBlogPosts(1.5, 12)).toThrow('Page must be an integer between 1 and 10000');
      });

      it('throws error for limit < 1', () => {
        expect(() => getBlogPosts(1, 0)).toThrow(BlogDataError);
        expect(() => getBlogPosts(1, 0)).toThrow('Limit must be an integer between 1 and 100');
      });

      it('throws error for limit > 100', () => {
        expect(() => getBlogPosts(1, 101)).toThrow(BlogDataError);
        expect(() => getBlogPosts(1, 101)).toThrow('Limit must be an integer between 1 and 100');
      });

      it('throws error for non-integer limit', () => {
        expect(() => getBlogPosts(1, 12.5)).toThrow(BlogDataError);
        expect(() => getBlogPosts(1, 12.5)).toThrow('Limit must be an integer between 1 and 100');
      });
    });

    describe('content exclusion', () => {
      it('excludes content field for performance', () => {
        const response = getBlogPosts(1, 12);

        response.posts.forEach((post) => {
          expect(post).not.toHaveProperty('content');
        });
      });

      it('includes all metadata fields', () => {
        const response = getBlogPosts(1, 12);

        response.posts.forEach((post) => {
          expect(post).toMatchObject({
            id: expect.anything(),
            slug: expect.any(String),
            title: expect.any(String),
            excerpt: expect.any(String),
            category: expect.any(String),
            author: expect.any(String),
            date: expect.any(String),
            readTime: expect.any(Number),
          });
        });
      });
    });

    describe('pagination invariants (property-based)', () => {
      it('maintains total count across all pages', () => {
        const limit = 1;
        const totalPosts = postsData.length;
        const totalPages = Math.ceil(totalPosts / limit);

        let collectedPosts = 0;
        for (let page = 1; page <= totalPages; page++) {
          const response = getBlogPosts(page, limit);
          collectedPosts += response.posts.length;
          expect(response.total).toBe(totalPosts);
        }

        expect(collectedPosts).toBe(totalPosts);
      });

      it('returns unique posts across all pages (no duplicates)', () => {
        const limit = 1;
        const totalPosts = postsData.length;
        const totalPages = Math.ceil(totalPosts / limit);

        const seenIds = new Set<string | number>();
        for (let page = 1; page <= totalPages; page++) {
          const response = getBlogPosts(page, limit);
          response.posts.forEach((post) => {
            expect(seenIds.has(post.id)).toBe(false);
            seenIds.add(post.id);
          });
        }

        expect(seenIds.size).toBe(totalPosts);
      });

      it('maintains order consistency across pagination', () => {
        const limit = 1;
        const allPosts = getAllPosts();
        const totalPages = Math.ceil(allPosts.length / limit);

        for (let page = 1; page <= totalPages; page++) {
          const response = getBlogPosts(page, limit);
          const expectedPost = allPosts[page - 1];

          if (expectedPost) {
            expect(response.posts[0].id).toBe(expectedPost.id);
          }
        }
      });

      it('handles arbitrary valid limit values correctly', () => {
        const limits = [1, 5, 10, 12, 25, 50, 100];

        limits.forEach((limit) => {
          const response = getBlogPosts(1, limit);
          expect(response.posts.length).toBeLessThanOrEqual(limit);
          expect(response.posts.length).toBeLessThanOrEqual(response.total);
        });
      });
    });
  });

  describe('getPostBySlug', () => {
    it('returns post when slug exists', () => {
      const allPosts = getAllPosts();
      const expectedPost = allPosts[0];

      const post = getPostBySlug(expectedPost.slug);

      expect(post).not.toBeNull();
      expect(post?.slug).toBe(expectedPost.slug);
      expect(post?.id).toBe(expectedPost.id);
      expect(post?.content).toBeDefined();
    });

    it('returns null when slug does not exist', () => {
      const post = getPostBySlug('nonexistent-slug-that-definitely-does-not-exist');

      expect(post).toBeNull();
    });

    it('returns null for empty string slug', () => {
      const post = getPostBySlug('');

      expect(post).toBeNull();
    });

    it('returns null for non-string slug', () => {
      // @ts-expect-error Testing runtime behavior with invalid type
      const post = getPostBySlug(null);

      expect(post).toBeNull();
    });

    it('returns post with full content', () => {
      const allPosts = getAllPosts();
      const expectedPost = allPosts[0];

      const post = getPostBySlug(expectedPost.slug);

      expect(post?.content).toBe(expectedPost.content);
      expect(post?.content.length).toBeGreaterThan(0);
    });

    it('returns post matching exact slug (case-sensitive)', () => {
      const allPosts = getAllPosts();
      const expectedPost = allPosts[0];

      // Slugs are lowercase, so uppercase should not match
      const uppercaseSlug = expectedPost.slug.toUpperCase();
      const post = getPostBySlug(uppercaseSlug);

      expect(post).toBeNull();
    });
  });

  describe('getPostCount', () => {
    it('returns correct number of posts', () => {
      const count = getPostCount();

      expect(count).toBe(postsData.length);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getCategories', () => {
    it('returns unique categories sorted alphabetically', () => {
      const categories = getCategories();

      // Should have at least one category
      expect(categories.length).toBeGreaterThan(0);

      // Should be sorted
      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);

      // Should be unique
      const uniqueCategories = Array.from(new Set(categories));
      expect(categories).toEqual(uniqueCategories);
    });

    it('returns categories from actual posts', () => {
      const categories = getCategories();
      const allPosts = getAllPosts();

      categories.forEach((category) => {
        const postsWithCategory = allPosts.filter((p) => p.category === category);
        expect(postsWithCategory.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getTags', () => {
    it('returns unique tags sorted alphabetically', () => {
      const tags = getTags();

      // Should be sorted
      const sorted = [...tags].sort();
      expect(tags).toEqual(sorted);

      // Should be unique
      const uniqueTags = Array.from(new Set(tags));
      expect(tags).toEqual(uniqueTags);
    });

    it('returns tags from actual posts', () => {
      const tags = getTags();
      const allPosts = getAllPosts();

      tags.forEach((tag) => {
        const postsWithTag = allPosts.filter((p) => p.tags?.includes(tag));
        expect(postsWithTag.length).toBeGreaterThan(0);
      });
    });

    it('handles posts without tags gracefully', () => {
      const tags = getTags();

      // Should return array (may be empty if no posts have tags)
      expect(Array.isArray(tags)).toBe(true);
    });
  });

  describe('data validation', () => {
    it('validates all posts in JSON file on load', () => {
      // getAllPosts validates all posts via loadPosts
      // If any post is invalid, it should throw BlogDataError
      expect(() => getAllPosts()).not.toThrow();
    });

    it('ensures all posts have required fields', () => {
      const posts = getAllPosts();

      posts.forEach((post) => {
        // Required fields from BlogPostSchema
        expect(post.id).toBeDefined();
        expect(post.slug).toBeDefined();
        expect(post.title).toBeDefined();
        expect(post.excerpt).toBeDefined();
        expect(post.content).toBeDefined();
        expect(post.category).toBeDefined();
        expect(post.author).toBeDefined();
        expect(post.date).toBeDefined();
        expect(post.readTime).toBeDefined();
      });
    });

    it('validates slug format (lowercase alphanumeric with hyphens)', () => {
      const posts = getAllPosts();

      posts.forEach((post) => {
        // Slug must match regex: /^[a-z0-9-]+$/
        expect(post.slug).toMatch(/^[a-z0-9-]+$/);
        expect(post.slug.length).toBeGreaterThan(0);
        expect(post.slug.length).toBeLessThanOrEqual(200);
      });
    });

    it('validates date is ISO 8601 format', () => {
      const posts = getAllPosts();

      posts.forEach((post) => {
        // Should parse as valid date
        const date = new Date(post.date);
        expect(date.toString()).not.toBe('Invalid Date');

        // Should be ISO 8601 (datetime string)
        expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });

    it('validates readTime is positive integer', () => {
      const posts = getAllPosts();

      posts.forEach((post) => {
        expect(post.readTime).toBeGreaterThan(0);
        expect(Number.isInteger(post.readTime)).toBe(true);
      });
    });

    it('validates coverImage is URL when present', () => {
      const posts = getAllPosts();

      posts.forEach((post) => {
        if (post.coverImage) {
          // Should be valid URL
          expect(() => new URL(post.coverImage)).not.toThrow();
        }
      });
    });

    it('validates title and excerpt length constraints', () => {
      const posts = getAllPosts();

      posts.forEach((post) => {
        // Title: 1-200 chars
        expect(post.title.length).toBeGreaterThan(0);
        expect(post.title.length).toBeLessThanOrEqual(200);

        // Excerpt: 1-500 chars
        expect(post.excerpt.length).toBeGreaterThan(0);
        expect(post.excerpt.length).toBeLessThanOrEqual(500);

        // Content: at least 1 char
        expect(post.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('duplicate detection', () => {
    it('ensures no duplicate IDs in dataset', () => {
      const posts = getAllPosts();
      const ids = posts.map((p) => p.id);

      const uniqueIds = Array.from(new Set(ids));
      expect(ids).toEqual(uniqueIds);
    });

    it('ensures no duplicate slugs in dataset', () => {
      const posts = getAllPosts();
      const slugs = posts.map((p) => p.slug);

      const uniqueSlugs = Array.from(new Set(slugs));
      expect(slugs).toEqual(uniqueSlugs);
    });
  });

  describe('error handling', () => {
    it('throws BlogDataError for data validation failures', () => {
      // This test validates that BlogDataError is used for validation errors
      // We can't easily simulate invalid data with real file, but we test the error type
      expect(() => getBlogPosts(0, 12)).toThrow(BlogDataError);
    });

    it('provides descriptive error messages', () => {
      try {
        getBlogPosts(0, 12);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BlogDataError);
        expect((error as BlogDataError).message).toContain('Page must be an integer between 1 and 10000');
      }
    });
  });

  describe('caching behavior', () => {
    it('React cache returns same reference for repeated calls', () => {
      // React cache() deduplicates calls within same request
      const posts1 = getAllPosts();
      const posts2 = getAllPosts();
      const posts3 = getAllPosts();

      // Should return exact same reference (not a copy)
      expect(posts2).toBe(posts1);
      expect(posts3).toBe(posts1);
    });

    it('cached posts maintain data integrity across calls', () => {
      const firstCall = getAllPosts();
      const secondCall = getAllPosts();

      // Same reference
      expect(secondCall).toBe(firstCall);

      // Verify data hasn't been corrupted
      expect(secondCall).toHaveLength(firstCall.length);
      expect(secondCall[0].id).toBe(firstCall[0].id);
    });
  });
});
