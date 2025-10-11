// ABOUTME: Loading skeleton for blog listing page
// ABOUTME: Shows while Server Component fetches data

import MasterGrid from '@/components/layout/MasterGrid';

export default function BlogLoading() {
  return (
    <MasterGrid>
      <div className="loading-state animate-pulse space-y-8">
        {/* Featured post skeleton */}
        <div className="h-96 bg-gray-200 rounded-lg"></div>

        {/* Grid of post skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    </MasterGrid>
  );
}
