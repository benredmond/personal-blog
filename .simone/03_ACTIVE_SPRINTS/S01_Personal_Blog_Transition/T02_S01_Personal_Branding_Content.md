---
task_id: T02_S01
sprint_id: S01
status: open
priority: high
complexity: Medium
estimated_hours: 3-4
created: 2025-10-11T02:52:02Z
updated: 2025-10-11T04:10:00Z
depends_on: [T01_S01]
---

# Task: Add Personal Branding and Author Components

## Description
Add personal branding components to make it clear this is Ben's personal blog, not a Koucai product blog. Create AuthorBio and BlogHeader components, add social share buttons for content distribution, and update page metadata to reflect personal brand positioning.

## Goal / Objectives
- Create AuthorBio component with organic Koucai mention
- Create BlogHeader component with personal navigation
- Add social share buttons (Twitter, LinkedIn, Copy URL)
- Update blog page metadata (title, description)
- Update EmptyState messaging
- Ensure branding feels personal, not corporate

## Acceptance Criteria
- [ ] `AuthorBio.jsx` component created and displays at bottom of posts
- [ ] `BlogHeader.jsx` component created with personal navigation
- [ ] Social share buttons added to blog detail page (Twitter, LinkedIn, Copy URL)
- [ ] Blog listing page title: "Ben Redmond - AI Coding & Product Building"
- [ ] Blog listing description: "Thoughts on building with frontier AI..."
- [ ] EmptyState updated: "More posts coming soon" (no admin link)
- [ ] Author bio mentions Koucai organically (not promotional)
- [ ] Components follow ABOUTME documentation pattern
- [ ] Components responsive on mobile
- [ ] Social sharing tested on Twitter and LinkedIn
- [ ] Tests created for new components

## Conversation Insights

### File References
- `pages/blog/index.jsx:79-85` - Metadata to update
- `pages/blog/[slug].jsx` - Where to add AuthorBio
- `components/blog/EmptyState.jsx` - Update messaging
- `components/blog/` - Where to create new components

### Model Recommendations
- Keep Koucai mentions organic: "Currently building koucai.chat"
- Avoid promotional language: No "Check out Koucai!"
- Author bio should be brief (2-3 sentences)
- Header should link to GitHub, LinkedIn, main site

### Key Decisions
- Personal brand focus: AI coding expertise, not Koucai marketing
- Footer mention: Natural context about current project
- Design: Keep Neo-Bauhaus aesthetic (Ben's choice)
- Navigation: Simple links, not complex menu

## Technical Guidance

### Component 1: AuthorBio.jsx

**Location**: `components/blog/AuthorBio.jsx`

```jsx
// ABOUTME: Author bio component for personal blog with organic Koucai mention
// ABOUTME: Displays Ben's identity and current projects naturally

import React from 'react';
import styles from './AuthorBio.module.css';

export default function AuthorBio() {
  return (
    <div className={styles.authorBio}>
      <h3 className={styles.heading}>About Ben</h3>
      <p className={styles.bio}>
        Builder and software engineer exploring frontier AI coding techniques.
        Currently building{' '}
        <a href="https://koucai.chat" className={styles.link}>
          koucai.chat
        </a>
        , a Chinese learning app. Writing monthly about AI-assisted development
        and product building.
      </p>
      <div className={styles.links}>
        <a href="https://github.com/benredmond" className={styles.socialLink}>
          GitHub
        </a>
        <a href="https://linkedin.com/in/benredmond" className={styles.socialLink}>
          LinkedIn
        </a>
      </div>
    </div>
  );
}
```

**Styles**: `components/blog/AuthorBio.module.css`
```css
.authorBio {
  margin-top: var(--ma-lg);
  padding: var(--ma-md);
  border-top: 1px solid var(--color-gray-300);
}

.heading {
  font-size: var(--font-size-lg);
  margin-bottom: var(--ma-sm);
}

.bio {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--ma-sm);
}

.link {
  color: var(--color-vermilion);
  text-decoration: underline;
}

.links {
  display: flex;
  gap: var(--ma-md);
}

.socialLink {
  color: var(--color-ultramarine);
  text-decoration: none;
}

.socialLink:hover {
  text-decoration: underline;
}
```

### Component 2: BlogHeader.jsx

**Location**: `components/blog/BlogHeader.jsx`

```jsx
// ABOUTME: Personal blog header with navigation and branding
// ABOUTME: Links to main site, blog, and social profiles

import React from 'react';
import Link from 'next/link';
import styles from './BlogHeader.module.css';

export default function BlogHeader() {
  return (
    <header className={styles.blogHeader}>
      <div className={styles.container}>
        <h1 className={styles.title}>Ben Redmond</h1>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/blog" className={styles.navLink}>
            Blog
          </Link>
          <a
            href="https://github.com/benredmond"
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/benredmond"
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </nav>
      </div>
    </header>
  );
}
```

**Styles**: `components/blog/BlogHeader.module.css`
```css
.blogHeader {
  border-bottom: 2px solid var(--color-gray-200);
  margin-bottom: var(--ma-lg);
  padding: var(--ma-md) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ma-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin: 0;
}

.nav {
  display: flex;
  gap: var(--ma-md);
}

.navLink {
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: 500;
}

.navLink:hover {
  color: var(--color-vermilion);
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: var(--ma-sm);
    text-align: center;
  }
}
```

### Integration Points

**Add to blog listing page** (`pages/blog/index.jsx`):
```jsx
import BlogHeader from '../../components/blog/BlogHeader';

// Update metadata
<Head>
  <title>Ben Redmond - AI Coding & Product Building</title>
  <meta
    name="description"
    content="Thoughts on building with frontier AI, coding techniques, and shipping real products."
  />
</Head>

// Add header before MasterGrid
<BlogHeader />
<MasterGrid>
  {/* existing content */}
</MasterGrid>
```

**Add to blog detail page** (`pages/blog/[slug].jsx`):
```jsx
import BlogHeader from '../../components/blog/BlogHeader';
import AuthorBio from '../../components/blog/AuthorBio';

// Add header at top
<BlogHeader />

// Add author bio after post content
<article className={styles.post}>
  {/* post content */}
</article>
<AuthorBio />
```

**Update EmptyState** (`components/blog/EmptyState.jsx`):
```jsx
<EmptyState
  message="More posts coming soon"
  action={null}  // Remove admin link
/>
```

### Component 3: Social Share Buttons

**Location**: `components/blog/SocialShare.jsx` (NEW)

```jsx
// ABOUTME: Social sharing buttons for blog posts
// ABOUTME: Enables sharing to Twitter, LinkedIn, and copying post URL

import React, { useState } from 'react';
import styles from './SocialShare.module.css';

export default function SocialShare({ post, url }) {
  const [copied, setCopied] = useState(false);

  const shareToTwitter = () => {
    const text = `${post.title} by Ben Redmond`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.socialShare}>
      <p className={styles.label}>Share this post:</p>
      <div className={styles.buttons}>
        <button
          onClick={shareToTwitter}
          className={styles.shareButton}
          aria-label="Share on Twitter"
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter
        </button>
        <button
          onClick={shareToLinkedIn}
          className={styles.shareButton}
          aria-label="Share on LinkedIn"
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
          </svg>
          LinkedIn
        </button>
        <button
          onClick={copyToClipboard}
          className={`${styles.shareButton} ${copied ? styles.copied : ''}`}
          aria-label="Copy URL"
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {copied ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )}
          </svg>
          {copied ? 'Copied!' : 'Copy URL'}
        </button>
      </div>
    </div>
  );
}
```

**Styles**: `components/blog/SocialShare.module.css`
```css
.socialShare {
  margin-top: var(--ma-lg);
  padding: var(--ma-md);
  border-top: 1px solid var(--color-gray-300);
  border-bottom: 1px solid var(--color-gray-300);
}

.label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--ma-sm);
}

.buttons {
  display: flex;
  gap: var(--ma-sm);
  flex-wrap: wrap;
}

.shareButton {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 4px;
  background: white;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shareButton:hover {
  background: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.shareButton.copied {
  background: var(--color-matcha);
  color: white;
  border-color: var(--color-matcha);
}

.icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .buttons {
    flex-direction: column;
  }

  .shareButton {
    width: 100%;
    justify-content: center;
  }
}
```

**Integration** (`pages/blog/[slug].jsx`):
```jsx
import SocialShare from '../../components/blog/SocialShare';

// Add after ReactMarkdown and before AuthorBio
<ReactMarkdown>
  {post.content}
</ReactMarkdown>

<SocialShare post={post} url={`https://yourdomain.com/${post.slug}`} />

<AuthorBio />
```

## Before Starting
- [ ] Review existing component patterns in `components/blog/`
- [ ] Check design system variables in `styles/`
- [ ] Ensure Next.js Link component import available
- [ ] Review Ma spacing principles for consistency

## Common Gotchas
- Don't forget ABOUTME comments (2 lines)
- Use Next.js Link for internal links, <a> for external
- Mobile responsiveness: test header on small screens
- CSS modules: import and use styles object
- Social links: add target="_blank" rel="noopener noreferrer"

## Success Indicators
✅ AuthorBio displays at bottom of blog post detail page
✅ BlogHeader displays at top of blog pages
✅ Social share buttons display between post content and author bio
✅ Twitter share opens with pre-filled text
✅ LinkedIn share opens correctly
✅ Copy URL works and shows "Copied!" feedback
✅ Koucai mention feels organic (not promotional)
✅ Navigation links work correctly
✅ Mobile responsive (header stacks, share buttons stack)
✅ Page metadata updated to personal brand
✅ EmptyState no longer shows admin link
✅ Components follow existing design system

## Testing Checklist
- [ ] Test AuthorBio renders correctly
- [ ] Test BlogHeader navigation links
- [ ] Test Twitter share button (opens popup with correct text)
- [ ] Test LinkedIn share button (opens popup)
- [ ] Test Copy URL button (copies to clipboard, shows "Copied!")
- [ ] Test mobile responsiveness (all components)
- [ ] Test Koucai link works
- [ ] Test social links open in new tab
- [ ] Verify metadata in <Head>
- [ ] Check EmptyState message

## Dependencies
- **Depends on**: T01_S01 (needs working blog to add components)
- **Blocks**: T04_S01 (deployment needs complete branding)

## Related References
- Design system: `styles/`
- Existing components: `components/blog/`
- Standalone project context: Extracted from chinese-bot in T00_S02
