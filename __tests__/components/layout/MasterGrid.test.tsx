// ABOUTME: Tests for MasterGrid layout component
// ABOUTME: Verifies 12-column grid system foundation with Ma (間) spacing principles

import React from 'react';
import { render, screen } from '@testing-library/react';
import MasterGrid from '@/components/layout/MasterGrid';

describe('MasterGrid', () => {
  it('renders children correctly', () => {
    render(
      <MasterGrid>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </MasterGrid>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('applies master-grid class to wrapper element', () => {
    const { container } = render(
      <MasterGrid>
        <div>Content</div>
      </MasterGrid>
    );

    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('master-grid');
  });

  it('applies custom className alongside master-grid class', () => {
    const customClass = 'custom-layout';
    const { container } = render(
      <MasterGrid className={customClass}>
        <div>Content</div>
      </MasterGrid>
    );

    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('master-grid');
    expect(gridElement).toHaveClass(customClass);
  });

  it('applies multiple custom classes alongside master-grid class', () => {
    const customClasses = 'custom-layout spacing-large';
    const { container } = render(
      <MasterGrid className={customClasses}>
        <div>Content</div>
      </MasterGrid>
    );

    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('master-grid');
    expect(gridElement).toHaveClass('custom-layout');
    expect(gridElement).toHaveClass('spacing-large');
  });

  it('handles empty className prop gracefully', () => {
    const { container } = render(
      <MasterGrid className="">
        <div>Content</div>
      </MasterGrid>
    );

    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('master-grid');
    expect(gridElement?.className).toBe('master-grid');
  });

  it('renders with no children', () => {
    const { container } = render(<MasterGrid>{null}</MasterGrid>);

    const gridElement = container.firstChild;
    expect(gridElement).toBeInTheDocument();
    expect(gridElement).toHaveClass('master-grid');
    expect(gridElement?.childNodes.length).toBe(0);
  });

  it('renders with single child', () => {
    render(
      <MasterGrid>
        <div data-testid="single-child">Single child element</div>
      </MasterGrid>
    );

    const child = screen.getByTestId('single-child');
    expect(child).toBeInTheDocument();
    expect(screen.getByText('Single child element')).toBeInTheDocument();
  });

  it('renders with nested complex children', () => {
    render(
      <MasterGrid>
        <div data-testid="parent-1">
          <span data-testid="nested-1">Nested content 1</span>
        </div>
        <div data-testid="parent-2">
          <span data-testid="nested-2">Nested content 2</span>
        </div>
      </MasterGrid>
    );

    expect(screen.getByTestId('parent-1')).toBeInTheDocument();
    expect(screen.getByTestId('parent-2')).toBeInTheDocument();
    expect(screen.getByTestId('nested-1')).toBeInTheDocument();
    expect(screen.getByTestId('nested-2')).toBeInTheDocument();
    expect(screen.getByText('Nested content 1')).toBeInTheDocument();
    expect(screen.getByText('Nested content 2')).toBeInTheDocument();
  });

  it('preserves grid item class names on children', () => {
    const { container } = render(
      <MasterGrid>
        <div className="col-span-8" data-testid="main-content">
          Main
        </div>
        <div className="col-span-4" data-testid="sidebar">
          Sidebar
        </div>
      </MasterGrid>
    );

    const mainContent = screen.getByTestId('main-content');
    const sidebar = screen.getByTestId('sidebar');

    expect(mainContent).toHaveClass('col-span-8');
    expect(sidebar).toHaveClass('col-span-4');
  });

  it('does not add extraneous whitespace when className is undefined', () => {
    const { container } = render(
      <MasterGrid>
        <div>Content</div>
      </MasterGrid>
    );

    const gridElement = container.firstChild;
    // Should be exactly "master-grid", not "master-grid " with trailing space
    expect(gridElement?.className).toBe('master-grid');
  });

  it('trims whitespace correctly when custom className has leading/trailing spaces', () => {
    const { container } = render(
      <MasterGrid className="  custom-class  ">
        <div>Content</div>
      </MasterGrid>
    );

    const gridElement = container.firstChild;
    // Should not have extra spaces due to trim()
    expect(gridElement).toHaveClass('master-grid');
    expect(gridElement).toHaveClass('custom-class');
  });
});
