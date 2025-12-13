// ABOUTME: Dynamic OG image generation for blog posts using Next.js ImageResponse
// ABOUTME: Renders post title with Neo-Bauhaus design (vermilion L-frame, Zodiak typography)

import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600; // Match page ISR (1 hour)

// Pre-render all OG images at build time
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Load fonts at module level (cached across requests)
// Note: ImageResponse requires TTF/OTF format (woff2 not supported)
const zodiak = readFileSync(join(process.cwd(), 'public/fonts/zodiak/Zodiak-Bold.ttf'));
const cabinetGrotesk = readFileSync(join(process.cwd(), 'public/fonts/cabinet-grotesk/CabinetGrotesk-Medium.ttf'));

interface OgImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OgImage({ params }: OgImageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? 'Post Not Found';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fffef9',
          position: 'relative',
        }}
      >
        {/* L-Frame: Top border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            backgroundColor: '#ff3a2d',
          }}
        />
        {/* L-Frame: Left border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: '#ff3a2d',
          }}
        />

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 80px',
            maxWidth: '1000px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: 'Zodiak',
              fontSize: title.length > 40 ? '56px' : '72px',
              fontWeight: 700,
              color: '#0a0a0a',
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: '-1px',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'Cabinet Grotesk',
              fontSize: '24px',
              fontWeight: 500,
              color: '#666',
              letterSpacing: '0.5px',
            }}
          >
            benr.build
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Zodiak',
          data: zodiak,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Cabinet Grotesk',
          data: cabinetGrotesk,
          weight: 500,
          style: 'normal',
        },
      ],
    }
  );
}
