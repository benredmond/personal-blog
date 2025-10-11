// ABOUTME: BlogPostCard component implementing L-Frame architectural construct for blog content
// ABOUTME: Uses vermilion borders to differentiate from chat messages while maintaining Neo-Bauhaus principles

import React, { memo, useCallback, useRef } from 'react';
import classNames from 'classnames';
import styles from './BlogPostCard.module.css';

/**
 * Blog post variant types
 * Following [PAT:ARCH:L_FRAME_CONSTRUCT] architectural pattern
 */
export const BLOG_VARIANTS = {
  STANDARD: 'standard',
  FEATURED: 'featured',
  SECONDARY: 'secondary',
} as const;

export type BlogVariant = (typeof BLOG_VARIANTS)[keyof typeof BLOG_VARIANTS];

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
  variant?: BlogVariant;
  className?: string;
  onClick?: (_event: React.MouseEvent, _slug: string) => void;
  animate?: boolean;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
}

/**
 * BlogPostCard - L-Frame architectural construct for blog posts
 *
 * Extends the Neo-Bauhaus L-Frame system with vermilion borders
 * to create a distinct visual identity for blog content while
 * maintaining architectural consistency.
 */
export const BlogPostCard = memo(function BlogPostCard({
  post,
  variant = BLOG_VARIANTS.STANDARD,
  className,
  onClick,
  animate = false,
  onAnimationComplete,
  style,
  ...props
}: BlogPostCardProps) {
  // Track animation count to identify the content animation (third in sequence)
  const animationCountRef = useRef(0);

  // Handle animation completion - hooks must be before any returns
  const handleAnimationEnd = useCallback(() => {
    if (!animate || !onAnimationComplete) return;

    animationCountRef.current += 1;

    // The content animation is the third one (after top and left borders)
    if (animationCountRef.current === 3) {
      onAnimationComplete();
      animationCountRef.current = 0; // Reset for potential re-animations
    }
  }, [animate, onAnimationComplete]);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (onClick && post?.slug) {
        onClick(event, post.slug);
      }
    },
    [onClick, post?.slug]
  );

  // Keyboard navigation support
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick(event as unknown as React.MouseEvent);
      }
    },
    [handleClick]
  );

  // Validate required post data
  if (!post) {
    console.warn('BlogPostCard: post prop is required');
    return null;
  }

  const { title, excerpt, category } = post;
  const date = post.date || post.published_date;
  const readTime = post.readTime || post.read_time;

  // Format date for display
  const formattedDate = date
    ? (() => {
        const d = new Date(date);
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
      })()
    : '';

  // Determine if category is learning-related for matcha color
  const isLearningCategory = category && /learn|study|lesson|tutorial|guide/i.test(category);

  const articleClasses = classNames(
    styles.blogPostCard,
    styles[`blogPostCard--${variant}`],
    {
      [styles['blogPostCard--animate']]: animate,
    },
    className
  );

  return (
    <article
      className={articleClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onAnimationEnd={handleAnimationEnd}
      role="button"
      tabIndex={0}
      aria-label={`Read article: ${title}`}
      style={style}
      {...props}
    >
      {/* L-Frame borders */}
      <div
        className={classNames(styles.lFrameBorder, styles.lFrameBorderTop, {
          [styles.animate]: animate,
        })}
        aria-hidden="true"
      />
      <div
        className={classNames(styles.lFrameBorder, styles.lFrameBorderLeft, {
          [styles.animate]: animate,
        })}
        aria-hidden="true"
      />

      {/* Content container */}
      <div
        className={classNames(styles.contentContainer, {
          [styles.animate]: animate,
        })}
      >
        {/* Meta information */}
        <div className={styles.metaContainer}>
          {category && (
            <span
              className={classNames(styles.category, {
                [styles['category--learning']]: isLearningCategory,
              })}
            >
              {category}
            </span>
          )}
          {formattedDate && (
            <time className={styles.date} dateTime={date}>
              {formattedDate}
            </time>
          )}
        </div>

        {/* Main content */}
        <h2 className={styles.title}>{title}</h2>
        {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

        {/* Read time */}
        {readTime && <span className={styles.readTime}>{readTime} min read</span>}
      </div>
    </article>
  );
});

// Display name for debugging
BlogPostCard.displayName = 'BlogPostCard';

export default BlogPostCard;
