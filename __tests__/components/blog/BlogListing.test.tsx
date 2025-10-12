// ABOUTME: Tests for BlogListing component with Scandinavian Strata design
// ABOUTME: Verifies vertical stacking, pagination, and App Router integration

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlogListing from '@/components/blog/BlogListing';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Mock next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock BlogPostCard
jest.mock('@/components/blog/BlogPostCard', () => {
  return function MockBlogPostCard({ post }: { post: any }) {
    return (
      <div data-testid={`post-${post.id}`} className="blog-post-card">
        <h2>{post.title}</h2>
      </div>
    );
  };
});

const mockPosts = [
  { id: 1, title: 'First Post', slug: 'first-post' },
  { id: 2, title: 'Second Post', slug: 'second-post' },
  { id: 3, title: 'Third Post', slug: 'third-post' },
  { id: 4, title: 'Fourth Post', slug: 'fourth-post' },
  { id: 5, title: 'Fifth Post', slug: 'fifth-post' },
];

describe('BlogListing', () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUsePathname = usePathname as jest.Mock;
  const mockUseSearchParams = useSearchParams as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/blog');
    mockUseSearchParams.mockReturnValue(new URLSearchParams('page=1'));
  });

  describe('Rendering', () => {
    it('renders all posts in vertical stack', () => {
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      expect(screen.getByTestId('post-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-2')).toBeInTheDocument();
      expect(screen.getByTestId('post-3')).toBeInTheDocument();
      expect(screen.getByTestId('post-4')).toBeInTheDocument();
      expect(screen.getByTestId('post-5')).toBeInTheDocument();
    });

    it('renders post titles', () => {
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('Third Post')).toBeInTheDocument();
    });

    it('renders empty when no posts provided', () => {
      const { container } = render(<BlogListing posts={[]} currentPage={1} totalPages={1} />);

      expect(container.querySelectorAll('[data-testid^="post-"]')).toHaveLength(0);
    });

    it('renders single post without pagination', () => {
      const singlePost = [mockPosts[0]];
      render(<BlogListing posts={singlePost} currentPage={1} totalPages={1} />);

      expect(screen.getByTestId('post-1')).toBeInTheDocument();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('renders pagination controls when totalPages > 1', () => {
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('does not render pagination when totalPages is 1', () => {
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={1} />);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('disables Previous button on first page', () => {
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('disables Next button on last page', () => {
      render(<BlogListing posts={mockPosts} currentPage={3} totalPages={3} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('enables both buttons on middle page', () => {
      render(<BlogListing posts={mockPosts} currentPage={2} totalPages={3} />);

      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });

    it('displays correct page number', () => {
      render(<BlogListing posts={mockPosts} currentPage={2} totalPages={5} />);

      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to next page when Next button clicked', async () => {
      const user = userEvent.setup();
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(mockPush).toHaveBeenCalledWith('/blog?page=2');
    });

    it('navigates to previous page when Previous button clicked', async () => {
      const user = userEvent.setup();
      render(<BlogListing posts={mockPosts} currentPage={2} totalPages={3} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(mockPush).toHaveBeenCalledWith('/blog?page=1');
    });

    it('preserves existing search params when navigating', async () => {
      const user = userEvent.setup();
      mockUseSearchParams.mockReturnValue(new URLSearchParams('page=1&filter=tech'));
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // URLSearchParams order is not guaranteed, so check that both params are present
      const calledUrl = mockPush.mock.calls[0][0];
      expect(calledUrl).toContain('/blog?');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('filter=tech');
    });

    it('uses current pathname for navigation', async () => {
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/blog/tech');
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(mockPush).toHaveBeenCalledWith('/blog/tech?page=2');
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on Previous button', () => {
      render(<BlogListing posts={mockPosts} currentPage={2} totalPages={3} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toHaveAttribute('aria-label', 'Previous page');
    });

    it('has aria-label on Next button', () => {
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toHaveAttribute('aria-label', 'Next page');
    });

    it('uses nav element with proper semantics', () => {
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles page 0 gracefully', () => {
      render(<BlogListing posts={mockPosts} currentPage={0} totalPages={3} />);

      expect(screen.getByText('Page 0 of 3')).toBeInTheDocument();
    });

    it('handles totalPages 0 gracefully', () => {
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={0} />);

      // Should not render pagination when totalPages is 0
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('handles large page numbers', () => {
      render(<BlogListing posts={mockPosts} currentPage={99} totalPages={100} />);

      expect(screen.getByText('Page 99 of 100')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });

    it('handles null searchParams', async () => {
      const user = userEvent.setup();
      mockUseSearchParams.mockReturnValue(null);
      render(<BlogListing posts={mockPosts} currentPage={1} totalPages={3} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Should still navigate, just without preserving params
      expect(mockPush).toHaveBeenCalledWith('/blog?page=2');
    });
  });
});
