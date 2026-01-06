// ABOUTME: Tests PlanComparison rendering for both and missing plans
// ABOUTME: Verifies headings, raw plan output, and empty-state handling

import React from 'react';
import { render, screen } from '@testing-library/react';

import PlanComparison from '@/components/blog/PlanComparison';

describe('PlanComparison', () => {
  it('renders both plan columns when content is provided', () => {
    render(<PlanComparison claudePlan="# Claude Plan" codexPlan="# Codex Plan" />);

    expect(screen.getByText("Claude's Plan")).toBeInTheDocument();
    expect(screen.getByText("Codex's Plan")).toBeInTheDocument();
    expect(screen.getByText('# Claude Plan')).toBeInTheDocument();
    expect(screen.getByText('# Codex Plan')).toBeInTheDocument();
  });

  it('shows empty state for missing plan content', () => {
    render(<PlanComparison claudePlan={null} codexPlan="# Codex Plan" />);

    expect(screen.getByText("Claude's Plan")).toBeInTheDocument();
    expect(screen.getByText('No plan available')).toBeInTheDocument();
    expect(screen.getByText('# Codex Plan')).toBeInTheDocument();
  });

  it('renders nothing when both plans are missing', () => {
    const { container } = render(<PlanComparison claudePlan={null} codexPlan={null} />);

    expect(container.firstChild).toBeNull();
  });
});
