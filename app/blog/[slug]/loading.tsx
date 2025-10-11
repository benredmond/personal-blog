// ABOUTME: Loading skeleton for blog post detail page
// ABOUTME: Shows while Server Component fetches post data

import MasterGrid from '@/components/layout/MasterGrid';

export default function BlogPostLoading() {
  return (
    <MasterGrid>
      <div className="col-span-12 md:col-span-8 md:col-start-3 py-12">
        <div className="animate-pulse space-y-6">
          {/* Back link skeleton */}
          <div className="h-4 bg-gray-200 rounded w-24"></div>

          {/* Title skeleton */}
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>

          {/* Meta skeleton */}
          <div className="flex gap-4">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-3 mt-8">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </MasterGrid>
  );
}
