// ABOUTME: Dynamic blog post detail page using App Router with Scandinavian Strata design
// ABOUTME: Uses lib/blog.ts for direct data access, renders markdown with clean typography

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import MasterGrid from '@/components/layout/MasterGrid';
import BlogHeader from '@/components/blog/BlogHeader';
import AuthorBio from '@/components/blog/AuthorBio';
import ReadingProgress from '@/components/blog/ReadingProgress';
import styles from '@/components/blog/StrataPost.module.css';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { getBlogPostMetadata } from '@/lib/metadata';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-render all blog posts at build time for optimal performance
 * New posts can still be generated on-demand with dynamicParams
 */
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Enable ISR: Revalidate every 1 hour (cost-effective for personal blog with infrequent updates)
export const revalidate = 3600;

// Allow new posts to be generated on-demand (not just at build time)
export const dynamicParams = true;

/**
 * Format date as "MMM DD, YYYY"
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Generate metadata for SEO and social sharing
 * Uses direct data access (Next.js 15 automatically deduplicates with page component)
 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return getBlogPostMetadata(post);
}

/**
 * Blog post detail page
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <ReadingProgress />
      <BlogHeader />
      <MasterGrid>
        <article className={`col-span-12 md:col-span-8 md:col-start-3 ${styles.article}`}>
          {/* Back Navigation */}
          <Link href="/blog" className={styles.backNav}>
            Blog
          </Link>

          {/* Metadata */}
          <div className={styles.postMetadata}>
            {post.category && <span className={styles.category}>{post.category}</span>}
            {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
            {post.readTime && <span>{post.readTime} min read</span>}
          </div>

          {/* Title with vermilion underline */}
          <h1 className={styles.postTitle}>{post.title}</h1>

          {/* Markdown Content */}
          <div className={styles.prose}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Author bio */}
          <div className={styles.authorBioWrapper}>
            <AuthorBio />
          </div>
        </article>
      </MasterGrid>
    </>
  );
}
