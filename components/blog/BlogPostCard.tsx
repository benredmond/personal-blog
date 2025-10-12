// ABOUTME: BlogPostCard component using Scandinavian Strata design system
// ABOUTME: Pure whitespace separation, typography-first, vermilion underlines

import React, { memo } from 'react';
import Link from 'next/link';
import styles from './StrataPost.module.css';

export interface Post {
  id: string | number;
  title: string;
  excerpt?: string;
  category?: string;
  date?: string;
  published_date?: string; // Support both date formats
  readTime?: string;
  read_time?: string; // Support both formats
  slug: string;
}

export interface BlogPostCardProps {
  post: Post;
  className?: string;
}

/**
 * BlogPostCard - Scandinavian Strata design
 *
 * Minimalist blog post card with:
 * - No borders, pure Ma spacing for separation
 * - Vermilion underline under title
 * - Typography as primary architectural element
 * - Settle-in animation (sedimentary, not constructional)
 */
export const BlogPostCard = memo(function BlogPostCard({ post, className }: BlogPostCardProps) {
  // Validate required post data
  if (!post) {
    console.warn('BlogPostCard: post prop is required');
    return null;
  }

  const { title, excerpt, category, slug } = post;
  const date = post.date || post.published_date;
  const readTime = post.readTime || post.read_time;

  // Format date for display (use same logic as detail page for consistency)
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <article className={`${styles.post} ${className || ''}`}>
      {/* Metadata */}
      <div className={styles.metadata}>
        {category && <span className={styles.category}>{category}</span>}
        {formattedDate && (
          <time className={styles.date} dateTime={date}>
            {formattedDate}
          </time>
        )}
        {readTime && <span className={styles.readTime}>{readTime} min read</span>}
      </div>

      {/* Title with vermilion underline */}
      <h2 className={styles.title}>
        <Link href={`/blog/${slug}`}>{title}</Link>
      </h2>

      {/* Excerpt */}
      {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

      {/* Continue reading link */}
      <Link href={`/blog/${slug}`} className={styles.continueReading}>
        Continue Reading
      </Link>
    </article>
  );
});

// Display name for debugging
BlogPostCard.displayName = 'BlogPostCard';

export default BlogPostCard;
