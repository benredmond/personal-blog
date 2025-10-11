// ABOUTME: 404 page for blog posts that don't exist
// ABOUTME: Returns proper 404 HTTP status code for SEO

import Link from 'next/link';
import MasterGrid from '@/components/layout/MasterGrid';

export default function PostNotFound() {
  return (
    <MasterGrid>
      <div className="col-span-12 md:col-span-8 md:col-start-3 py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Post Not Found</h1>
          <p className="text-gray-700 mb-6">
            The blog post you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-vermilion text-white rounded hover:opacity-90 transition-opacity"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    </MasterGrid>
  );
}
