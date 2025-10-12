---
task_id: T01_S01
sprint_id: S01
status: open
priority: critical
complexity: Medium
estimated_hours: 3-4
created: 2025-10-11T02:52:02Z
updated: 2025-10-11T05:00:00Z
depends_on: [T00_S02]
blocks: [T02_S01, T03_S01, T05_S01, T06_S01]
---

# Task: Implement JSON Backend API with Markdown Rendering

## Description
Create the backend infrastructure for the personal blog using a simple JSON file for content storage and markdown rendering with image support. The blog will store full markdown content in `data/blog-posts.json` and render it dynamically with proper image handling.

## Goal / Objectives
- Create JSON file for blog post storage
- Implement API endpoints for blog posts and individual post retrieval
- Enable pagination for blog listing
- Implement markdown rendering with image support on blog detail pages
- Make blog listing and detail pages fully functional

## Acceptance Criteria
- [ ] File `data/blog-posts.json` created with proper schema
- [ ] API endpoint `/api/blog/posts` returns paginated data
- [ ] API endpoint `/api/blog/posts/[slug]` returns single post with full markdown
- [ ] Markdown rendering implemented on `pages/blog/[slug].jsx`
- [ ] Images in markdown render correctly (local and remote URLs)
- [ ] Pagination works correctly (page and limit query params)
- [ ] Response format matches frontend expectations
- [ ] Schema validation prevents malformed data
- [ ] Error handling implemented with helpful messages
- [ ] Blog listing page loads without errors
- [ ] Blog detail page renders markdown content with styling

## Conversation Insights

### File References
- `pages/blog/index.jsx` - Blog listing page calling API
- `pages/blog/[slug].jsx` - Blog detail page (needs markdown rendering)
- `pages/api/blog/posts.js` - API endpoint for list (TO BE CREATED)
- `pages/api/blog/posts/[slug].js` - API endpoint for single post (TO BE CREATED)
- `data/blog-posts.json` - JSON data storage (TO BE CREATED)

### Test Results & Context
- Blog currently shows empty state (expected, no data yet)
- Frontend expects response format: `{ posts: [...], total: N }`
- 42 existing tests pass for blog components
- User will handle content creation (editing JSON file directly)

### Key Decisions
- **JSON file backend**: Simple, version controlled, no external dependencies
- **Markdown rendering**: react-markdown with GitHub Flavored Markdown
- **Keep Neo-Bauhaus design**: 9/10 rating, extracted in T00_S03
- **Standalone project**: Separate from chinese-bot, deployed independently
- **User handles content**: User will edit JSON file directly in VS Code

## Technical Guidance

### JSON Schema
```json
// data/blog-posts.json
[
  {
    "id": "1",
    "slug": "example-post",
    "title": "Example Blog Post",
    "excerpt": "Short description for listing page (2-3 sentences)",
    "content": "# Full Markdown Content\n\nWith **formatting** and ![images](/images/blog/example.jpg)",
    "author": "Ben Redmond",
    "category": "AI Coding",
    "tags": ["AI", "software engineering"],
    "coverImage": "/images/blog/cover.jpg",
    "date": "2025-10-11T00:00:00Z",
    "readTime": 5
  }
]
```

### Required Dependencies
```bash
npm install react-markdown remark-gfm rehype-raw rehype-sanitize
```

- `react-markdown`: Markdown rendering component
- `remark-gfm`: GitHub Flavored Markdown support (tables, strikethrough, etc.)
- `rehype-raw`: Allow HTML in markdown (for images)
- `rehype-sanitize`: Sanitize HTML to prevent XSS

### Implementation Files

**File 1**: `data/blog-posts.json`
```json
[
  {
    "id": "1",
    "slug": "welcome-to-my-blog",
    "title": "Welcome to My Blog",
    "excerpt": "Starting a personal blog about AI coding techniques and building with frontier AI. First post: why I'm writing and what to expect.",
    "content": "# Welcome to My Blog\n\nI'm starting this blog to share my experiences building with AI, coding techniques, and lessons learned shipping real products.\n\n## What to Expect\n\n- Monthly posts about AI-assisted development\n- Case studies from building real products\n- Honest takes on what works (and what doesn't)\n\nCurrently building [koucai.chat](https://koucai.chat) - a Chinese learning app.\n\nMore posts coming soon.",
    "author": "Ben Redmond",
    "category": "Meta",
    "tags": ["blogging", "AI"],
    "date": "2025-10-11T00:00:00Z",
    "readTime": 2
  }
]
```

**File 2**: `pages/api/blog/posts.js`
```javascript
// ABOUTME: Blog posts API endpoint returning paginated posts from JSON file
// ABOUTME: Implements pagination, schema validation, and error handling for blog listing page

import posts from '../../../data/blog-posts.json';

// Schema validation (prevents data structure drift)
const REQUIRED_FIELDS = ['id', 'title', 'slug', 'excerpt', 'category', 'date', 'readTime', 'author'];

function validatePost(post) {
  const missing = REQUIRED_FIELDS.filter(f => !post[f]);
  if (missing.length) {
    throw new Error(`Post "${post.title || post.id || 'unknown'}" missing fields: ${missing.join(', ')}`);
  }
  return post;
}

export default function handler(req, res) {
  try {
    const { page = '1', limit = '12' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Validate pagination params
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: 'Invalid limit parameter (1-100)' });
    }

    // Validate all posts have required fields (fail fast)
    const validatedPosts = posts.map(validatePost);

    // Sort by date (newest first)
    const sortedPosts = [...validatedPosts].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate pagination
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedPosts = sortedPosts.slice(start, end);

    // Return response matching frontend expectations (exclude content from listing)
    res.status(200).json({
      posts: paginatedPosts.map(({ content, ...post }) => post),
      total: validatedPosts.length
    });
  } catch (error) {
    console.error('Blog API error:', error);
    res.status(500).json({
      error: 'Failed to load blog posts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

**File 3**: `pages/api/blog/posts/[slug].js`
```javascript
// ABOUTME: Single blog post API endpoint by slug
// ABOUTME: Returns full post including markdown content

import posts from '../../../../data/blog-posts.json';

export default function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug parameter is required' });
  }

  try {
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error('Blog post fetch error:', error);
    res.status(500).json({
      error: 'Failed to load blog post',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

**File 4**: Update `pages/blog/[slug].jsx` to add markdown rendering
```javascript
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/blog/posts/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setPost(data.post);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!post) return <div className="not-found">Post not found</div>;

  return (
    <>
      <Head>
        <title>{post.title} - Ben Redmond</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <article className="blog-post max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="text-gray-600 flex gap-4">
            <span>{post.author}</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
            <span>{post.readTime} min read</span>
          </div>
        </header>

        <div className="prose prose-lg">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              // Custom image rendering
              img: ({ node, ...props }) => (
                <img
                  {...props}
                  loading="lazy"
                  className="rounded-lg shadow-md my-8"
                  alt={props.alt || ''}
                />
              ),
              // Custom link rendering (external links open in new tab)
              a: ({ node, ...props }) => {
                const isExternal = props.href?.startsWith('http');
                return (
                  <a
                    {...props}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                  />
                );
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </>
  );
}
```

**File 5**: Add markdown styles to `styles/globals.css`
```css
/* Markdown content styling */
.prose {
  color: #1a1a1a;
  line-height: 1.75;
}

.prose h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose h2 {
  font-size: 1.875rem;
  font-weight: 600;
  margin-top: 1.75rem;
  margin-bottom: 0.875rem;
}

.prose h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}

.prose code {
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'Courier New', monospace;
}

.prose pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.prose a {
  color: #0052cc;
  text-decoration: underline;
}

.prose a:hover {
  color: #ff3a2d;
}

.prose ul, .prose ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.prose li {
  margin: 0.5rem 0;
}

.prose blockquote {
  border-left: 4px solid #ff3a2d;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #666;
}

.prose img {
  max-width: 100%;
  height: auto;
}
```

## Before Starting
- [ ] T00_S02 completed (blog components extracted)
- [ ] Create `data/` directory in project root
- [ ] Have markdown content ready or use placeholder post above

## Common Gotchas
- JSON file must be importable by Next.js (use `.json` extension)
- Pagination math: ensure edge cases work (empty results, last page)
- Date format: use ISO 8601 strings for consistency
- Response must include both `posts` array AND `total` number
- Content field can be large - exclude from listing API
- Image URLs in markdown: use absolute URLs or public folder paths
- XSS risk: Always use `rehype-sanitize` to sanitize markdown HTML

## Editing Content

To add a new blog post:
1. Open `data/blog-posts.json` in VS Code
2. Add new object to the array:
```json
{
  "id": "2",
  "slug": "my-new-post",
  "title": "My New Post Title",
  "excerpt": "Brief description...",
  "content": "# Full Markdown\n\nYour content here...",
  "author": "Ben Redmond",
  "category": "AI Coding",
  "tags": ["AI", "coding"],
  "date": "2025-10-12T00:00:00Z",
  "readTime": 5
}
```
3. Save and commit to git
4. Push to deploy (Vercel auto-deploys on push)

## Success Indicators
✅ JSON file created with proper schema
✅ Blog listing page loads without errors (empty state if no posts)
✅ Blog detail page renders markdown correctly with styling
✅ Images in markdown display properly
✅ Code blocks render with syntax highlighting
✅ Links work (external links open in new tab)
✅ Pagination works correctly (test with multiple posts)
✅ API responds in < 100ms
✅ Existing 42 tests still pass
✅ No XSS vulnerabilities (markdown is sanitized)

## Dependencies
- **Depends on**: T00_S02 (needs blog components extracted)
- **Blocks**: T02_S01 (personal branding needs working blog)
- **Blocks**: T03_S01 (visual updates need functional blog)
- **Blocks**: T05_S01 (SEO needs working blog posts)
- **Blocks**: T06_S01 (RSS feed needs working API)

## Related References
- react-markdown docs: https://github.com/remarkjs/react-markdown
- remark-gfm (GitHub Flavored Markdown): https://github.com/remarkjs/remark-gfm
- Next.js API routes: https://nextjs.org/docs/pages/building-your-application/routing/api-routes
