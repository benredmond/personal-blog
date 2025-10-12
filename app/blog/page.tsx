// ABOUTME: Blog listing page using App Router Server Components
// ABOUTME: Uses lib/blog.ts for direct data access (Next.js 15 best practice)

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import MasterGrid from '@/components/layout/MasterGrid';
import BlogListing from '@/components/blog/BlogListing';
import BlogHeader from '@/components/blog/BlogHeader';
import EmptyState from '@/components/blog/EmptyState';
import { getBlogPosts } from '@/lib/blog';
import { BlogDataError } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Ben Redmond - AI Coding & Product Building',
  description:
    'Thoughts on building with frontier AI, coding techniques, and shipping real products.',
};

// Enable ISR: Revalidate every 1 hour for cost-effective caching
// Personal blog with infrequent updates benefits from longer cache (92% cost reduction vs 5-minute cache)
export const revalidate = 3600;

// NOTE: This page remains dynamic (ƒ) in build output due to searchParams pagination.
// ISR provides server-side caching (1-hour cache) but not CDN-level static generation.
// Alternative approaches (route segments like /blog/page/2, client-side pagination)
// involve UX trade-offs - preserving clean URLs (/blog?page=2) takes priority.
// Performance: Detail pages (/blog/[slug]) are fully static with 10-50x TTFB improvement.

const POSTS_PER_PAGE = 12;

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Next.js 15: searchParams is a Promise, must await
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);

  // Validate page number before fetching
  if (isNaN(currentPage) || currentPage < 1) {
    redirect('/blog?page=1');
  }

  try {
    // Direct data access (no HTTP overhead)
    const data = getBlogPosts(currentPage, POSTS_PER_PAGE);
    const totalPages = Math.ceil(data.total / POSTS_PER_PAGE) || 1;

    // Redirect if page exceeds total pages (but allow empty first page)
    if (currentPage > totalPages && data.total > 0) {
      redirect(`/blog?page=${totalPages}`);
    }

    return (
      <>
        <BlogHeader />
        <MasterGrid>
          {data.posts.length === 0 && currentPage === 1 ? (
            <EmptyState message="More posts coming soon" />
          ) : (
            <BlogListing
              posts={data.posts}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </MasterGrid>
      </>
    );
  } catch (error) {
    // Convert BlogDataError to more user-friendly error
    if (error instanceof BlogDataError) {
      throw new Error(`Blog data issue: ${error.message}`);
    }
    throw error;
  }
}
