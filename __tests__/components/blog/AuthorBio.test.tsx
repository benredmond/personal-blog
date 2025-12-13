// ABOUTME: Unit tests for AuthorBio component
// ABOUTME: Tests rendering, links, security attributes, and accessibility

import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthorBio from '@/components/blog/AuthorBio';

describe('AuthorBio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders heading with correct text', () => {
      render(<AuthorBio />);

      const heading = screen.getByRole('heading', { level: 3, name: 'About Me' });
      expect(heading).toBeInTheDocument();
    });

    it('renders bio text content', () => {
      render(<AuthorBio />);

      expect(
        screen.getByText(/Software engineer at MongoDB/i)
      ).toBeInTheDocument();
    });

    it('renders Koucai project mention', () => {
      render(<AuthorBio />);

      expect(screen.getByRole('link', { name: 'koucai.chat' })).toBeInTheDocument();
    });

    it('renders author expertise description', () => {
      render(<AuthorBio />);

      expect(
        screen.getByText(/I write about what works \(and what breaks\) when working with AI/i)
      ).toBeInTheDocument();
    });
  });

  describe('Koucai Link', () => {
    it('renders koucai.chat link with correct href', () => {
      render(<AuthorBio />);

      const koucaiLink = screen.getByRole('link', { name: 'koucai.chat' });
      expect(koucaiLink).toBeInTheDocument();
      expect(koucaiLink).toHaveAttribute('href', 'https://koucai.chat');
    });

    it('opens koucai.chat link in new tab', () => {
      render(<AuthorBio />);

      const koucaiLink = screen.getByRole('link', { name: 'koucai.chat' });
      expect(koucaiLink).toHaveAttribute('target', '_blank');
    });

    it('includes security attributes on koucai.chat link', () => {
      render(<AuthorBio />);

      const koucaiLink = screen.getByRole('link', { name: 'koucai.chat' });
      expect(koucaiLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('GitHub Link', () => {
    it('renders GitHub link with correct href', () => {
      render(<AuthorBio />);

      const githubLink = screen.getByRole('link', { name: 'GitHub' });
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('href', 'https://github.com/benredmond');
    });

    it('opens GitHub link in new tab', () => {
      render(<AuthorBio />);

      const githubLink = screen.getByRole('link', { name: 'GitHub' });
      expect(githubLink).toHaveAttribute('target', '_blank');
    });

    it('includes security attributes on GitHub link', () => {
      render(<AuthorBio />);

      const githubLink = screen.getByRole('link', { name: 'GitHub' });
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('LinkedIn Link', () => {
    it('renders LinkedIn link with correct href', () => {
      render(<AuthorBio />);

      const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });
      expect(linkedinLink).toBeInTheDocument();
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/ben-redmond1/');
    });

    it('opens LinkedIn link in new tab', () => {
      render(<AuthorBio />);

      const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });
      expect(linkedinLink).toHaveAttribute('target', '_blank');
    });

    it('includes security attributes on LinkedIn link', () => {
      render(<AuthorBio />);

      const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });
      expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Email Link', () => {
    it('renders Email link with correct href', () => {
      render(<AuthorBio />);

      const emailLink = screen.getByRole('link', { name: 'Email' });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:ben@benr.build');
    });
  });

  describe('Link Security', () => {
    it('external links have rel="noopener noreferrer"', () => {
      render(<AuthorBio />);

      // External links should have security attributes
      const koucaiLink = screen.getByRole('link', { name: 'koucai.chat' });
      const githubLink = screen.getByRole('link', { name: 'GitHub' });
      const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });

      expect(koucaiLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('external links open in new tab', () => {
      render(<AuthorBio />);

      // External links should open in new tab
      const koucaiLink = screen.getByRole('link', { name: 'koucai.chat' });
      const githubLink = screen.getByRole('link', { name: 'GitHub' });
      const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });

      expect(koucaiLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(linkedinLink).toHaveAttribute('target', '_blank');
    });

    it('email link does not open in new tab', () => {
      render(<AuthorBio />);

      const emailLink = screen.getByRole('link', { name: 'Email' });
      expect(emailLink).not.toHaveAttribute('target');
    });
  });

  describe('Link Structure', () => {
    it('renders all four expected links', () => {
      render(<AuthorBio />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4);

      // Verify link text
      expect(screen.getByRole('link', { name: 'koucai.chat' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
    });

    it('links appear in correct order', () => {
      render(<AuthorBio />);

      const links = screen.getAllByRole('link');

      // First link is koucai.chat (inline in bio text)
      expect(links[0]).toHaveAttribute('href', 'https://koucai.chat');

      // Second link is Email
      expect(links[1]).toHaveAttribute('href', 'mailto:ben@benr.build');

      // Third link is GitHub
      expect(links[2]).toHaveAttribute('href', 'https://github.com/benredmond');

      // Fourth link is LinkedIn
      expect(links[3]).toHaveAttribute('href', 'https://linkedin.com/in/ben-redmond1/');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading element', () => {
      render(<AuthorBio />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('About Me');
    });

    it('uses paragraph element for bio text', () => {
      const { container } = render(<AuthorBio />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThan(0);
    });

    it('external links are accessible via keyboard navigation', () => {
      render(<AuthorBio />);

      const allLinks = screen.getAllByRole('link');

      allLinks.forEach((link) => {
        // Links should not have negative tabindex
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Component Structure', () => {
    it('renders with expected class structure', () => {
      const { container } = render(<AuthorBio />);

      const bioContainer = container.firstChild;
      expect(bioContainer).toBeInTheDocument();
    });

    it('contains links section for social profiles', () => {
      render(<AuthorBio />);

      // Should have a div containing Email, GitHub and LinkedIn links
      const socialLinks = screen.getByRole('link', { name: 'GitHub' }).parentElement;
      expect(socialLinks).toBeInTheDocument();
      expect(socialLinks).toContainElement(screen.getByRole('link', { name: 'Email' }));
      expect(socialLinks).toContainElement(screen.getByRole('link', { name: 'LinkedIn' }));
    });
  });
});
