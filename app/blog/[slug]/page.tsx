// ABOUTME: Dynamic blog post detail page using App Router
// ABOUTME: Uses lib/blog.ts for direct data access, renders markdown with Neo-Bauhaus styling

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
import styles from '@/components/blog/BlogPostCard.module.css';
import { getPostBySlug } from '@/lib/blog';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

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
 * Generate metadata for SEO
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

  return {
    title: `${post.title} | Ben Redmond`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
    },
  };
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
      <BlogHeader />
      <MasterGrid>
        <article className="col-span-12 md:col-span-8 md:col-start-3 relative py-12">
        {/* L-Frame borders for blog identity */}
        <div className={styles.lFrameBorderTop} />
        <div className={styles.lFrameBorderLeft} />

        {/* Back Navigation */}
        <Link
          href="/blog"
          className="inline-flex items-center mb-6 text-vermilion hover:opacity-80 transition-opacity"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Blog
        </Link>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          {post.category && (
            <span
              className={`px-3 py-1 rounded-full font-semibold ${
                post.category === 'AI'
                  ? 'bg-vermilion text-white'
                  : post.category === 'Learning'
                    ? 'bg-ultramarine text-white'
                    : 'bg-gray-200 text-gray-800'
              }`}
            >
              {post.category}
            </span>
          )}
          {post.date && <span className="text-gray-600">{formatDate(post.date)}</span>}
          {post.readTime && <span className="text-gray-600">{post.readTime} min read</span>}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{post.title}</h1>

        {/* Markdown Content with Component Overrides */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-4xl font-bold mb-6 mt-8 leading-tight">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-bold mb-4 mt-6 leading-tight">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold mb-3 mt-4 leading-tight">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-gray-800 text-lg">{children}</p>
            ),
            code: ({ className, children, ...props }) => {
              const inline = !className;
              return inline ? (
                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm text-gray-900">
                  {children}
                </code>
              ) : (
                <code className="font-mono text-sm" {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-gray-50 p-6 rounded-lg mb-6 overflow-x-auto font-mono text-sm whitespace-pre border border-gray-200">
                {children}
              </pre>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-vermilion underline hover:opacity-80 transition-opacity"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-800">
                {children}
              </ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-vermilion pl-4 italic my-6 text-gray-700">
                {children}
              </blockquote>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>

        {/* Author bio */}
        <AuthorBio />
      </article>
    </MasterGrid>
    </>
  );
}
