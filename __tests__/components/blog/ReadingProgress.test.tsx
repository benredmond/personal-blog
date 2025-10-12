// ABOUTME: Unit tests for ReadingProgress component with Scandinavian Strata design
// ABOUTME: Tests SSR safety, mounting behavior, scroll tracking, and accessibility

import React from 'react';
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/react';
import ReadingProgress from '@/components/blog/ReadingProgress';

describe('ReadingProgress', () => {
  // Store original properties to restore after tests
  const originalScrollY = window.scrollY;
  const originalScrollHeight = document.documentElement.scrollHeight;
  const originalClientHeight = document.documentElement.clientHeight;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    // Restore original properties
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: originalScrollY,
    });
  });

  describe('SSR and Hydration Safety', () => {
    it('renders after mount to prevent hydration mismatch', async () => {
      const { container } = render(<ReadingProgress />);

      // Wait for mount effect to set mounted state
      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders container with correct structure', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      expect(progressContainer).toBeInTheDocument();

      // Container should have a child bar element
      const progressBar = progressContainer.firstChild as HTMLElement;
      expect(progressBar).toBeInTheDocument();
    });

    it('sets aria-hidden="true" for accessibility', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      expect(progressContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies correct CSS classes', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Both elements should have their respective classes
      expect(progressContainer.className).toContain('container');
      expect(progressBar.className).toContain('bar');
    });
  });

  describe('Initial State', () => {
    it('initializes with scaleY(0) transform', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Initial transform should be scaleY(0)
      expect(progressBar.style.transform).toBe('scaleY(0)');
    });

    it('sets transform-origin to top', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      expect(progressBar.style.transformOrigin).toBe('top');
    });
  });

  describe('Scroll Tracking', () => {
    it('updates transform on scroll at 0%', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Scroll to 0%
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 0,
      });

      fireEvent.scroll(window);

      // Wait for requestAnimationFrame to complete
      await waitFor(() => {
        expect(progressBar.style.transform).toBe('scaleY(0)');
      });
    });

    it('updates transform on scroll at 50%', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Scroll to 50% (500px out of 1000px scrollable height)
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 500,
      });

      fireEvent.scroll(window);

      // Wait for requestAnimationFrame to complete
      await waitFor(() => {
        expect(progressBar.style.transform).toBe('scaleY(0.5)');
      });
    });

    it('updates transform on scroll at 100%', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Scroll to 100% (1000px out of 1000px scrollable height)
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 1000,
      });

      fireEvent.scroll(window);

      // Wait for requestAnimationFrame to complete
      await waitFor(() => {
        expect(progressBar.style.transform).toBe('scaleY(1)');
      });
    });

    it('handles scroll beyond 100% with clamping', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Scroll beyond 100% (iOS elastic scroll simulation)
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 1500,
      });

      fireEvent.scroll(window);

      // Wait for requestAnimationFrame to complete
      await waitFor(() => {
        // Should be clamped to scaleY(1)
        expect(progressBar.style.transform).toBe('scaleY(1)');
      });
    });

    it('handles negative scroll with clamping', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Negative scroll (iOS elastic scroll simulation)
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: -100,
      });

      fireEvent.scroll(window);

      // Wait for requestAnimationFrame to complete
      await waitFor(() => {
        // Should be clamped to scaleY(0)
        expect(progressBar.style.transform).toBe('scaleY(0)');
      });
    });

    it('handles zero scrollable height gracefully', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Set scroll height equal to window height (no scrollable content)
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      });

      fireEvent.scroll(window);

      // Wait for requestAnimationFrame to complete
      await waitFor(() => {
        // Should remain at scaleY(0)
        expect(progressBar.style.transform).toBe('scaleY(0)');
      });
    });
  });

  describe('Event Listener Management', () => {
    it('registers scroll event listener on mount', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      render(<ReadingProgress />);

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'scroll',
          expect.any(Function),
          { passive: true }
        );
      });

      addEventListenerSpy.mockRestore();
    });

    it('registers visibilitychange event listener on mount', async () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      render(<ReadingProgress />);

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'visibilitychange',
          expect.any(Function)
        );
      });

      addEventListenerSpy.mockRestore();
    });

    it('removes event listeners on unmount', async () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const removeDocumentListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(removeEventListenerSpy).not.toHaveBeenCalled();
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
      expect(removeDocumentListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
      removeDocumentListenerSpy.mockRestore();
    });
  });

  describe('Visibility Change Handling', () => {
    it('removes scroll listener when tab is hidden', async () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      render(<ReadingProgress />);

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalled();
      });

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: true,
      });

      fireEvent(document, new Event('visibilitychange'));

      await waitFor(() => {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          'scroll',
          expect.any(Function)
        );
      });

      removeEventListenerSpy.mockRestore();
      addEventListenerSpy.mockRestore();
    });

    it('re-registers scroll listener when tab becomes visible', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      render(<ReadingProgress />);

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalled();
      });

      // Clear the spy to track new calls
      addEventListenerSpy.mockClear();

      // Simulate tab becoming visible
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: false,
      });

      fireEvent(document, new Event('visibilitychange'));

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'scroll',
          expect.any(Function),
          { passive: true }
        );
      });

      addEventListenerSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple rapid scroll events with requestAnimationFrame throttling', async () => {
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      const progressContainer = container.firstChild as HTMLElement;
      const progressBar = progressContainer.firstChild as HTMLElement;

      // Fire multiple scroll events rapidly
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 250,
      });

      fireEvent.scroll(window);
      fireEvent.scroll(window);
      fireEvent.scroll(window);

      // Wait for requestAnimationFrame to complete
      await waitFor(() => {
        expect(progressBar.style.transform).toBe('scaleY(0.25)');
      });
    });

    it('handles component re-mount', async () => {
      const { unmount } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
      });

      unmount();

      // Render fresh instance after unmount
      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('uses passive scroll listener for better performance', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      render(<ReadingProgress />);

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'scroll',
          expect.any(Function),
          { passive: true }
        );
      });

      addEventListenerSpy.mockRestore();
    });

    it('uses requestAnimationFrame for smooth updates', async () => {
      const rafSpy = jest.spyOn(window, 'requestAnimationFrame');

      const { container } = render(<ReadingProgress />);

      await waitFor(() => {
        expect(container.firstChild).not.toBeNull();
      });

      // Trigger scroll
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 500,
      });

      fireEvent.scroll(window);

      await waitFor(() => {
        expect(rafSpy).toHaveBeenCalled();
      });

      rafSpy.mockRestore();
    });
  });
});
