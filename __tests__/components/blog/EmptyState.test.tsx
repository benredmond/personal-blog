// ABOUTME: Tests for EmptyState component used in blog listing
// ABOUTME: Verifies message display and optional action button rendering

import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/blog/EmptyState';

describe('EmptyState', () => {
  it('renders with message only', () => {
    render(<EmptyState message="No items found" />);

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders with message and action', () => {
    render(
      <EmptyState
        message="No blog posts yet"
        action={{ text: 'Create first post', href: '/admin/blog/new' }}
      />
    );

    expect(screen.getByText('No blog posts yet')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Create first post' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/admin/blog/new');
  });

  it('applies proper styling classes', () => {
    const { container } = render(
      <EmptyState message="Empty" action={{ text: 'Action', href: '/action' }} />
    );

    const emptyStateElement = container.firstChild;
    expect(emptyStateElement).toHaveClass('container');
  });
});
