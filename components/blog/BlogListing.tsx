// ABOUTME: Blog listing component using Scandinavian Strata design
// ABOUTME: Vertical stacking with generous Ma spacing, no grid complexity

'use client'; // Uses useRouter for pagination

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import BlogPostCard from './BlogPostCard';

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

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="col-span-12 md:col-span-8 md:col-start-3">
      {/* All posts in simple vertical stack */}
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--ma-5)',
            paddingTop: 'var(--ma-3)',
            borderTop: '1px solid var(--color-light-gray)',
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '12px 24px',
              border: '2px solid var(--color-warm-gray)',
              background: 'transparent',
              color: 'var(--color-warm-gray)',
              fontWeight: 600,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.4 : 1,
              transition: 'opacity 200ms',
            }}
            aria-label="Previous page"
          >
            ← Previous
          </button>

          <span
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              fontVariant: 'small-caps',
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '12px 24px',
              border: '2px solid var(--color-warm-gray)',
              background: 'transparent',
              color: 'var(--color-warm-gray)',
              fontWeight: 600,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.4 : 1,
              transition: 'opacity 200ms',
            }}
            aria-label="Next page"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
};

export default BlogListing;
