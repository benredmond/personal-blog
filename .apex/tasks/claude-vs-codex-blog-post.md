---
id: claude-vs-codex-blog-post
phase: implement
created: 2026-01-03
updated: 2026-01-03T22:07:24Z
---

# Task: Claude vs Codex Blog Post with Interactive Components

**Status**: Plan Complete
**Created**: 2026-01-03

## Overview

Create a blog post for "Claude vs Codex in the Messy Middle" with two custom interactive components:
1. **Transcript Viewer** - Tabbed viewer for Claude/Codex transcripts with annotations
2. **Poll Component** - "Who won?" voting with persistent storage

Source: `/Users/ben/Documents/Main Vault/Projects/blog/Claude vs Codex in the Messy Middle.md`

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component integration | ReactMarkdown `components` prop | No MDX migration, works with existing stack |
| Thinking segments | Hidden by default (toggle) | Matches agentexport pattern |
| Poll anti-abuse | Cookie-based | Simple, sufficient for personal blog |
| Poll options | Lowercase IDs with label mapping | API uses `claude`, component displays `Claude` |
| Asset storage | Committed to repo (`/data`) | Versioned, no runtime fetch complexity |
| Poll storage | Vercel KV | Hosted on Vercel, works with ISR |
| Transcript format | JSONL per agentexport | Reuse existing parsing logic |
| Transcript loading | All-at-once (build-time) | Simpler than lazy-load, 300-600KB acceptable |
| Side-by-side view | Full .md content | User preference |
| Annotations UX | Inline callouts (always visible) | Users won't click; annotations are part of prose |
| TranscriptViewer aesthetic | Dark terminal embed | "Feel like reading from the terminal itself" |
| TranscriptViewer view modes | Tabs (default) + H2H side-by-side toggle | True head-to-head comparison |
| Tab switching | Instant (no animation) | Terminal-authentic |
| Scroll behavior | Independent scroll in H2H mode | Simpler, user controls positioning |
| PlanComparison aesthetic | Light (Strata native) | Documents/artifacts vs live transcripts; creates visual rhythm |
| Poll results | Show only after voting | Unbiased voting, satisfying reveal |
| Poll tone | Playful ("So, who won?") | Fun cap to article, not formal survey |

---

## Visual Design Specifications

**Design Session**: 2026-01-03
**Design Direction**: Dark terminal for transcripts, light Strata for documents, playful poll

### Article Flow (Visual Rhythm)

```
┌─────────────────────────────────────────────────────────────┐
│  LIGHT: Prose (hook, setup)                                 │
│         Strata styling, vermilion underlines                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  DARK: TranscriptViewer (Research Phase)                    │
│        Terminal aesthetic, inline annotations               │
│        [Tabs] or [H2H] toggle                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  LIGHT: Brief prose transition                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  DARK: TranscriptViewer (Planning Phase)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  LIGHT: PlanComparison                                      │
│         Side-by-side documents, breakout width              │
│         "Here's what they produced"                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  LIGHT: Brief prose transition                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  DARK: TranscriptViewer (Review Phase)                      │
│        The drama—Codex finds bugs, Claude concedes          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  LIGHT: Scorecard table + Poll                              │
│         Playful close, vermilion accents                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  LIGHT: "The Bigger Insight" prose                          │
│         Tease for future article                            │
└─────────────────────────────────────────────────────────────┘
```

**Design rationale**: Dark sections = "you're in the terminal with me." Light sections = "stepping back to reflect." The rhythm creates natural sections without explicit dividers.

---

### 1. TranscriptViewer Component

#### Color Palette (Dark Mode)

```css
/* Backgrounds */
--tv-bg:              #0d1117;  /* GitHub dark, familiar to devs */
--tv-surface:         #161b22;  /* Message bubbles */
--tv-border:          #30363d;  /* Subtle structure */

/* Text */
--tv-text-primary:    #e6edf3;  /* High contrast */
--tv-text-secondary:  #8b949e;  /* Labels, metadata */

/* Role colors (adapted for dark) */
--tv-role-user:       #58a6ff;  /* Soft blue */
--tv-role-assistant:  #e6edf3;  /* Default text */
--tv-role-thinking:   #a371f7;  /* Purple */
--tv-role-tool:       #8b949e;  /* Muted */

/* Accents */
--tv-vermilion:       #ff6b5b;  /* Warmer on dark */
--tv-vermilion-high:  #ff3a2d;  /* High emphasis */
```

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ☐ Thinking  ☐ Tool calls                        ┌──────┬──────┐      │
│   ↑ checkboxes, muted                             │ Tabs │ H2H  │      │
│                                                   └──────┴──────┘      │
│                                                   ↑ segmented control   │
│   Claude    Codex                                   vermilion active    │
│   ═══════                                                               │
│   ↑ 2px vermilion (active tab indicator)                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─ user ────────────────────────────────────────────────────────────┐ │
│   │                                                                   │ │
│   │  Research the best approach for adding semantic vector search     │ │
│   │  to my APEX MCP server...                                         │ │
│   │                                                                   │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│   ┌─ assistant ───────────────────────────────────────────────────────┐ │
│   │                                                                   │ │
│   │  I'll analyze the options for semantic search. Let me start by    │ │
│   │  researching embedding providers...                               │ │
│   │                                                                   │ │
│   │  For MongoDB Atlas Vector Search, you have several embedding      │ │
│   │  options:                                                         │ │
│   │                                                                   │ │
│   │  1. **Voyage AI** - Anthropic's recommended embedding partner     │ │
│   │                                                                   │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│   ┌─ ✦ ───────────────────────────────────────────────────────────────┐ │
│   │                                                                   │ │
│   │  Claude citing "Anthropic's recommended partner" as a selling     │ │
│   │  point 💀                                                         │ │
│   │                                                                   │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│     ↑ annotation: vermilion left border, 8% vermilion bg, sans-serif    │
│                                                                         │
│                        (scrollable, max-height: 600px)                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### H2H (Head-to-Head) Mode

Breakout container (~1100-1200px) with side-by-side transcripts:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ☐ Thinking  ☐ Tool calls                              ┌──────┬──────┐    │
│                                                         │ Tabs │ H2H  │    │
│                                                         └──────┴──────┘    │
│                                                                             │
├──────────────────────────────────┬──────────────────────────────────────────┤
│          CLAUDE                  │            CODEX                         │
│          ══════                  │            ═════                         │
├──────────────────────────────────┼──────────────────────────────────────────┤
│                                  │                                          │
│  ┌─ user ─────────────────────┐  │  ┌─ user ─────────────────────┐          │
│  │ Research the best approach │  │  │ Research the best approach │          │
│  │ for vector search...       │  │  │ for vector search...       │          │
│  └────────────────────────────┘  │  └────────────────────────────┘          │
│                                  │                                          │
│  ┌─ assistant ────────────────┐  │  ┌─ assistant ────────────────┐          │
│  │ I'll analyze the options   │  │  │ Let me investigate the     │          │
│  │ for semantic search...     │  │  │ requirements for semantic  │          │
│  └────────────────────────────┘  │  │ search in your codebase... │          │
│                                  │  └────────────────────────────┘          │
│  ┌─ ✦ ────────────────────────┐  │                                          │
│  │ Claude citing "Anthropic's │  │                                          │
│  │ recommended partner" 💀    │  │                                          │
│  └────────────────────────────┘  │                                          │
│                                  │                                          │
│         (independent scroll)     │          (independent scroll)            │
│                                  │                                          │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

- **Width**: Breakout to ~1100-1200px (beyond 720px content column)
- **Scroll**: Independent per column
- **Availability**: ≥1200px viewports only; falls back to Tabs on narrow

#### Annotations (Always Visible)

Annotations appear as inline callout blocks directly below annotated messages:

```css
.annotation {
  margin: 12px 0 16px 0;
  padding: 12px 16px;
  background: rgba(255, 107, 91, 0.08);  /* vermilion at 8% */
  border-left: 3px solid #ff6b5b;
  font-family: var(--font-sans-en);       /* NOT monospace - author voice */
  font-size: 15px;
  line-height: 1.5;
  color: #e6edf3;
}

.annotation::before {
  content: '✦';
  margin-right: 8px;
  color: #ff6b5b;
}
```

**Key details**:
- Sans-serif font distinguishes author voice from transcript
- Always visible (no click required)—annotations are part of the prose
- Works in both Tabs and H2H modes

#### Code Blocks Within Transcripts

```css
.message pre {
  background: #0d1117;           /* Darker than message surface */
  padding: 12px 16px;
  font-family: 'Geist Mono', monospace;
  font-size: 13px;               /* Slightly smaller than message text */
  overflow-x: auto;              /* Horizontal scroll for wide code */
  border: 1px solid #30363d;
}
```

- No syntax highlighting (transcript is already dense)
- Horizontal scroll if code is wide (no wrapping)

#### Typography

```css
/* Inside terminal */
font-family: 'Geist Mono', monospace;
font-size: 14px;
line-height: 22px;

/* Role labels */
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
```

#### Container Integration

```css
.transcriptViewer {
  margin: 48px 0;                /* var(--ma-3) */
  max-height: 600px;
  overflow-y: auto;
  background: #0d1117;
  /* Sharp corners - maintains Strata geometry */
}
```

#### Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| ≥1200px | H2H toggle available, breakout container |
| 768-1199px | Tabs only, standard width |
| <768px | Tabs only, full-width |

---

### 2. PlanComparison Component

Light (Strata native) - documents/artifacts feel different from live transcripts.

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Claude's Plan                         Codex's Plan                        │
│   ─────────────                         ────────────                        │
│        ↑ vermilion 2px                       ↑ vermilion 2px                │
│                                                                             │
├────────────────────────────────────┬────────────────────────────────────────┤
│                                    │                                        │
│  # Vector Search Implementation    │  # Semantic Search Architecture        │
│                                    │                                        │
│  ## Overview                       │  ## Design Goals                       │
│                                    │                                        │
│  This adds semantic vector         │  1. Fast retrieval (<100ms)            │
│  search to the APEX MCP server...  │  2. Minimal index overhead             │
│                                    │  3. Graceful degradation               │
│  ## Tools                          │                                        │
│                                    │  ## Components                         │
│  Two new MCP tools:                │                                        │
│                                    │  **EmbeddingService**                  │
│  - `apex_semantic_search`          │  Handles vectorization of text...      │
│  - `apex_reindex`                  │                                        │
│                                    │                                        │
│  (rendered markdown, full height)  │  (rendered markdown, full height)      │
│                                    │                                        │
└────────────────────────────────────┴────────────────────────────────────────┘
```

#### Styling

```css
.planComparison {
  background: var(--color-off-white);  /* #fffef9 */
  border: 1px solid var(--color-light-gray);  /* #e8e5e0 */
  margin: 48px auto;
  max-width: 1100px;  /* breakout */
}

.columnHeader {
  font-family: var(--font-sans-en);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-warm-gray);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-vermilion);
  margin-bottom: 24px;
}

.divider {
  width: 1px;
  background: var(--color-light-gray);
}

.planContent {
  font-family: var(--font-sans-en);
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-warm-gray);
}

.planContent pre {
  background: #f6f8fa;  /* light code bg */
  padding: 16px;
  font-size: 14px;
  overflow-x: auto;
}
```

#### Scroll Behavior

**No max-height / no scroll container.** Plans expand to full height—they're documents meant to be read, and side-by-side lets readers scan between them naturally.

#### Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| ≥1024px | Side-by-side, breakout container |
| <1024px | Stacked vertically (Claude first, then Codex) |

---

### 3. Poll Component

Playful but restrained—a fun "so, who ya got?" moment at the end.

#### Pre-Vote State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        So, who won?                             │
│                                                                 │
│     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │
│     │             │   │             │   │             │        │
│     │   Claude    │   │   Codex     │   │    Tie      │        │
│     │             │   │             │   │             │        │
│     └─────────────┘   └─────────────┘   └─────────────┘        │
│                                                                 │
│           ↑ 2px border, vermilion on hover/select               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Post-Vote State (Results)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     Claude                                                      │
│     ████████████████░░░░░░░░░░░░░░░░  38%  (127 votes)         │
│                                                                 │
│     Codex                                              ← yours  │
│     ██████████████████████████░░░░░░  52%  (174 votes)         │
│                                                                 │
│     Tie                                                         │
│     ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  10%  (33 votes)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key details**:
- Results only shown AFTER voting (unbiased)
- Bars animate in from 0% (200ms stagger)
- "← yours" label next to selected option
- Vermilion fill, light gray unfilled

#### Styling

```css
.poll {
  max-width: 480px;
  margin: 48px auto;
  text-align: center;
}

.question {
  font-family: var(--font-sans-en);
  font-size: 21px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--color-warm-gray);
}

.option {
  padding: 16px 32px;
  border: 2px solid var(--color-light-gray);
  background: transparent;
  font-family: var(--font-sans-en);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.option:hover {
  border-color: var(--color-vermilion);
  color: var(--color-vermilion);
}

.option.selected {
  border-color: var(--color-vermilion);
  background: rgba(255, 58, 45, 0.08);
  color: var(--color-vermilion);
}

.resultsBar {
  height: 8px;
  background: var(--color-light-gray);
  margin: 8px 0;
}

.resultsBar .fill {
  height: 100%;
  background: var(--color-vermilion);
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.yourVote {
  font-size: 12px;
  color: var(--color-vermilion);
  margin-left: 8px;
}
```

---

### Design System Consistency

| Element | Strata Token | Notes |
|---------|--------------|-------|
| Vermilion accent | `#ff3a2d` (light) / `#ff6b5b` (dark) | Consistent across all |
| Sharp corners | 0px radius | Maintained everywhere |
| Typography | Geist Sans (prose), Geist Mono (transcripts) | Clear distinction |
| Spacing | 8px grid, 48px between sections | var(--ma-3) |
| Breakout width | ~1100px for H2H and PlanComparison | Consistent |

---

### Design Assessment

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 DESIGN VISION ALIGNMENT                                  │
├─────────────────────────────────────────────────────────────┤
│ Overall Score: 8.5/10                                       │
│                                                             │
│ Strata Consistency:    █████████░ (9/10)                   │
│ Reading Flow:          █████████░ (9/10)                   │
│ Terminal Authenticity: ████████░░ (8/10)                   │
│ Playfulness:           ████████░░ (8/10)                   │
│ Implementation Clarity:█████████░ (9/10)                   │
│                                                             │
│ Verdict: SHIP IT                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Source Files

### Transcripts (Raw JSONL)

**Claude Code sessions:**
| Phase | Session ID | Path |
|-------|------------|------|
| Research | `4dcb7d00-7622-4ae0-93f3-b050ac076b5a` | `~/.claude/projects/-Users-ben-dev-apex/4dcb7d00-7622-4ae0-93f3-b050ac076b5a.jsonl` |
| Plan | `b255c94a-a9fe-4fd6-a420-e1c1996a966f` | `~/.claude/projects/-Users-ben-dev-apex/b255c94a-a9fe-4fd6-a420-e1c1996a966f.jsonl` |
| Review | `4d89ef77-2073-4df9-a18f-92ef4e9a27c2` | `~/.claude/projects/-Users-ben-dev-apex/4d89ef77-2073-4df9-a18f-92ef4e9a27c2.jsonl` |

**Codex CLI sessions:**
| Phase | Session ID | Path |
|-------|------------|------|
| Research | `019b8129-67ed-7c83-aefb-b93308d5fa10` | `~/.codex/sessions/2026/01/02/rollout-2026-01-02T19-02-13-019b8129-67ed-7c83-aefb-b93308d5fa10.jsonl` |
| Plan | `019b817f-2ad0-7dd1-a2ca-ca24cde0480a` | `~/.codex/sessions/2026/01/02/rollout-2026-01-02T20-35-53-019b817f-2ad0-7dd1-a2ca-ca24cde0480a.jsonl` |
| Review | `019b81bf-62fa-77d3-8211-8e225e1fcf33` | `~/.codex/sessions/2026/01/02/rollout-2026-01-02T21-46-02-019b81bf-62fa-77d3-8211-8e225e1fcf33.jsonl` |

### Plan Files (.md)

| Tool | Path |
|------|------|
| Claude | `/Users/ben/dev/apex/.apex/tasks/_d3NcldtrLAotoiCziqQE.md` |
| Codex | `/Users/ben/dev/apex/.apex/tasks/vector-search-md.md` |

---

## Architecture Specifications

### 1. Component Integration via ReactMarkdown

**Approach**: Use `components` prop with closure injection to pass server-loaded data.

```tsx
// app/blog/[slug]/page.tsx
import { loadAllTranscripts, loadPlans } from '@/lib/transcripts';
import TranscriptViewer from '@/components/blog/TranscriptViewer';
import Poll from '@/components/blog/Poll';
import PlanComparison from '@/components/blog/PlanComparison';
import { blogSanitizeSchema } from '@/lib/sanitize-schema';

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  // Load data server-side for this specific post (only if needed)
  const isMessyMiddlePost = slug === 'claude-vs-codex-messy-middle';
  const transcripts = isMessyMiddlePost ? loadAllTranscripts() : null;
  const plans = isMessyMiddlePost ? loadPlans() : null;

  // Load annotations for this post
  const annotations = isMessyMiddlePost ? {
    research: loadAnnotations('research'),
    planning: loadAnnotations('planning'),
    review: loadAnnotations('review'),
  } : null;

  // Create components with injected data via closure
  const components = {
    'transcript-viewer': (props: { phase?: string }) => {
      const phase = props.phase || 'research';
      return (
        <TranscriptViewer
          phase={phase}
          claudeTranscript={transcripts?.[`${phase}-claude`] ?? null}
          codexTranscript={transcripts?.[`${phase}-codex`] ?? null}
          annotations={annotations?.[phase as keyof typeof annotations] ?? []}
        />
      );
    },
    'plan-comparison': () => (
      <PlanComparison
        claudePlan={plans?.claude}
        codexPlan={plans?.codex}
      />
    ),
    'poll': Poll, // Poll fetches its own data client-side
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize(blogSanitizeSchema)]}
      components={components}
    >
      {post.content}
    </ReactMarkdown>
  );
}
```

**Markdown usage**:
```markdown
<transcript-viewer phase="research" />

<plan-comparison />

<poll id="claude-vs-codex" question="Who won?" options="claude,codex,tie" />
```

**Poll label mapping** (in component):
```typescript
const POLL_LABELS: Record<string, string> = {
  claude: 'Claude',
  codex: 'Codex',
  tie: 'Tie',
};
```

---

### 2. Sanitization Schema

**Custom rehype-sanitize schema** to allow interactive component attributes:

```typescript
// lib/sanitize-schema.ts
import { defaultSchema } from 'rehype-sanitize';

export const blogSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'transcript-viewer',
    'poll',
    'plan-comparison',
    'details',
    'summary',
  ],
  attributes: {
    ...defaultSchema.attributes,
    'transcript-viewer': ['phase'],
    'poll': ['id', 'question', 'options'],
    'plan-comparison': [],
    'details': ['open'],
    'summary': [],
    // Preserve data-* attributes for annotations
    '*': [...(defaultSchema.attributes?.['*'] || []), 'data*', 'className'],
  },
};
```

**Transcript text escaping**:
- Transcript content rendered as **plain text** inside the viewer (no markdown parsing)
- **React auto-escapes** text content - do NOT manually encode (avoids double-escaping)
- Simply render: `<span>{message.content}</span>` - React handles `<`, `>`, `&` automatically
- **Do NOT use `dangerouslySetInnerHTML`** - prevents XSS if transcripts contain HTML
- Code blocks within transcripts: wrap in `<pre><code>{content}</code></pre>` (React escapes)

---

### 3. Poll API Architecture

**API Route**: `app/api/poll/[id]/route.ts`

```typescript
import { kv } from '@vercel/kv';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Bypass edge cache - always fetch fresh results
export const dynamic = 'force-dynamic';

// Allowed polls and their options (whitelist)
const POLLS: Record<string, string[]> = {
  'claude-vs-codex': ['claude', 'codex', 'tie'],
};

// GET: Fetch current results (Next.js 15: params is a Promise)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const allowedOptions = POLLS[id];
  if (!allowedOptions) {
    return NextResponse.json({ error: 'Unknown poll' }, { status: 404 });
  }

  const raw = await kv.hgetall<Record<string, string>>(`poll:${id}`) || {};

  // Coerce string values to numbers (KV returns strings)
  const votes: Record<string, number> = {};
  for (const option of allowedOptions) {
    votes[option] = parseInt(raw[option] || '0', 10);
  }

  const cookieStore = await cookies();
  const hasVoted = cookieStore.has(`voted:${id}`);

  return NextResponse.json({ votes, hasVoted });
}

// POST: Submit vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const allowedOptions = POLLS[id];
  if (!allowedOptions) {
    return NextResponse.json({ error: 'Unknown poll' }, { status: 404 });
  }

  const cookieStore = await cookies();

  // Anti-abuse: Check cookie
  if (cookieStore.has(`voted:${id}`)) {
    return NextResponse.json({ error: 'Already voted' }, { status: 429 });
  }

  let body: { option?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { option } = body;

  // Validate option against whitelist
  if (!option || !allowedOptions.includes(option)) {
    return NextResponse.json(
      { error: 'Invalid option', allowed: allowedOptions },
      { status: 400 }
    );
  }

  // Increment vote count
  await kv.hincrby(`poll:${id}`, option, 1);

  // Set voted cookie (1 year expiry)
  const response = NextResponse.json({ success: true });
  response.cookies.set(`voted:${id}`, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
```

**Caching strategy**:
- `dynamic = 'force-dynamic'` enforced at top of file
- Poll results fetched client-side (not cached by ISR)
- Client polls on mount, not on interval (saves KV reads)

---

### 4. Transcript Normalization

**Processing**: Build-time parsing via data loader function.

**File location**: `/data/transcripts/`
```
data/
  transcripts/
    research-claude.jsonl
    research-codex.jsonl
    planning-claude.jsonl
    planning-codex.jsonl
    review-claude.jsonl
    review-codex.jsonl
  plans/
    claude-plan.md
    codex-plan.md
```

**Loader function** (`lib/transcripts.ts`):
```typescript
import fs from 'fs';
import path from 'path';

interface RenderedMessage {
  role: 'user' | 'assistant' | 'tool' | 'system' | 'thinking';
  content: string;
  raw?: string;
  raw_label?: string;
  model?: string;
}

interface Transcript {
  tool: 'Claude Code' | 'Codex';
  model?: string;
  messages: RenderedMessage[];
}

// Build-time only - called from generateStaticParams or page component
export function loadTranscript(phase: string, tool: 'claude' | 'codex'): Transcript {
  const filePath = path.join(process.cwd(), 'data', 'transcripts', `${phase}-${tool}.jsonl`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseJsonl(content, tool);
}
```

**Event type handling**:

| Event Type | Role | Visibility |
|------------|------|------------|
| `user` message | `user` | Always visible |
| `assistant` message | `assistant` | Always visible |
| `thinking` / `reasoning` | `thinking` | Hidden by default, toggle to show |
| `tool_use` | `tool` | Hidden by default, toggle to show |
| `tool_result` | `tool` | Hidden by default, toggle to show |
| `system` | `system` | Hidden (internal only) |

**Loading strategy**: All transcripts loaded at build-time via page props.

- Transcripts parsed from JSONL at build-time in Server Component
- Serialized as JSON props to Client Component (TranscriptViewer)
- Estimated payload: 300-600KB total for 6 transcripts
- Acceptable for long-form article; highly cacheable via ISR

---

### 5. Asset Conventions

**Directory structure**:
```
data/
  blog-posts.json          # Existing blog data
  transcripts/             # New: JSONL transcript files
    research-claude.jsonl
    research-codex.jsonl
    planning-claude.jsonl
    planning-codex.jsonl
    review-claude.jsonl
    review-codex.jsonl
  plans/                   # New: Architecture plan .md files
    claude-plan.md
    codex-plan.md
  annotations/             # New: Author commentary per phase
    research.json
    planning.json
    review.json
```

**Naming convention**: `{phase}-{tool}.jsonl` where:
- `phase`: `research`, `planning`, `review`
- `tool`: `claude`, `codex`

**Deployment bundle inclusion** (required for ISR with `fs.readFileSync`):

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... existing config
  outputFileTracingIncludes: {
    '/blog/[slug]': ['./data/transcripts/**', './data/plans/**', './data/annotations/**'],
  },
};
```

This ensures `data/transcripts/`, `data/plans/`, and `data/annotations/` files are included in the serverless function bundle for ISR revalidation.

**Alternative approach** (if outputFileTracingIncludes causes issues):
- Convert JSONL/MD files to `.ts` modules with `export const` at build-time
- Import directly: `import researchClaude from '@/data/transcripts/research-claude'`
- Bundled automatically by webpack, no fs reads needed

**Side-by-side comparison**:
- Load both `.md` files at build-time
- Two-column flex layout (stack on mobile)
- Synchronized scroll via IntersectionObserver (optional enhancement)
- Syntax highlighting via existing code block styling

---

### 6. Testing Scope

**New test files**:

| File | Coverage |
|------|----------|
| `__tests__/components/blog/TranscriptViewer.test.tsx` | Tabs, toggle, message rendering, role styling |
| `__tests__/components/blog/Poll.test.tsx` | Voting, cookie check, results display, error states |
| `__tests__/components/blog/PlanComparison.test.tsx` | Two-column layout, markdown rendering |
| `__tests__/lib/transcripts.test.ts` | JSONL parsing, Claude format, Codex format, edge cases |
| `__tests__/api/poll.test.ts` | GET/POST, cookie handling, KV mocking, unknown poll 404, invalid option 400, invalid JSON 400 |

**Fixtures**:
- Sample JSONL files for both formats in `__tests__/fixtures/`
- Mock KV responses

**A11y requirements**:
- Tab component: keyboard navigation, ARIA roles
- Poll: form labels, button states, results announcement

---

## Research Findings

### Agentexport Transcript Viewer Architecture

Reference: `/Users/ben/dev/agentexport`

**Input JSONL Format - Claude**:
```json
{"type":"assistant","message":{"model":"claude-sonnet-4","content":[{"type":"thinking","thinking":"..."},{"type":"text","text":"..."}]}}
{"type":"user","message":{"content":[{"type":"text","text":"..."}]}}
```

**Input JSONL Format - Codex**:
```json
{"type":"session_meta","payload":{"originator":"codex_cli_rs"}}
{"type":"turn_context","payload":{"model":"gpt-5","cwd":"/test"}}
{"type":"response_item","payload":{"type":"message","role":"assistant","content":[{"type":"output_text","text":"..."}]}}
{"type":"response_item","payload":{"type":"reasoning","summary":[{"type":"summary_text","text":"..."}]}}
```

**Key Rendering Patterns**:
- Toggle filtering: CSS-based show/hide (`:not()` pseudo-class)
- Expandable details: `<details>` element for raw JSON payloads
- Role coloring: Blue for user, black for assistant, purple for thinking
- Styling: Max-width 720px, system font stack, monospace for technical content

---

### Design System Reference

From `StrataPost.module.css`:

- **Vermilion accent**: `#ff3a2d`
- **Ultramarine links**: `#0052cc`
- **Off-white background**: `#fffef9`
- **Content max-width**: 720px
- **Baseline grid**: 8px
- **Typography**: Perfect Fourth scale (1.333)

---

### Vercel KV Setup

1. Vercel Dashboard → Storage → Create KV Database
2. `npm install @vercel/kv`
3. Environment variables auto-configured by Vercel

---

## Open Questions for Planning

1. ~~**Annotations UX**: Inline callouts vs side margin notes vs scroll-triggered tooltips?~~ → **Resolved: Margin notes (wide) / Scroll tooltips (narrow)**
2. ~~**Component styling**: Extend `.prose` namespace or new CSS module?~~ → **Resolved: New CSS module using design tokens**

---

## Implementation Plan

### Phase 1: Data Layer & Infrastructure

#### 1.1 Create Transcript Loader (`lib/transcripts.ts`)

```typescript
// Types matching agentexport's RenderedMessage structure
interface RenderedMessage {
  role: 'user' | 'assistant' | 'tool' | 'thinking' | 'system';
  content: string;
  raw?: string;
  raw_label?: string;
  tool_use_id?: string;
  model?: string;
}

interface Transcript {
  tool: 'Claude Code' | 'Codex';
  model?: string;
  messages: RenderedMessage[];
}

// Build-time loaders
export function loadTranscript(phase: string, tool: 'claude' | 'codex'): Transcript;
export function loadAllTranscripts(): Record<string, Transcript>;
export function loadPlans(): { claude: string; codex: string };
```

**JSONL Parsing** (from agentexport patterns):
- Claude: `{"type":"assistant","message":{"content":[{"type":"text","text":"..."},{"type":"thinking","thinking":"..."}]}}`
- Codex: `{"type":"response_item","payload":{"type":"message","role":"assistant","content":[{"type":"output_text","text":"..."}]}}`

**Files to create:**
- `lib/transcripts.ts` - Loader functions with JSONL parsing
- `lib/transcript-types.ts` - Type definitions (optional, can inline)

#### 1.2 Create Custom Sanitization Schema (`lib/sanitize-schema.ts`)

```typescript
import { defaultSchema } from 'rehype-sanitize';

export const blogSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'transcript-viewer',
    'poll',
    'plan-comparison',
    'details',
    'summary',
  ],
  attributes: {
    ...defaultSchema.attributes,
    'transcript-viewer': ['phase'],
    'poll': ['id', 'question', 'options'],
    'plan-comparison': [],
    'details': ['open'],
    'summary': [],
    '*': [...(defaultSchema.attributes?.['*'] || []), 'data*', 'className'],
  },
};
```

#### 1.3 Update Next.js Config for ISR Bundle

```typescript
// next.config.ts - Add outputFileTracingIncludes
outputFileTracingIncludes: {
  '/blog/[slug]': ['./data/transcripts/**', './data/plans/**', './data/annotations/**'],
},
```

#### 1.4 Create Data Directories

```
data/
  transcripts/
    research-claude.jsonl
    research-codex.jsonl
    planning-claude.jsonl
    planning-codex.jsonl
    review-claude.jsonl
    review-codex.jsonl
  plans/
    claude-plan.md
    codex-plan.md
```

---

### Phase 2: Components

#### 2.1 TranscriptViewer Component

**File:** `components/blog/TranscriptViewer.tsx`

**Props:**
```typescript
interface TranscriptViewerProps {
  phase: string;
  claudeTranscript: Transcript | null;
  codexTranscript: Transcript | null;
}
```

**Structure:**
```tsx
'use client';

export default function TranscriptViewer({ phase, claudeTranscript, codexTranscript }: TranscriptViewerProps) {
  const [activeTab, setActiveTab] = useState<'claude' | 'codex'>('claude');
  const [showThinking, setShowThinking] = useState(false);
  const [showToolCalls, setShowToolCalls] = useState(false);

  const transcript = activeTab === 'claude' ? claudeTranscript : codexTranscript;

  return (
    <div className={styles.viewer}>
      {/* Tab bar */}
      <div className={styles.tabs} role="tablist">
        <button role="tab" aria-selected={activeTab === 'claude'} onClick={() => setActiveTab('claude')}>
          Claude
        </button>
        <button role="tab" aria-selected={activeTab === 'codex'} onClick={() => setActiveTab('codex')}>
          Codex
        </button>
      </div>

      {/* Visibility toggles */}
      <div className={styles.toggles}>
        <label>
          <input type="checkbox" checked={showThinking} onChange={e => setShowThinking(e.target.checked)} />
          Show thinking
        </label>
        <label>
          <input type="checkbox" checked={showToolCalls} onChange={e => setShowToolCalls(e.target.checked)} />
          Show tool calls
        </label>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {transcript?.messages.map((msg, i) => (
          <Message key={i} message={msg} showThinking={showThinking} showToolCalls={showToolCalls} />
        ))}
      </div>
    </div>
  );
}
```

**CSS Patterns (from agentexport):**
```css
/* Role colors */
.msg.user .role { color: var(--color-ultramarine); }
.msg.assistant .role { color: var(--color-warm-gray); }
.msg.thinking .role { color: #7c3aed; } /* Purple */
.msg.thinking .content {
  border-left: 3px solid #c4b5fd;
  background: #faf5ff;
}
.msg.tool { opacity: 0.7; font-family: var(--font-mono-en); }

/* Toggle visibility via CSS class */
.hideThinking .msg.thinking { display: none; }
.hideToolCalls .msg.tool { display: none; }
```

**A11y:** Tab navigation with arrow keys, ARIA roles for tabs/tabpanels.

#### 2.2 PlanComparison Component

**File:** `components/blog/PlanComparison.tsx`

**Props:**
```typescript
interface PlanComparisonProps {
  claudePlan: string | null;
  codexPlan: string | null;
}
```

**Structure:**
- Two-column flex layout (stack on mobile < 768px)
- Each column renders markdown via ReactMarkdown
- Headers: "Claude's Plan" / "Codex's Plan" with vermilion underlines
- Optional: synchronized scroll via IntersectionObserver (defer to enhancement)

**CSS:**
```css
.comparison {
  display: flex;
  gap: var(--ma-2);
}
.column {
  flex: 1;
  min-width: 0; /* Prevent flex overflow */
}
@media (max-width: 767px) {
  .comparison { flex-direction: column; }
}
```

#### 2.3 Poll Component

**File:** `components/blog/Poll.tsx`

**Props (from markdown attributes):**
```typescript
interface PollProps {
  id: string;
  question: string;
  options: string; // Comma-separated: "claude,codex,tie"
}
```

**Structure:**
```tsx
'use client';

const POLL_LABELS: Record<string, string> = {
  claude: 'Claude',
  codex: 'Codex',
  tie: 'Tie',
};

export default function Poll({ id, question, options }: PollProps) {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optionList = options.split(',');
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  useEffect(() => {
    fetch(`/api/poll/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load poll');
        return res.json();
      })
      .then(data => {
        setVotes(data.votes);
        setHasVoted(data.hasVoted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!selectedOption || hasVoted) return;
    setError(null);
    try {
      const res = await fetch(`/api/poll/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: selectedOption }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit vote');
      }
      setVotes(prev => ({ ...prev, [selectedOption]: (prev[selectedOption] || 0) + 1 }));
      setHasVoted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  // Render voting form or results based on hasVoted
}
```

**CSS:** Vermilion accent for selected option, animated progress bars for results.

#### 2.4 Annotations System

**Approach:** Responsive annotations that appear as margin notes on wide viewports, scroll-triggered tooltips on narrow.

**Data structure:**
```typescript
interface Annotation {
  messageIndex: number;     // Which message to annotate
  tool: 'claude' | 'codex'; // Which transcript
  phase: string;            // research, planning, review
  content: string;          // Annotation text (plain text, no markdown)
  highlight?: string;       // Optional text to highlight in message
}

// Stored in JSON file alongside transcripts
// data/annotations/research.json, planning.json, review.json
```

**Storage:** `data/annotations/{phase}.json`
```json
[
  {
    "messageIndex": 3,
    "tool": "claude",
    "phase": "research",
    "content": "Claude recommended Voyage because \"Anthropic's recommended embedding partner\" 💀",
    "highlight": "Voyage AI"
  }
]
```

**Component structure:**
```tsx
// TranscriptViewer receives annotations as prop
interface TranscriptViewerProps {
  phase: string;
  claudeTranscript: Transcript | null;
  codexTranscript: Transcript | null;
  annotations: Annotation[];  // Added
}

// Message component handles annotation display
function Message({ message, annotation, index }: MessageProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  // Margin note on wide screens (>1024px), tooltip on narrow
  return (
    <div ref={messageRef} className={styles.message}>
      <div className={styles.content}>
        {renderWithHighlight(message.content, annotation?.highlight)}
      </div>

      {annotation && (
        <>
          {/* Margin note - visible on wide screens */}
          <aside className={styles.marginNote}>
            {annotation.content}
          </aside>

          {/* Tooltip trigger - visible on narrow screens */}
          <button
            className={styles.annotationTrigger}
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label="Show author note"
          >
            ✦
          </button>

          {showTooltip && (
            <div className={styles.tooltip}>
              {annotation.content}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

**CSS (responsive):**
```css
/* Margin notes - wide screens */
.message {
  position: relative;
}

.marginNote {
  position: absolute;
  right: calc(-200px - var(--ma-2)); /* Outside content column */
  top: 0;
  width: 180px;
  font-size: 14px;
  color: var(--color-text-secondary);
  border-left: 2px solid var(--color-vermilion);
  padding-left: var(--ma-0);
  display: none; /* Hidden by default */
}

@media (min-width: 1200px) {
  .marginNote {
    display: block;
  }
  .annotationTrigger {
    display: none;
  }
}

/* Tooltip trigger - narrow screens */
.annotationTrigger {
  position: absolute;
  right: -24px;
  top: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: var(--vermilion-10);
  color: var(--color-vermilion);
  border-radius: 50%;
  cursor: pointer;
  font-size: 10px;
}

.tooltip {
  position: absolute;
  right: 0;
  top: 100%;
  width: 280px;
  padding: var(--ma-0);
  background: var(--color-off-white);
  border: 1px solid var(--color-light-gray);
  border-left: 3px solid var(--color-vermilion);
  font-size: 14px;
  z-index: 10;
  box-shadow: var(--shadow-subtle);
}

@media (min-width: 1200px) {
  .tooltip {
    display: none;
  }
}
```

**Loader function:**
```typescript
// lib/transcripts.ts
export function loadAnnotations(phase: string): Annotation[] {
  const filePath = path.join(process.cwd(), 'data', 'annotations', `${phase}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
```

---

### Phase 3: Poll API

**File:** `app/api/poll/[id]/route.ts`

```typescript
import { kv } from '@vercel/kv';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const POLLS: Record<string, string[]> = {
  'claude-vs-codex': ['claude', 'codex', 'tie'],
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allowedOptions = POLLS[id];
  if (!allowedOptions) {
    return NextResponse.json({ error: 'Unknown poll' }, { status: 404 });
  }

  const raw = await kv.hgetall<Record<string, string>>(`poll:${id}`) || {};
  const votes: Record<string, number> = {};
  for (const option of allowedOptions) {
    votes[option] = parseInt(raw[option] || '0', 10);
  }

  const cookieStore = await cookies();
  const hasVoted = cookieStore.has(`voted:${id}`);

  return NextResponse.json({ votes, hasVoted });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allowedOptions = POLLS[id];
  if (!allowedOptions) {
    return NextResponse.json({ error: 'Unknown poll' }, { status: 404 });
  }

  const cookieStore = await cookies();
  if (cookieStore.has(`voted:${id}`)) {
    return NextResponse.json({ error: 'Already voted' }, { status: 429 });
  }

  let body: { option?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { option } = body;
  if (!option || !allowedOptions.includes(option)) {
    return NextResponse.json({ error: 'Invalid option', allowed: allowedOptions }, { status: 400 });
  }

  await kv.hincrby(`poll:${id}`, option, 1);

  const response = NextResponse.json({ success: true });
  response.cookies.set(`voted:${id}`, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
```

---

### Phase 4: Page Integration

**File:** `app/blog/[slug]/page.tsx` (modify existing)

```typescript
import { loadAllTranscripts, loadPlans } from '@/lib/transcripts';
import TranscriptViewer from '@/components/blog/TranscriptViewer';
import Poll from '@/components/blog/Poll';
import PlanComparison from '@/components/blog/PlanComparison';
import { blogSanitizeSchema } from '@/lib/sanitize-schema';

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Load data server-side for this specific post
  const isMessyMiddlePost = slug === 'claude-vs-codex-messy-middle';
  const transcripts = isMessyMiddlePost ? loadAllTranscripts() : null;
  const plans = isMessyMiddlePost ? loadPlans() : null;

  // Load annotations for this post
  const annotations = isMessyMiddlePost ? {
    research: loadAnnotations('research'),
    planning: loadAnnotations('planning'),
    review: loadAnnotations('review'),
  } : null;

  // Create components with injected data via closure
  const components = {
    'transcript-viewer': (props: { phase?: string }) => {
      const phase = props.phase || 'research';
      return (
        <TranscriptViewer
          phase={phase}
          claudeTranscript={transcripts?.[`${phase}-claude`] ?? null}
          codexTranscript={transcripts?.[`${phase}-codex`] ?? null}
          annotations={annotations?.[phase as keyof typeof annotations] ?? []}
        />
      );
    },
    'plan-comparison': () => (
      <PlanComparison
        claudePlan={plans?.claude ?? null}
        codexPlan={plans?.codex ?? null}
      />
    ),
    'poll': Poll,
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, blogSanitizeSchema]]}
      components={components}
    >
      {post.content}
    </ReactMarkdown>
  );
}
```

---

### Phase 5: Testing

#### 5.1 Test Files to Create

| File | Coverage |
|------|----------|
| `__tests__/lib/transcripts.test.ts` | JSONL parsing (Claude format, Codex format, edge cases) |
| `__tests__/components/blog/TranscriptViewer.test.tsx` | Tab switching, visibility toggles, message rendering, a11y |
| `__tests__/components/blog/Poll.test.tsx` | Voting flow, cookie check, results display, error states |
| `__tests__/components/blog/PlanComparison.test.tsx` | Two-column layout, markdown rendering |
| `__tests__/api/poll.test.ts` | GET/POST, cookie handling, KV mocking, error responses |

#### 5.2 Test Fixtures

Create `__tests__/fixtures/transcripts/`:
- `sample-claude.jsonl` - 3-5 messages covering user, assistant, thinking, tool_use
- `sample-codex.jsonl` - 3-5 messages covering response_item variants

#### 5.3 Testing Patterns (from existing tests)

- Use React Testing Library with semantic queries (`getByRole`, `getByText`)
- Minimal mocking - only mock `@vercel/kv` and `fetch` for API tests
- Test accessibility with ARIA role assertions
- Property-based testing for transcript parsing invariants

---

### Phase 6: Blog Post Content

**File:** `data/blog-posts.json` (add new entry)

```json
{
  "id": "claude-vs-codex-messy-middle",
  "slug": "claude-vs-codex-messy-middle",
  "title": "Claude vs Codex in the Messy Middle",
  "excerpt": "Everyone's debating Claude vs Codex. I ran them head-to-head on real work.",
  "content": "...",
  "author": "Ben Lau",
  "category": "AI",
  "tags": ["claude", "codex", "ai", "comparison"],
  "date": "2026-01-XX",
  "readTime": 12
}
```

**Markdown content structure:**
```markdown
Everyone's debating Claude vs Codex...

## The Setup: What is "The Messy Middle"?

...

## Research Phase

<transcript-viewer phase="research" />

## Planning Phase

<transcript-viewer phase="planning" />

<plan-comparison />

## The Review Phase

<transcript-viewer phase="review" />

## The Scorecard

| Phase | Edge |
|-------|------|
| Research | Codex |
| Planning | Claude |
| Review | Codex |

<poll id="claude-vs-codex" question="Who won?" options="claude,codex,tie" />

## The Bigger Insight

...
```

---

### Implementation Order

1. **Data layer first** - `lib/transcripts.ts`, `lib/sanitize-schema.ts`, sample JSONL files
2. **TranscriptViewer** - Core component with CSS, then tests
3. **PlanComparison** - Simpler component, then tests
4. **Poll API** - `app/api/poll/[id]/route.ts` with Vercel KV, then tests
5. **Poll component** - Client-side voting UI, then tests
6. **Page integration** - Update `app/blog/[slug]/page.tsx`
7. **Blog post content** - Write article in `data/blog-posts.json`
8. **Final testing** - E2E verification, build check

---

### Dependencies to Install

```bash
npm install @vercel/kv
```

### Vercel KV Setup

**One-time setup (before deployment):**

1. **Create KV Database:**
   - Vercel Dashboard → Storage → Create Database → KV
   - Name: `blog-db`
   - Region: Same as your deployment (e.g., `iad1`)

2. **Connect to Project:**
   - Storage → `blog-db` → Connect Project
   - Select your blog project
   - Environment: Production (and optionally Preview)

3. **Environment Variables (auto-configured):**
   ```
   KV_URL=redis://...
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...
   ```

4. **Local Development:**
   - Pull env vars: `vercel env pull .env.local`
   - Or use Vercel CLI: `vercel dev` (auto-injects env vars)

**Testing locally without KV:**
```typescript
// lib/poll-store.ts - Optional mock for local dev
const useMock = !process.env.KV_REST_API_URL;

export const pollStore = useMock
  ? createMockStore()  // In-memory Map
  : kv;                 // Real Vercel KV
```

**Cost:** Free tier includes 30K requests/day, 256MB storage (more than enough for polls).

---

### Open Design Questions (All Resolved)

| Question | Decision |
|----------|----------|
| Annotations UX | Margin notes (≥1200px) / Scroll tooltips (<1200px) - separate from flow |
| Component styling | New CSS module (`TranscriptViewer.module.css`) using design tokens |
| Vercel KV | Create `blog-db` database, connect to project, free tier sufficient |

---

## Implementation Progress

**Date**: 2026-01-03

### Completed

- [x] Phase 1: Data layer (transcripts.ts, sanitize-schema.ts, next.config.ts, data directories)
- [x] Phase 2: Components (TranscriptViewer, PlanComparison, Poll)
- [x] Phase 3: Poll API route (in-memory for dev, Vercel KV ready)
- [x] Phase 4: Page integration (ReactMarkdown components prop)
- [x] Phase 6: Blog post content (placeholder)
- [x] Build passes

### Known Issues (To Fix)

1. **H2H mode too narrow**: Current width (200px breakout each side) insufficient for side-by-side. Need ~300-350px each side or full viewport width.

2. **Claude thinking still showing**: Filtering works in component but thinking messages may be leaking through parser. Need to verify `role: 'thinking'` is correctly assigned and filtered.

3. **Claude user messages contain noise**: System-injected content still appearing:
   - `<command-args>` tags
   - `<command-name>` tags
   - Other XML-like system context

   **Fix**: Add filters for `<command-` prefix in Claude parser.

4. **Poll persistence**: Using in-memory store (resets on cold start). Need `@vercel/kv` for production.

5. **Tests not written**: Phase 5 pending.

### Next Steps

1. Fix H2H width - make it full viewport or significantly wider breakout
2. Add Claude parser filters for `<command-*>` and other system XML
3. Debug why thinking messages appear (verify parser assigns role correctly)
4. Install `@vercel/kv` and update poll API
5. Write tests

---

## References

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [rehype-sanitize Schema](https://github.com/rehypejs/rehype-sanitize#schema)
- Agentexport source: `/Users/ben/dev/agentexport`
- Article plan: `/Users/ben/Documents/Main Vault/Projects/blog/Claude vs Codex in the Messy Middle.md`

<implementation>
<metadata>
  <timestamp>2026-01-03T22:07:24Z</timestamp>
  <duration>unknown</duration>
  <iterations>2</iterations>
</metadata>

<files-modified>
  <file path="lib/transcripts.ts">
    <changes>Clean Claude user text to strip command/system tags before filtering.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Added cleanClaudeUserText helper and applied it to Claude user parsing.</diff-summary>
  </file>
  <file path="components/blog/TranscriptViewer.tsx">
    <changes>Tag the root wrapper for H2H layout styling.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Applied conditional h2hMode class based on view mode.</diff-summary>
  </file>
  <file path="components/blog/TranscriptViewer.module.css">
    <changes>Expanded H2H breakout width and container max width for wide viewports.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Added full-viewport breakout and widened H2H container to 1400px.</diff-summary>
  </file>
  <file path="app/api/poll/[id]/route.ts">
    <changes>Switch poll persistence to KV-backed store.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Replaced in-memory map with pollStore hgetall/hincrby calls.</diff-summary>
  </file>
  <file path="package.json">
    <changes>Added @vercel/kv dependency.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Added @vercel/kv to dependencies.</diff-summary>
  </file>
  <file path="package-lock.json">
    <changes>Updated lockfile for @vercel/kv installation.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Lockfile updated for new dependency tree.</diff-summary>
  </file>
  <file path="__tests__/lib/blog.test.ts">
    <changes>Narrowed coverImage type for URL validation.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Used explicit string guard to satisfy type check.</diff-summary>
  </file>
  <file path="__tests__/components/blog/BlogHeader.test.tsx">
    <changes>Adjusted DOM element typing for type check.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Cast querySelector results to HTMLElement for toContainElement.</diff-summary>
  </file>
  <file path="__tests__/components/layout/MasterGrid.test.tsx">
    <changes>Adjusted DOM element typing for className assertions.</changes>
    <patterns-applied>None</patterns-applied>
    <diff-summary>Cast firstChild to HTMLElement in assertions.</diff-summary>
  </file>
</files-modified>

<files-created>
  <file path="lib/poll-store.ts">
    <purpose>Provide KV-backed poll storage with in-memory fallback.</purpose>
    <patterns-applied>None</patterns-applied>
    <test-file>__tests__/api/poll.test.ts</test-file>
  </file>
  <file path="__tests__/components/blog/TranscriptViewer.test.tsx">
    <purpose>Cover TranscriptViewer tabs, toggles, annotations, and H2H mode.</purpose>
    <patterns-applied>None</patterns-applied>
    <test-file>__tests__/components/blog/TranscriptViewer.test.tsx</test-file>
  </file>
  <file path="__tests__/components/blog/Poll.test.tsx">
    <purpose>Verify poll loading, voting flow, and error states.</purpose>
    <patterns-applied>None</patterns-applied>
    <test-file>__tests__/components/blog/Poll.test.tsx</test-file>
  </file>
  <file path="__tests__/components/blog/PlanComparison.test.tsx">
    <purpose>Check plan comparison rendering and empty states.</purpose>
    <patterns-applied>None</patterns-applied>
    <test-file>__tests__/components/blog/PlanComparison.test.tsx</test-file>
  </file>
  <file path="__tests__/api/poll.test.ts">
    <purpose>Validate poll API GET/POST, cookie behavior, and persistence.</purpose>
    <patterns-applied>None</patterns-applied>
    <test-file>__tests__/api/poll.test.ts</test-file>
  </file>
  <file path="__tests__/lib/transcripts.test.ts">
    <purpose>Verify transcript parsing, filtering, and annotation loading.</purpose>
    <patterns-applied>None</patterns-applied>
    <test-file>__tests__/lib/transcripts.test.ts</test-file>
  </file>
  <file path="types/jest-dom.d.ts">
    <purpose>Expose jest-dom matchers to TypeScript.</purpose>
    <patterns-applied>None</patterns-applied>
    <test-file>__tests__/components/blog/TranscriptViewer.test.tsx</test-file>
  </file>
</files-created>

<validation-results>
  <syntax status="fail">npm run lint - next lint error: Invalid project directory provided, no such directory: /Users/ben/dev/personal-blog/lint.</syntax>
  <types status="pass">npx tsc --noEmit</types>
  <tests status="pass" passed="203" failed="0" skipped="0">npm test (jest)</tests>
  <coverage>not run</coverage>
</validation-results>

<patterns-used>
  None (plan did not specify patterns).
</patterns-used>

<issues-encountered>
  <issue resolved="true">
    <description>Type check failed due to missing jest-dom matchers and DOM element typings in tests.</description>
    <resolution>Added types/jest-dom.d.ts and tightened DOM element typing in tests.</resolution>
  </issue>
  <issue resolved="false">
    <description>npm run lint fails because next lint reports an invalid project directory.</description>
    <resolution>Unresolved; consider switching lint script to eslint or updating Next.js CLI.</resolution>
  </issue>
</issues-encountered>

<deviations-from-plan>
  <deviation>
    <planned>Plan did not include type-check fixes for existing tests.</planned>
    <actual>Added jest-dom type shim and DOM element casts to satisfy tsc.</actual>
    <reason>Type check gate required for implementation validation.</reason>
  </deviation>
  <deviation>
    <planned>No task frontmatter specified.</planned>
    <actual>Added YAML frontmatter to record phase and timestamps.</actual>
    <reason>Required by APEX implement workflow.</reason>
  </deviation>
</deviations-from-plan>

<reviewer-handoff>
  <summary>Resolved transcript noise, widened H2H layout, added KV-backed poll storage, and shipped tests with type-check support.</summary>
  <key-changes>Claude user XML cleanup, H2H full-width breakout, KV-backed poll store, new Poll/TranscriptViewer/PlanComparison/poll API tests.</key-changes>
  <test-coverage>Jest unit tests across new components and poll API; npx tsc --noEmit passes; npm run lint fails due to next lint CLI issue.</test-coverage>
  <known-limitations>npm run lint failure (Next CLI); coverage not run.</known-limitations>
  <patterns-for-reflection>None.</patterns-for-reflection>
</reviewer-handoff>

<next-steps>
Run `/apex:ship claude-vs-codex-blog-post` to review and finalize.
</next-steps>
</implementation>
