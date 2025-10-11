# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **standalone personal blog project** being extracted from the chinese-bot repository. The blog is built with Next.js 15.5.4 and React 19.1.0, featuring a Neo-Bauhaus L-Frame design with vermilion accents.

**Current Status**: Project initialization phase (Sprint S01)
- T00_S01 complete: App Router foundation established (2025-10-11)
- Implementation tasks are tracked in `.simone/03_ACTIVE_SPRINTS/S01_Personal_Blog_Transition/`
- All 10 task files (T00-T06 series) contain detailed implementation specifications
- Expected completion: 3 days (17-26 hours)

**Critical Architecture Decision (2025-10-11)**: Using **App Router** (not Pages Router)
- Rationale: Learn modern Next.js patterns, better SEO, future-proofing
- Impact: T00_S02 will require converting Pages Router components to App Router
- Trade-off: Adds 3-5 hours to extraction but provides long-term benefits

## Architecture & Design Decisions

### Content Management
- **Storage**: Blog posts stored in `data/blog-posts.json` (version controlled)
- **Format**: Full markdown content with GitHub Flavored Markdown support
- **Editing**: Direct JSON file editing in VS Code - no admin UI
- **Schema**: Each post requires: id, slug, title, excerpt, content (markdown), author, category, tags, date, readTime

### Backend API
- **Type**: Next.js API routes (serverless functions)
- **Endpoints**:
  - `/api/blog/posts` - Paginated list (excludes full content)
  - `/api/blog/posts/[slug]` - Single post with full markdown content
- **Validation**: Schema validation on required fields (fail-fast approach)
- **Response Format**: `{ posts: [...], total: N }` for listing, `{ post: {...} }` for detail

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

### Testing
- **Coverage**: 42 passing tests with 100% coverage (to be migrated from chinese-bot)
- **Location**: `__tests__/components/blog/`
- **Framework**: Jest + React Testing Library

## Task Execution Sequence

**Phase 0: Project Extraction** (T00 series - MUST be completed first)
1. T00_S01: ✅ COMPLETE - Initialized Next.js 15.5.4 with App Router, React 19, Tailwind, ESLint
2. T00_S02: Convert and extract blog components from chinese-bot (Pages Router → App Router, maintain test coverage)
3. T00_S03: Duplicate Neo-Bauhaus design system CSS
4. T00_S04: Initialize git repo and connect to Vercel

**Phase 1: Backend & Content** (T01-T02)
1. T01_S01: Create `data/blog-posts.json`, implement API routes, add markdown rendering
2. T02_S01: Add AuthorBio, BlogHeader, SocialShare components

**Phase 2: SEO & Infrastructure** (T05-T06, T03 optional)
1. T05_S01: Add OpenGraph/Twitter Card meta tags for social sharing
2. T06_S01: Implement RSS feed (`/api/feed.xml`) and sitemap (`/sitemap.xml`)
3. T03_S01: Optional visual identity tweaks

**Phase 3: Deployment** (T04)
1. T04_S01: Deploy standalone to Vercel with custom domain

## Key Constraints

1. **NO subdomain routing** - This is a standalone deployment, not integrated with chinese-bot
2. **NO MongoDB** - Use simple JSON file backend (decided 2025-10-11 05:00 UTC)
3. **User handles content** - No seed data, no admin UI - user edits JSON directly
4. **Keep Neo-Bauhaus aesthetic** - 9/10 design rating, user's preferred style
5. **Maintain test coverage** - All 42 tests must continue passing after extraction

## Content Workflow

To add a new blog post after implementation:
1. Open `data/blog-posts.json`
2. Add new post object with all required fields
3. Commit and push (Vercel auto-deploys)

## Source Reference

Blog components currently exist in: `~/dev/chinese-bot/frontend/` (Pages Router format)
- Pages: `pages/blog/index.jsx`, `pages/blog/[slug].jsx` → Need conversion to App Router
- Components: `components/blog/BlogPostCard.jsx`, `components/blog/BlogListing.jsx`, `components/blog/EmptyState.jsx` → Reusable as-is
- Tests: `__tests__/components/blog/` → May need updates for Server Components
- Design system: `styles/` (Neo-Bauhaus CSS) → Reusable as-is

**Conversion Notes for T00_S02**:
- Pages Router `pages/blog/index.jsx` → App Router `app/blog/page.jsx`
- Pages Router `pages/blog/[slug].jsx` → App Router `app/blog/[slug]/page.jsx`
- Remove `getServerSideProps` / `getStaticProps` → Use async Server Components
- Add `'use client'` directive to components with interactivity (useState, onClick, etc.)

## Sprint Planning Context

All implementation details are in `.simone/03_ACTIVE_SPRINTS/S01_Personal_Blog_Transition/`:
- **meta.md** - Sprint overview, timeline, success metrics
- **T00_S01-T00_S04** - Project setup tasks (CRITICAL PATH)
- **T01_S01** - Backend API with markdown rendering
- **T02_S01** - Personal branding components
- **T03_S01** - Visual identity updates (optional)
- **T04_S01** - Standalone deployment guide
- **T05_S01** - SEO/OpenGraph implementation
- **T06_S01** - RSS feed and sitemap

Each task file contains:
- Detailed acceptance criteria
- Complete implementation code samples
- Common gotchas and validation steps
- Success indicators
