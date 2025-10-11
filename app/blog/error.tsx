// ABOUTME: Error boundary for blog listing page
// ABOUTME: Catches data fetching failures and provides recovery option

'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import MasterGrid from '@/components/layout/MasterGrid';

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
      <div className="error-state bg-red-50 border border-red-200 rounded-lg p-8 my-8">
        <h2 className="text-2xl font-bold text-red-900 mb-4">
          Error Loading Blog Posts
        </h2>
        <p className="text-red-700 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </MasterGrid>
  );
}
