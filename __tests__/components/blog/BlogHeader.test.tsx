// ABOUTME: Unit tests for BlogHeader component with Floating Name design
// ABOUTME: Tests header rendering, navigation links, structure, and accessibility

import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogHeader from '@/components/blog/BlogHeader';

describe('BlogHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders header element', () => {
      render(<BlogHeader />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('renders name "Ben Redmond"', () => {
      render(<BlogHeader />);

      expect(screen.getByText('Ben Redmond')).toBeInTheDocument();
    });

    it('renders navigation element', () => {
      render(<BlogHeader />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders Home and Blog links', () => {
      render(<BlogHeader />);

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('Home link points to root path', () => {
      render(<BlogHeader />);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('Blog link points to blog path', () => {
      render(<BlogHeader />);

      const blogLink = screen.getByRole('link', { name: 'Blog' });
      expect(blogLink).toHaveAttribute('href', '/blog');
    });
  });

  describe('Structure', () => {
    it('uses semantic header element', () => {
      render(<BlogHeader />);

      const header = screen.getByRole('banner');
      expect(header.tagName).toBe('HEADER');
    });

    it('uses semantic nav element', () => {
      render(<BlogHeader />);

      const nav = screen.getByRole('navigation');
      expect(nav.tagName).toBe('NAV');
    });

    it('renders name as h1 heading', () => {
      render(<BlogHeader />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Ben Redmond');
    });

    it('contains both name and navigation elements', () => {
      render(<BlogHeader />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible navigation landmark', () => {
      render(<BlogHeader />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('provides accessible banner landmark', () => {
      render(<BlogHeader />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('name is properly structured as h1', () => {
      render(<BlogHeader />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('navigation contains links as immediate children', () => {
      render(<BlogHeader />);

      const nav = screen.getByRole('navigation');
      const links = screen.getAllByRole('link');

      expect(links).toHaveLength(2);
      links.forEach(link => {
        expect(nav).toContainElement(link);
      });
    });
  });

  describe('Content', () => {
    it('displays correct author name', () => {
      render(<BlogHeader />);

      const name = screen.getByText('Ben Redmond');
      expect(name).toBeInTheDocument();
      expect(name.textContent).toBe('Ben Redmond');
    });

    it('navigation contains exactly two links', () => {
      render(<BlogHeader />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
    });

    it('navigation links appear in correct order', () => {
      render(<BlogHeader />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('Home');
      expect(links[1]).toHaveTextContent('Blog');
    });
  });

  describe('CSS Modules', () => {
    it('applies CSS module classes to header', () => {
      const { container } = render(<BlogHeader />);

      const header = container.querySelector('header');
      expect(header?.className).toMatch(/blogHeader/);
    });

    it('applies CSS module classes to container', () => {
      const { container } = render(<BlogHeader />);

      const containerDiv = container.querySelector('[class*="container"]');
      expect(containerDiv).toBeInTheDocument();
    });

    it('applies CSS module classes to name float', () => {
      const { container } = render(<BlogHeader />);

      const nameFloat = container.querySelector('[class*="nameFloat"]');
      expect(nameFloat).toBeInTheDocument();
    });

    it('applies CSS module classes to nav anchor', () => {
      const { container } = render(<BlogHeader />);

      const navAnchor = container.querySelector('[class*="navAnchor"]');
      expect(navAnchor).toBeInTheDocument();
    });

    it('applies CSS module classes to nav links', () => {
      const { container } = render(<BlogHeader />);

      const navLinks = container.querySelectorAll('[class*="navLink"]');
      expect(navLinks).toHaveLength(2);
    });

    it('renders underline element for name', () => {
      const { container } = render(<BlogHeader />);

      const underline = container.querySelector('[class*="underline"]');
      expect(underline).toBeInTheDocument();
      expect(underline?.tagName).toBe('SPAN');
    });
  });

  describe('Layout Structure', () => {
    it('renders with Floating Name design structure', () => {
      const { container } = render(<BlogHeader />);

      // Verify inverted hierarchy: name float + nav anchor
      const nameFloat = container.querySelector('[class*="nameFloat"]');
      const navAnchor = container.querySelector('[class*="navAnchor"]');

      expect(nameFloat).toBeInTheDocument();
      expect(navAnchor).toBeInTheDocument();
    });

    it('name section contains heading and underline', () => {
      const { container } = render(<BlogHeader />);

      const nameFloat = container.querySelector('[class*="nameFloat"]');
      const heading = screen.getByRole('heading', { level: 1 });
      const underline = container.querySelector('[class*="underline"]');

      expect(nameFloat).toContainElement(heading);
      expect(nameFloat).toContainElement(underline);
    });

    it('navigation section contains links', () => {
      const { container } = render(<BlogHeader />);

      const navAnchor = container.querySelector('[class*="navAnchor"]');
      const homeLink = screen.getByRole('link', { name: 'Home' });
      const blogLink = screen.getByRole('link', { name: 'Blog' });

      expect(navAnchor).toContainElement(homeLink);
      expect(navAnchor).toContainElement(blogLink);
    });
  });
});
