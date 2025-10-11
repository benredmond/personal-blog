---
sprint_id: S01
sprint_name: Personal Blog Transition - Standalone Project
status: active
start_date: 2025-10-11
target_end_date: 2025-10-15
created: 2025-10-11T02:52:02Z
last_updated: 2025-10-11T04:35:00Z
completion: 0%
total_tasks: 10
---

# Sprint S01: Personal Blog Transition - Standalone Project

## Sprint Goal
Extract blog from chinese-bot and create a standalone Next.js personal blog project at `~/dev/personal-blog/`. Deploy as completely independent application with MongoDB backend, markdown rendering, and comprehensive SEO infrastructure.

## Key Deliverables
1. **Standalone project setup** - Initialize separate Next.js app and extract components (T00 series)
2. **MongoDB backend** - Implement API with markdown rendering and image support (T01)
3. **Personal branding** - Author bio, header, social share components (T02)
4. **SEO foundation** - OpenGraph/Twitter Cards for social sharing (T05)
5. **Content discovery** - RSS feed and sitemap (T06)
6. **Independent deployment** - Standalone Vercel project with custom domain (T04)

## Strategic Context
**User Decision**: Standalone project (confirmed 2025-10-11)
- Complete independence from chinese-bot codebase
- Separate GitHub repository and Vercel deployment
- Own domain or subdomain (e.g., benredmond.com)
- NO subdomain routing complexity (no middleware)
- Easier to maintain and iterate independently

**Implementation Strategy**: Project extraction and enhancement
- Extract blog components from chinese-bot (42 passing tests, 9/10 design)
- Duplicate Neo-Bauhaus design system (~600 lines CSS)
- Simple JSON file backend (version controlled, no external dependencies)
- Add markdown rendering with image support
- Implement comprehensive SEO infrastructure
- 3 days work for complete standalone setup

## Current State
**Source Components** (in chinese-bot) ✅:
- Complete blog UI components (BlogPostCard, BlogListing, EmptyState)
- Blog listing and detail pages (pages/blog/)
- Neo-Bauhaus L-Frame design with vermilion borders
- Typography system (720px max-width, optimized reading)
- 42 passing tests with 100% coverage

**Target Project** (~/dev/personal-blog/) ⚪:
- Empty directory ready for standalone project
- Will receive extracted components from chinese-bot
- Separate git repository
- Independent Vercel deployment

**Required Implementations** ❌:
- Standalone Next.js project initialization
- Component extraction from chinese-bot
- Design system duplication
- JSON file backend with markdown rendering
- Personal branding (author bio, header, social share buttons)
- SEO/OpenGraph meta tags
- RSS feed and sitemap
- Separate deployment configuration

## Tasks

### Phase 0: Project Extraction (Day 1 - 5-7h)
- [ ] [T00_S01_Initialize_Standalone_Project.md](T00_S01_Initialize_Standalone_Project.md) - Initialize Next.js project (1h) **CRITICAL**
- [ ] [T00_S02_Extract_Blog_Components.md](T00_S02_Extract_Blog_Components.md) - Extract components from chinese-bot (2-3h) **CRITICAL**
- [ ] [T00_S03_Duplicate_Design_System.md](T00_S03_Duplicate_Design_System.md) - Duplicate Neo-Bauhaus CSS (1-2h)
- [ ] [T00_S04_Git_Repo_Deployment.md](T00_S04_Git_Repo_Deployment.md) - Set up git repo and Vercel (1h)

### Phase 1: Backend & Content (Day 2 - 6-8h)
- [ ] [T01_S01_Backend_API_Implementation.md](T01_S01_Backend_API_Implementation.md) - JSON API + markdown rendering (3-4h) **CRITICAL**
- [ ] [T02_S01_Personal_Branding_Content.md](T02_S01_Personal_Branding_Content.md) - Author bio, header, social share (3-4h)

### Phase 2: SEO & Infrastructure (Day 3 - 5-9h)
- [ ] [T05_S01_SEO_OpenGraph_Implementation.md](T05_S01_SEO_OpenGraph_Implementation.md) - OpenGraph/Twitter Cards (3-4h) **CRITICAL**
- [ ] [T06_S01_RSS_Feed_Sitemap.md](T06_S01_RSS_Feed_Sitemap.md) - RSS feed and sitemap (2-3h)
- [ ] [T03_S01_Visual_Identity_Updates.md](T03_S01_Visual_Identity_Updates.md) - Visual identity (1-2h) **OPTIONAL**

### Phase 3: Deployment (Day 4 - 1-2h)
- [ ] [T04_S01_Standalone_Deployment.md](T04_S01_Standalone_Deployment.md) - Production deployment (1-2h)

## Success Metrics

### Technical
- [ ] Standalone project at ~/dev/personal-blog/ fully functional
- [ ] JSON file backend working with markdown rendering
- [ ] Blog posts version controlled in git (data/blog-posts.json)
- [ ] Images in markdown display correctly
- [ ] Blog listing and detail pages load without errors
- [ ] Personal branding clear (author bio, header, navigation)
- [ ] Production URL accessible (custom domain or Vercel subdomain)
- [ ] Mobile responsive
- [ ] Page load < 3s
- [ ] Tests passing (42 tests migrated from chinese-bot)

### SEO & Discovery (NEW)
- [ ] OpenGraph tags present on all pages
- [ ] LinkedIn/Twitter share previews look professional
- [ ] RSS feed accessible at `/api/feed.xml`
- [ ] Sitemap generated at `/sitemap.xml`
- [ ] Search engines can discover content

### Content Distribution
- [ ] Social share buttons functional (Twitter, LinkedIn, Copy URL)
- [ ] Author bio displays with organic Koucai mention
- [ ] Navigation links work correctly

## Timeline

### Revised After User Direction Change (2025-10-11 05:00 UTC)
- **Day 1 (Project Extraction)**: Initialize + extract + design system (5-7h)
  - T00_S01: Initialize Next.js (1h)
  - T00_S02: Extract components (2-3h)
  - T00_S03: Duplicate design system (1-2h)
  - T00_S04: Git repo + initial deployment (1h)

- **Day 2 (Backend & Content)**: JSON backend + branding (6-8h)
  - T01_S01: JSON API + markdown rendering (3-4h) **CRITICAL**
  - T02_S01: Personal branding + social share (3-4h)

- **Day 3 (SEO & Infrastructure)**: SEO + RSS/Sitemap (5-9h)
  - T05_S01: SEO/OpenGraph (3-4h) **CRITICAL**
  - T06_S01: RSS/Sitemap (2-3h)
  - T03_S01: Visual identity (1-2h) **OPTIONAL**

- **Day 4 (Deployment)**: Production deployment (1-2h)
  - T04_S01: Standalone deployment (1-2h)

- **Total Estimate**: 3 days (17-26 hours, or 16-24h if skip T03)

### Why Timeline Extended (vs Original Plan)
1. **Standalone extraction** (+5-7h) - Project setup, component extraction, design system duplication
2. **Simple JSON backend** (3-4h) - Faster than MongoDB, includes markdown rendering
3. **SEO/OpenGraph** (3-4h) - Critical gap discovered via validation research
4. **RSS/Sitemap** (2-3h) - Standard blog infrastructure

Original in-place transformation estimate was 2-3 days (15-23h). Standalone approach adds extraction overhead but provides complete independence and simplicity (no external database).

## Content Strategy (Post-Launch)
**Frequency**: Monthly blog posts
**Topics**:
- AI coding techniques
- Product building with AI
- Case studies (using Koucai as examples)
- Thought pieces on AI-assisted development

**Koucai Mentions**: Organic context only
- Author bio: "Currently building koucai.chat"
- Natural references in case studies
- No promotional "check out Koucai!" language

**Content Management**: Edit JSON file in VS Code
- User will edit `data/blog-posts.json` directly in VS Code
- Content version controlled with code in git
- Markdown content with image support
- No admin UI needed

**Next Posts** (3-month plan):
1. ✅ "AI Changes Everything: Thinking vs Doing" (exists)
2. "Orchestrating AI Agents: Lessons from Building a Production App"
3. "When AI Fails: The Dictionary That Took 16 Iterations"

## References
- **Validation research**: `.simone/research_personal_blog_validation.md` (comprehensive gap analysis)
- **Source components**: `~/dev/chinese-bot/frontend/components/blog/`, `~/dev/chinese-bot/frontend/pages/blog/`
- **Target project**: `~/dev/personal-blog/`

## Key Decisions
1. **Standalone project** (2025-10-11 04:35 UTC) - Separate from chinese-bot
2. **No subdomain routing** (2025-10-11 04:35 UTC) - Independent deployment
3. **JSON file backend** (2025-10-11 05:00 UTC) - Simple, version controlled, no external dependencies
4. **Markdown rendering** (2025-10-11 04:35 UTC) - With image support
5. **User handles content** (2025-10-11 04:35 UTC) - Direct JSON editing in VS Code

## Update History
- **2025-10-11 05:00 UTC**: Switched to JSON file backend (simpler, version controlled, user preference)
- **2025-10-11 05:00 UTC**: Reduced T01 estimate from 5-7h to 3-4h (JSON vs MongoDB)
- **2025-10-11 05:00 UTC**: Updated total estimate to 3 days (17-26h)
- **2025-10-11 04:35 UTC**: Major restructure - changed to standalone project approach
- **2025-10-11 04:35 UTC**: Added T00 extraction series (4 tasks)
- **2025-10-11 04:35 UTC**: Replaced T04 subdomain routing with standalone deployment
- **2025-10-11 04:10 UTC**: Added T05 (SEO/OpenGraph) and T06 (RSS/Sitemap) after validation research
