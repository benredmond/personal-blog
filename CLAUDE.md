# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Next.js 15.5.4 and React 19.1.0, featuring a Neo-Bauhaus L-Frame design with vermilion accents. Also includes a pottery commission form (`/pottery`) with a separate warm/organic design system.

**Current Status**: Production
- Blog fully functional with Neo-Bauhaus design
- Pottery commission form in development (backend pending)

## Architecture & Design Decisions

### Content Management
- **Storage**: Blog posts stored in `data/blog-posts.json` (version controlled)
- **Format**: Full markdown content with GitHub Flavored Markdown support
- **Editing**: Direct JSON file editing in VS Code - no admin UI
- **Schema**: Each post requires: id, slug, title, excerpt, content (markdown), author, category, tags, date, readTime

### Backend API
- **Type**: Direct data access via `lib/blog.ts` (no HTTP overhead)
- **Pattern**: Server Components import data functions directly
- **Validation**: Zod schema validation on required fields (fail-fast approach)
- **Note**: API routes previously existed but were removed (2025-10-12) - pages use direct imports for optimal performance

### Frontend Components
**Source**: Components being converted from `~/dev/chinese-bot/frontend/` (Pages Router → App Router)
- Blog listing: `app/blog/page.jsx` (converted from `pages/blog/index.jsx`)
- Blog detail: `app/blog/[slug]/page.jsx` (converted from `pages/blog/[slug].jsx`)
- Shared components: `components/blog/` (BlogPostCard, BlogListing, EmptyState)
- Markdown rendering: react-markdown + remark-gfm + rehype-raw + rehype-sanitize
- Note: All components will be Server Components by default, mark client-side with `'use client'`

### Design System
**Neo-Bauhaus L-Frame Design** (~600 lines CSS to be duplicated from chinese-bot):
- **Colors**: Vermilion (#ff3a2d) for L-Frame borders, Ultramarine (#0052cc) for links, off-white (#fffef9) background
- **Typography**: 18px body, 720px max-width for optimal reading, Perfect Fourth scale (1.333)
- **Spacing**: 8px baseline grid with Ma (間) principles for negative space
- **Architecture**: L-Frame borders (TOP + LEFT) on blog cards for distinctive visual identity

### Performance & Caching Strategy

**Implemented**: 2025-10-12 (Task: mRsuViqcpfvg_M5JJcuoY)

#### Static Generation with ISR
- **Detail Pages** (`/blog/[slug]`): Fully static with ISR
  - Pre-rendered at build time via `generateStaticParams`
  - TTFB: 10-50ms (CDN cache hit) - **10-50x faster** than dynamic
  - Revalidation: 1 hour (cost-effective for personal blog)
  - New posts: Generated on-demand via `dynamicParams: true`

- **Listing Page** (`/blog`): Dynamic with server-side ISR caching
  - TTFB: 200-500ms on cold start, <100ms on warm serverless
  - Revalidation: 1-hour server-side cache
  - Cannot use static generation due to pagination query params (`?page=N`)
  - Alternative approaches (route segments like `/blog/page/2`) not implemented to preserve clean URL structure

#### Dual-Layer Caching Strategy
Data access layer (`lib/blog.ts`) uses two caching levels:

**Layer 1: Module-Level Cache** (Production only)
- Validated posts cached in memory across requests
- Survives serverless function warm starts
- Bypassed in development mode to prevent stale data during HMR
- Pattern:
  ```typescript
  let cachedPosts: BlogPost[] | null = null;
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && cachedPosts !== null) return cachedPosts;
  ```

**Layer 2: React cache()** (Request-Level)
- Wraps all export functions: `getAllPosts`, `getBlogPosts`, `getPostBySlug`
- Deduplicates calls within single request (e.g., `generateMetadata` + page render)
- Eliminates redundant Zod validation overhead
- First call: 5-15ms, subsequent calls: <0.1ms

#### Font Loading Optimization
- **Primary font** (geistSans): `display: "swap"`, `preload: true`, `adjustFontFallback: true`
- **Secondary font** (geistMono): `display: "swap"`, `preload: false`, `adjustFontFallback: true`
- Impact: -200-500ms LCP, -0.05-0.15 CLS, +5-10 Lighthouse points

#### Expected Performance Metrics
- **Detail Pages**: 10-50x faster TTFB (200-500ms → 10-50ms)
- **Build Time**: 30-50% faster (React cache eliminates duplicate validation)
- **Serverless Cost**: -92% (24 revalidations/day vs 288 with 5-minute cache)
- **Bundle Size**: 122 KB First Load JS (unchanged - bundle optimization deferred)

#### Content Update Workflow
When editing blog posts:
1. Edit `data/blog-posts.json` in VS Code
2. Commit and push to trigger Vercel deployment
3. Wait up to 1 hour for automatic revalidation, OR
4. Manually trigger: Deploy preview → Production (instant cache invalidation)

Cache behavior:
- Static pages cached at edge CDN for 1 hour
- After 1 hour, first request triggers background regeneration
- Stale content served while regenerating (no loading state for users)

### Testing
- **Coverage**: 42 passing tests with 100% coverage (to be migrated from chinese-bot)
- **Location**: `__tests__/components/blog/`
- **Framework**: Jest + React Testing Library

## Key Constraints

1. **Blog uses JSON backend** - Posts stored in `data/blog-posts.json`, no database
2. **User handles content** - No admin UI, edit JSON directly in VS Code
3. **Two design systems** - Blog uses Neo-Bauhaus (vermilion), Pottery uses warm organic (terracotta)
4. **Maintain test coverage** - Tests in `__tests__/`

## Development Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## Content Workflow

To add a new blog post after implementation:
1. Open `data/blog-posts.json`
2. Add new post object with all required fields
3. Commit and push (Vercel auto-deploys)

## Pottery Commission Form (`app/pottery/`)

A standalone pottery commission page for soliciting requests from friends.

### Design System (Separate from Blog)
- **Background**: Speckled warm gray (`#D9D4CC`) with subtle texture pattern
- **Form card**: Warm cream (`#F4EFE6`) with paper grain texture, slight rotation (-0.4deg)
- **Accent**: Clay terracotta (`#B8704F`) for buttons and illustrations
- **Typography**: Velvelyne (self-hosted) - serif with organic personality
- **Form style**: Single open textarea (simplified from original MadLibs spec)

### Key Files
- `app/pottery/page.jsx` - Client component with form logic
- `app/pottery/pottery.css` - Complete styling (390 lines)
- `public/fonts/velvelyne/` - Self-hosted Velvelyne font

### Design Spec Reference
Full specification: `~/Documents/Main Vault/Projects/Pottery Website.md`

### Current State
- ✅ Form UI with validation (10-1000 chars)
- ✅ Confirmation screen with animation
- ✅ Hand-drawn SVG illustrations (placeholder - need GF's artwork)
- ✅ Responsive (desktop/tablet/mobile)
- 🚧 Backend: Currently logs to console (MongoDB integration pending)

