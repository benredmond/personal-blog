// ABOUTME: Blog listing page using App Router Server Components
// ABOUTME: Fetches blog posts server-side and passes to Client Component for rendering

import type { Metadata } from 'next';
import MasterGrid from '@/components/layout/MasterGrid';
import BlogListing from '@/components/blog/BlogListing';
import EmptyState from '@/components/blog/EmptyState';

export const metadata: Metadata = {
  title: 'Blog | Ben Redmond',
  description: 'Thoughts on AI, product development, and software engineering',
};

const POSTS_PER_PAGE = 12;

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Next.js 15: searchParams is a Promise, must await
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);

  try {
    // Server-side data fetching
    const response = await fetch(
      `http://localhost:3000/api/blog/posts?page=${currentPage}&limit=${POSTS_PER_PAGE}`,
      {
        cache: 'no-store', // Next.js 15 default, but explicit is better
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const postsArray = Array.isArray(data?.posts) ? data.posts : [];
    const totalPages = Math.ceil((data?.total || 0) / POSTS_PER_PAGE) || 1;

    return (
      <MasterGrid>
        {postsArray.length === 0 ? (
          <EmptyState
            message="No blog posts yet"
            action={{ text: 'Check back soon', href: '/' }}
          />
        ) : (
          <BlogListing
            posts={postsArray}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </MasterGrid>
    );
  } catch (error) {
    // Error will be caught by error.tsx boundary
    throw error;
  }
}
