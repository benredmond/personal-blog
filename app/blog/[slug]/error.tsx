// ABOUTME: Error boundary for blog post detail page
// ABOUTME: Catches post fetching failures and provides recovery option

'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import MasterGrid from '@/components/layout/MasterGrid';

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Blog post error:', error);
  }, [error]);

  return (
    <MasterGrid>
      <div className="col-span-12 md:col-span-8 md:col-start-3 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Post</h2>
          <p className="text-red-700 mb-6">{error.message}</p>
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/blog"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Return to Blog
            </Link>
          </div>
        </div>
      </div>
    </MasterGrid>
  );
}
