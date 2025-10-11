// ABOUTME: Single blog post API endpoint by slug
// ABOUTME: HTTP wrapper around lib/blog.getPostBySlug (returns full content)

import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/blog';
import { BlogDataError } from '@/lib/types';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/blog/posts/[slug]
 * Returns single blog post with full markdown content
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        {
          error: 'Invalid slug parameter',
          hint: 'Slug must be a non-empty string',
        },
        { status: 400 }
      );
    }

    // Get post from lib layer
    const post = getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        {
          error: 'Post not found',
          slug,
        },
        { status: 404 }
      );
    }

    // Return successful response
    return NextResponse.json(
      { post },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    // Handle BlogDataError (validation issues)
    if (error instanceof BlogDataError) {
      return NextResponse.json(
        {
          error: 'Blog data error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    // Handle unexpected errors
    console.error('Blog post API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load blog post',
        details: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : 'Unknown error'
          : undefined,
      },
      { status: 500 }
    );
  }
}
