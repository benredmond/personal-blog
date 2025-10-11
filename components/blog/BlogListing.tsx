// ABOUTME: Blog listing component with asymmetrical grid layout
// ABOUTME: Displays featured, secondary, and standard posts with Ma spacing

'use client'; // Uses useRouter for pagination

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import BlogPostCard from './BlogPostCard';
import styles from './BlogListing.module.css';

interface Post {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  published_date?: string;
  read_time?: string;
  author?: string;
}

interface BlogListingProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
}

const BlogListing: React.FC<BlogListingProps> = ({ posts, currentPage, totalPages }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle post click navigation
  const handlePostClick = (event: React.MouseEvent, slug: string) => {
    event.preventDefault();
    router.push(`/blog/${slug}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Split posts into featured, secondary, and standard
  const featuredPost = posts[0];
  const secondaryPost = posts[1];
  const standardPosts = posts.slice(2);

  return (
    <div className={styles.container}>
      {/* Featured post - columns 1-7 */}
      {featuredPost && (
        <div className={styles.featured}>
          <BlogPostCard
            post={featuredPost}
            variant="featured"
            onClick={handlePostClick}
            style={{ '--stagger-index': 0 } as React.CSSProperties}
          />
        </div>
      )}

      {/* Ma channel - column 8 (empty space) */}
      <div className={`${styles.maChannel} maChannel`} aria-hidden="true" />

      {/* Secondary post - columns 9-12 */}
      {secondaryPost && (
        <div className={styles.secondary}>
          <BlogPostCard
            post={secondaryPost}
            variant="secondary"
            onClick={handlePostClick}
            style={{ '--stagger-index': 1 } as React.CSSProperties}
          />
        </div>
      )}

      {/* Standard posts grid - full width below */}
      {standardPosts.length > 0 && (
        <div className={styles.standardRow}>
          {standardPosts.map((post, index) => (
            <BlogPostCard
              key={post.id}
              post={post}
              variant="standard"
              onClick={handlePostClick}
              style={{ '--stagger-index': index + 2 } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.paginationButton}
          aria-label="Previous"
        >
          Previous
        </button>

        <span className={styles.paginationInfo}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
          aria-label="Next"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogListing;
