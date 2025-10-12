// ABOUTME: Unit tests for BlogPostCard component with Scandinavian Strata design
// ABOUTME: Tests component rendering, metadata display, and link functionality

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlogPostCard, BlogPostCardProps, Post } from '@/components/blog/BlogPostCard';

describe('BlogPostCard', () => {
  const mockPost: Post = {
    id: 1,
    title: 'Getting Started with Next.js',
    excerpt:
      'Learn the fundamentals of Next.js including routing, data fetching, and deployment best practices.',
    category: 'Tutorial',
    date: '2025-01-22T12:00:00Z', // Use ISO with time to avoid timezone issues
    readTime: '8',
    slug: 'getting-started-nextjs',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required post data', () => {
      render(<BlogPostCard post={mockPost} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
      expect(screen.getByText(mockPost.excerpt!)).toBeInTheDocument();
      expect(screen.getByText(mockPost.category!)).toBeInTheDocument();
    });

    it('renders post title as link', () => {
      render(<BlogPostCard post={mockPost} />);

      const titleLink = screen.getByRole('link', { name: mockPost.title });
      expect(titleLink).toBeInTheDocument();
      expect(titleLink).toHaveAttribute('href', `/blog/${mockPost.slug}`);
    });

    it('renders Continue Reading link', () => {
      render(<BlogPostCard post={mockPost} />);

      const continueLink = screen.getByRole('link', { name: /continue reading/i });
      expect(continueLink).toBeInTheDocument();
      expect(continueLink).toHaveAttribute('href', `/blog/${mockPost.slug}`);
    });

    it('applies additional className when provided', () => {
      const { container } = render(<BlogPostCard post={mockPost} className="custom-class" />);

      const article = container.querySelector('article');
      expect(article).toHaveClass('custom-class');
    });

    it('returns null when post prop is missing', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      // @ts-expect-error - Testing invalid prop
      const { container } = render(<BlogPostCard />);

      expect(container.firstChild).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('BlogPostCard: post prop is required');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Metadata Display', () => {
    it('renders category when provided', () => {
      render(<BlogPostCard post={mockPost} />);

      expect(screen.getByText(mockPost.category!)).toBeInTheDocument();
    });

    it('renders date when provided', () => {
      render(<BlogPostCard post={mockPost} />);

      expect(screen.getByText('Jan 22, 2025')).toBeInTheDocument();
    });

    it('renders readTime when provided', () => {
      render(<BlogPostCard post={mockPost} />);

      expect(screen.getByText('8 min read')).toBeInTheDocument();
    });

    it('formats date correctly', () => {
      render(<BlogPostCard post={mockPost} />);

      // Date should be formatted as "Jan 22, 2025"
      const timeElement = screen.getByText('Jan 22, 2025');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.tagName).toBe('TIME');
      expect(timeElement).toHaveAttribute('dateTime', '2025-01-22T12:00:00Z');
    });

    it('does not render category when missing', () => {
      const postWithoutCategory = { ...mockPost, category: undefined };
      render(<BlogPostCard post={postWithoutCategory} />);

      expect(screen.queryByText('Tutorial')).not.toBeInTheDocument();
    });

    it('does not render date when missing', () => {
      const postWithoutDate = { ...mockPost, date: undefined };
      render(<BlogPostCard post={postWithoutDate} />);

      expect(screen.queryByText(/Jan/)).not.toBeInTheDocument();
    });

    it('does not render readTime when missing', () => {
      const postWithoutReadTime = { ...mockPost, readTime: undefined };
      render(<BlogPostCard post={postWithoutReadTime} />);

      expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
    });

    it('supports published_date field as alternative to date', () => {
      const postWithPublishedDate = {
        ...mockPost,
        date: undefined,
        published_date: '2025-02-15T12:00:00Z',
      };
      render(<BlogPostCard post={postWithPublishedDate} />);

      expect(screen.getByText('Feb 15, 2025')).toBeInTheDocument();
    });

    it('supports read_time field as alternative to readTime', () => {
      const postWithReadTime = {
        ...mockPost,
        readTime: undefined,
        read_time: '12',
      };
      render(<BlogPostCard post={postWithReadTime} />);

      expect(screen.getByText('12 min read')).toBeInTheDocument();
    });

    it('prefers date over published_date when both present', () => {
      const postWithBothDates = {
        ...mockPost,
        date: '2025-01-22T12:00:00Z',
        published_date: '2025-02-15T12:00:00Z',
      };
      render(<BlogPostCard post={postWithBothDates} />);

      expect(screen.getByText('Jan 22, 2025')).toBeInTheDocument();
      expect(screen.queryByText('Feb 15, 2025')).not.toBeInTheDocument();
    });

    it('prefers readTime over read_time when both present', () => {
      const postWithBothReadTimes = {
        ...mockPost,
        readTime: '8',
        read_time: '12',
      };
      render(<BlogPostCard post={postWithBothReadTimes} />);

      expect(screen.getByText('8 min read')).toBeInTheDocument();
      expect(screen.queryByText('12 min read')).not.toBeInTheDocument();
    });
  });

  describe('Excerpt', () => {
    it('renders excerpt when provided', () => {
      render(<BlogPostCard post={mockPost} />);

      expect(screen.getByText(mockPost.excerpt!)).toBeInTheDocument();
    });

    it('does not render excerpt when missing', () => {
      const postWithoutExcerpt = { ...mockPost, excerpt: undefined };
      render(<BlogPostCard post={postWithoutExcerpt} />);

      expect(screen.queryByText(mockPost.excerpt!)).not.toBeInTheDocument();
    });

    it('renders long excerpts without truncation', () => {
      const longExcerpt = 'A'.repeat(500);
      const postWithLongExcerpt = { ...mockPost, excerpt: longExcerpt };
      render(<BlogPostCard post={postWithLongExcerpt} />);

      expect(screen.getByText(longExcerpt)).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('title link points to correct slug', () => {
      render(<BlogPostCard post={mockPost} />);

      const titleLink = screen.getByRole('link', { name: mockPost.title });
      expect(titleLink).toHaveAttribute('href', '/blog/getting-started-nextjs');
    });

    it('continue reading link points to correct slug', () => {
      render(<BlogPostCard post={mockPost} />);

      const continueLink = screen.getByRole('link', { name: /continue reading/i });
      expect(continueLink).toHaveAttribute('href', '/blog/getting-started-nextjs');
    });

    it('handles slugs with special characters', () => {
      const postWithSpecialSlug = {
        ...mockPost,
        slug: 'hello-world-2025',
      };
      render(<BlogPostCard post={postWithSpecialSlug} />);

      const titleLink = screen.getByRole('link', { name: mockPost.title });
      expect(titleLink).toHaveAttribute('href', '/blog/hello-world-2025');
    });
  });

  describe('Edge Cases', () => {
    it('handles post with only required fields', () => {
      const minimalPost: Post = {
        id: 1,
        title: 'Minimal Post',
        slug: 'minimal-post',
      };
      render(<BlogPostCard post={minimalPost} />);

      expect(screen.getByText('Minimal Post')).toBeInTheDocument();
      expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
      expect(screen.queryByRole('time')).not.toBeInTheDocument();
    });

    it('handles numeric id', () => {
      const postWithNumericId = { ...mockPost, id: 123 };
      render(<BlogPostCard post={postWithNumericId} />);

      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    });

    it('handles string id', () => {
      const postWithStringId = { ...mockPost, id: 'post-abc-123' };
      render(<BlogPostCard post={postWithStringId} />);

      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    });

    it('handles empty strings gracefully', () => {
      const postWithEmptyStrings = {
        ...mockPost,
        category: '',
        excerpt: '',
      };
      render(<BlogPostCard post={postWithEmptyStrings} />);

      expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    });

    it('handles invalid date format gracefully', () => {
      const postWithInvalidDate = { ...mockPost, date: 'invalid-date' };
      render(<BlogPostCard post={postWithInvalidDate} />);

      // Should render "Invalid Date" or handle gracefully
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses time element with correct datetime attribute', () => {
      render(<BlogPostCard post={mockPost} />);

      const timeElement = screen.getByText('Jan 22, 2025');
      expect(timeElement.tagName).toBe('TIME');
      expect(timeElement).toHaveAttribute('dateTime', '2025-01-22T12:00:00Z');
    });

    it('uses semantic article element', () => {
      render(<BlogPostCard post={mockPost} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('title is properly structured as h2', () => {
      render(<BlogPostCard post={mockPost} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(mockPost.title);
    });
  });

  describe('Memoization', () => {
    it('component has displayName set', () => {
      expect(BlogPostCard.displayName).toBe('BlogPostCard');
    });
  });
});
