// ABOUTME: Blog posts API endpoint - paginated listing
// ABOUTME: HTTP wrapper around lib/blog.ts functions (thin adapter layer)

import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blog';
import { BlogDataError } from '@/lib/types';

/**
 * GET /api/blog/posts?page=1&limit=12
 * Returns paginated blog posts (without full content for performance)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Validate pagination parameters
    if (isNaN(page) || page < 1 || page > 10000) {
      return NextResponse.json(
        {
          error: 'Invalid page parameter',
          hint: 'Page must be an integer between 1 and 10000',
        },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          error: 'Invalid limit parameter',
          hint: 'Limit must be an integer between 1 and 100',
        },
        { status: 400 }
      );
    }

    // Get posts from lib layer
    const data = getBlogPosts(page, limit);

    // Return successful response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    // Handle BlogDataError (validation issues)
    if (error instanceof BlogDataError) {
      return NextResponse.json(
        {
          error: 'Blog data error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Blog API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load blog posts',
        details: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : 'Unknown error'
          : undefined,
      },
      { status: 500 }
    );
  }
}
