// ABOUTME: Error boundary for blog listing page
// ABOUTME: Catches data fetching failures and provides recovery option

'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import MasterGrid from '@/components/layout/MasterGrid';
import styles from './error.module.css';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Blog listing error:', error);
  }, [error]);

  return (
    <MasterGrid>
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          {/* L-Frame borders */}
          <div className={`${styles.lFrameBorder} ${styles.lFrameBorderTop}`} aria-hidden="true" />
          <div className={`${styles.lFrameBorder} ${styles.lFrameBorderLeft}`} aria-hidden="true" />

          <div className={styles.contentContainer}>
            <h2 className={styles.title}>Error Loading Blog Posts</h2>
            <p className={styles.message}>{error.message}</p>
            <button onClick={reset} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </MasterGrid>
  );
}
