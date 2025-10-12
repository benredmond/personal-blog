// ABOUTME: Reading progress rail for blog posts - vertical scroll indicator
// ABOUTME: Client Component with performance-optimized scroll tracking (RAF + passive listeners)
// ABOUTME: Scandinavian Strata design: 2px vermilion rail on right edge

'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ReadingProgress.module.css';

/**
 * Vertical reading progress rail component
 * Shows scroll progress as a vermilion line growing from top to bottom on right edge
 * Performance-optimized with requestAnimationFrame and passive event listeners
 * Aligns with Scandinavian Strata design: minimal, functional, sharp geometry
 */
export default function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Prevent hydration mismatch
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let ticking = false;

    const updateProgress = () => {
      if (!progressRef.current) return;

      // Clamp scroll values to prevent iOS elastic scroll issues
      const winScroll = Math.max(0, document.documentElement.scrollTop);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = height > 0 ? Math.min(100, (winScroll / height) * 100) : 0;

      // Use scaleY transform for vertical growth (GPU accelerated)
      progressRef.current.style.transform = `scaleY(${scrolled / 100})`;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause scroll tracking when tab is hidden (battery optimization)
        window.removeEventListener('scroll', handleScroll);
      } else {
        // Resume scroll tracking when tab becomes visible
        window.addEventListener('scroll', handleScroll, { passive: true });
        updateProgress(); // Sync on tab switch
      }
    };

    // Initialize scroll tracking
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    updateProgress(); // Set initial state

    // Cleanup on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mounted]);

  if (!mounted) return null; // Prevent SSR/hydration mismatch

  return (
    <div className={styles.container} aria-hidden="true">
      <div
        ref={progressRef}
        className={styles.bar}
        style={{ transformOrigin: 'top', transform: 'scaleY(0)' }}
      />
    </div>
  );
}
