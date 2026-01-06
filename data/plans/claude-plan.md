---
id: _d3NcldtrLAotoiCziqQE
identifier: vector-search-md-mongodb
title: "Vector Search over .md Files with MongoDB Atlas"
created: 2026-01-02
updated: 2026-01-02
phase: plan
status: active
confidence: 0.75
tags: [vector-search, mongodb-atlas, markdown, semantic-search, embeddings]
decisions:
  - embedding_provider: voyage-ai
  - embedding_model: voyage-3.5-lite
  - scope: task-files-only
  - config: .env (MONGODB_URI, VOYAGE_API_KEY)
  - chunking: hybrid (XML sections OR markdown headings) + whole-file embedding
  - architecture: direct-integration (Solution A)
  - credentials: required (fail startup if missing)
  - indexing: file-watcher (real-time)
  - storage: mongodb-only (no SQLite cache)
---

# Vector Search over .md Files with MongoDB Atlas

## Executive Summary

This research investigates implementing vector search over markdown files generated during APEX workflow, using MongoDB Atlas vector search. The approach is **fully viable** with straightforward integration paths.

**Key finding**: APEX's current architecture writes task files to `.apex/tasks/[ID].md` during workflow phases. These can be embedded as whole documents and indexed in MongoDB Atlas for semantic retrieval.

## Decisions Made

- **Embedding Provider**: Voyage AI (`voyage-3.5-lite`) - best retrieval quality at $0.02/1M tokens
- **Scope**: Task files only (`.apex/tasks/*.md`)
- **Config**: Credentials in `.env` (`MONGODB_URI`, `VOYAGE_API_KEY`)
- **Chunking**: Hybrid + whole-file
  - Chunks: XML sections (`<research>`, `<plan>`, etc.) OR markdown headings (`##`)
  - Plus: whole-file embedding (`section: "_whole"`) for task similarity

---

## Research Findings

### 1. Current APEX .md File Architecture

**Where .md files are written:**
- **Task files**: `./.apex/tasks/[IDENTIFIER].md` (primary workflow output)
- **Skills**: `/skills/*/SKILL.md` (static, checked into repo)
- **Pattern packs**: `[pack-name]/README.md` (distribution packs)

**Task file structure:**
```yaml
---
id: [nanoid]
identifier: [kebab-case-name]
phase: [research|plan|implement|ship]
status: [active|complete|blocked]
---

# Title

<research>
  <metadata>...</metadata>
  <executive-summary>...</executive-summary>
</research>

<plan>
  <architecture>...</architecture>
</plan>

<implementation>
  <changes>...</changes>
</implementation>

<ship>
  <review>...</review>
</ship>
```

**Current search**: SQLite FTS5 via `pattern_fts` virtual table. No vector/semantic search.

---

### 2. MongoDB Atlas Vector Search

**Key capabilities:**
- `$vectorSearch` aggregation stage (replaces deprecated `knnBeta`)
- Supports 1-8192 dimensions
- Three similarity functions: `cosine`, `dotProduct`, `euclidean`
- Pre-filtering via indexed filter fields
- HNSW algorithm for approximate nearest neighbor

**Index configuration:**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "phase"
    },
    {
      "type": "filter",
      "path": "taskType"
    }
  ]
}
```

**Node.js query:**
```javascript
const pipeline = [
  {
    $vectorSearch: {
      index: 'apex_docs_vector',
      path: 'embedding',
      queryVector: queryEmbedding,
      numCandidates: 200,
      limit: 10,
      filter: { phase: 'implement' }
    }
  },
  {
    $project: {
      title: 1,
      content: 1,
      taskId: 1,
      score: { $meta: 'vectorSearchScore' }
    }
  }
];
```

**Pricing:**
- Free tier (M0): 512MB storage, 3 indexes
- Flex: $8/month, 5GB storage, 10 indexes
- Dedicated: $57+/month for production

---

### 3. Embedding: Voyage AI

**Selected model**: `voyage-3.5-lite`
- **Dimensions**: 1024 (configurable: 2048/1024/512/256)
- **Cost**: $0.02/1M tokens
- **Context**: 32K tokens (handles large task files)
- **Quality**: Outperforms OpenAI text-embedding-3-large on retrieval benchmarks

**Why Voyage AI**:
- Best-in-class retrieval quality at competitive price
- 32K context window handles entire task files
- Anthropic's recommended embedding partner
- Flexible dimensions via Matryoshka learning

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APEX Workflow                            │
│  /research → /plan → /implement → /ship                     │
└───────────────────────┬─────────────────────────────────────┘
                        │ writes
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              .apex/tasks/[ID].md                            │
│  (Source of truth - whole file is the document)             │
└───────────────────────┬─────────────────────────────────────┘
                        │ watch/hook
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           Indexing Pipeline (new)                           │
│  1. Read file, extract YAML frontmatter                     │
│  2. Detect format: XML sections or markdown headings        │
│  3. Chunk by detected format                                │
│  4. Generate embedding per chunk via Voyage AI              │
│  5. Upsert chunks to MongoDB Atlas                          │
└───────────────────────┬─────────────────────────────────────┘
                        │ store
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           MongoDB Atlas                                     │
│  Collection: apex_task_chunks                               │
│  ┌────────────────────────────────────────────────────────┐│
│  │ {                                                      ││
│  │   _id: ObjectId,                                       ││
│  │   taskId: string,                                      ││
│  │   section: string (e.g. "research", "## Overview"),    ││
│  │   content: string (chunk text),                        ││
│  │   phase: string,                                       ││
│  │   tags: string[],                                      ││
│  │   embedding: Binary (1024 dims),                       ││
│  │   updatedAt: Date                                      ││
│  │ }                                                      ││
│  └────────────────────────────────────────────────────────┘│
│  Vector Index: apex_chunks_vector                           │
└───────────────────────┬─────────────────────────────────────┘
                        │ query
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           New MCP Tool: apex_semantic_search                │
│  - Accepts natural language query                           │
│  - Generates query embedding via Voyage AI                  │
│  - Returns relevant task files with similarity scores       │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Approach

### Component 1: Voyage AI Client

```typescript
// src/vector-search/voyage-client.ts
import { VoyageAIClient } from 'voyageai';

export class VoyageEmbeddings {
  private client: VoyageAIClient;

  constructor(apiKey: string) {
    this.client = new VoyageAIClient({ apiKey });
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embed({
      input: text,
      model: 'voyage-3.5-lite',
      outputDimension: 1024
    });
    return response.data[0].embedding;
  }
}
```

### Component 2: Hybrid Chunker

```typescript
// src/vector-search/chunker.ts
interface Chunk {
  section: string;   // "research" | "plan" | "## Heading"
  content: string;
}

function chunkDocument(content: string): Chunk[] {
  // Detect XML sections
  const xmlSections = ['research', 'plan', 'implementation', 'ship'];
  const hasXml = xmlSections.some(s => content.includes(`<${s}>`));

  if (hasXml) {
    return chunkByXmlSections(content, xmlSections);
  } else {
    return chunkByMarkdownHeadings(content);
  }
}

function chunkByXmlSections(content: string, sections: string[]): Chunk[] {
  const chunks: Chunk[] = [];
  for (const section of sections) {
    const regex = new RegExp(`<${section}>([\\s\\S]*?)</${section}>`, 'i');
    const match = content.match(regex);
    if (match) {
      chunks.push({ section, content: match[1].trim() });
    }
  }
  return chunks;
}

function chunkByMarkdownHeadings(content: string): Chunk[] {
  const lines = content.split('\n');
  const chunks: Chunk[] = [];
  let currentSection = 'intro';
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentContent.length) {
        chunks.push({ section: currentSection, content: currentContent.join('\n') });
      }
      currentSection = line;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentContent.length) {
    chunks.push({ section: currentSection, content: currentContent.join('\n') });
  }
  return chunks;
}
```

### Component 3: Task Indexer

```typescript
// src/vector-search/task-indexer.ts
interface ChunkDocument {
  taskId: string;
  section: string;
  content: string;
  phase: string;
  tags: string[];
  embedding: Binary;
  updatedAt: Date;
}

class TaskIndexer {
  async indexTaskFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const frontmatter = this.extractFrontmatter(content);
    const chunks = chunkDocument(content);

    // Delete old chunks for this task
    await this.collection.deleteMany({ taskId: frontmatter.id });

    // Insert whole-file embedding for task similarity
    const wholeEmbedding = await this.voyage.embed(content);
    await this.collection.insertOne({
      taskId: frontmatter.id,
      section: '_whole',
      content: content,
      phase: frontmatter.phase,
      tags: frontmatter.tags || [],
      embedding: Binary.fromFloat32Array(Float32Array.from(wholeEmbedding)),
      updatedAt: new Date()
    });

    // Insert chunk embeddings for precise search
    for (const chunk of chunks) {
      const embedding = await this.voyage.embed(chunk.content);
      await this.collection.insertOne({
        taskId: frontmatter.id,
        section: chunk.section,
        content: chunk.content,
        phase: frontmatter.phase,
        tags: frontmatter.tags || [],
        embedding: Binary.fromFloat32Array(Float32Array.from(embedding)),
        updatedAt: new Date()
      });
    }
  }
}
```

### Component 4: MCP Tools

```typescript
// src/mcp/tools/semantic-search.ts

// Tool 1: Search chunks for specific info
{
  name: 'apex_semantic_search',
  description: 'Search task file sections for specific information',
  parameters: {
    query: { type: 'string', description: 'Natural language query' },
    filter: {
      phase: { type: 'string', enum: ['research', 'plan', 'implement', 'ship'] },
      section: { type: 'string', description: 'Limit to specific section' },
      tags: { type: 'array', items: { type: 'string' } }
    },
    limit: { type: 'number', default: 10, maximum: 50 }
  }
  // Searches chunks where section != '_whole'
}

// Tool 2: Find similar tasks (holistic)
{
  name: 'apex_find_similar_tasks',
  description: 'Find tasks similar to a query or another task',
  parameters: {
    query: { type: 'string', description: 'Natural language description or task ID' },
    limit: { type: 'number', default: 5, maximum: 20 }
  }
  // Searches only section == '_whole'
}
```

### Component 5: Environment Variables

```bash
# .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/apex
VOYAGE_API_KEY=pa-xxxxxxxxxxxxxxxx
```

```typescript
// src/vector-search/config.ts
export const vectorSearchConfig = {
  mongodbUri: process.env.MONGODB_URI,
  voyageApiKey: process.env.VOYAGE_API_KEY,
  database: 'apex',
  collection: 'tasks'
};
``/Users/ben/dev/apex/.apex/tasks/vector-search-md.md`

---

## Technical Decisions (Finalized)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Embedding provider | Voyage AI | Best retrieval quality, Anthropic partner |
| Embedding model | voyage-3.5-lite | 32K context, $0.02/1M tokens |
| Embedding dimensions | 1024 | Balance of quality/storage |
| Chunking | Hybrid + whole | Chunks + whole-file embedding for similarity |
| Config storage | .env | Simple, standard approach |
| MongoDB driver | mongodb | Native driver, lighter than mongoose |
| Sync strategy | File watcher | Real-time updates on file changes |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Voyage AI API costs | Low | $0.02/1M tokens; task files are small |
| MongoDB connection failures | Medium | Graceful degradation, optional feature |
| Large task files (>32K tokens) | Low | voyage-3.5-lite handles 32K; truncate if needed |
| Stale index after edits | Medium | Debounced file watcher |

---

## Estimated Effort (Simplified)

| Component | Complexity | Estimate |
|-----------|------------|----------|
| Voyage AI client wrapper | Low | 2-3 hours |
| Hybrid chunker | Low | 2-3 hours |
| MongoDB indexer (chunks + whole) | Low | 3-4 hours |
| MCP tools (2: search + similar) | Low | 4-5 hours |
| File watcher integration | Low | 2-3 hours |
| Testing | Medium | 4-5 hours |

**Total: ~17-23 hours**

---

## Next Steps

1. **Run `/apex:plan`** to create detailed implementation plan
2. Set up MongoDB Atlas collection and vector index
3. Implement Voyage AI client
4. Build task indexer
5. Add MCP tool

---

## References

- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Voyage AI Documentation](https://docs.voyageai.com/)
- [voyage-3.5-lite Model](https://blog.voyageai.com/2025/05/20/voyage-3-5/)

---

<plan>
<metadata>
  <timestamp>2026-01-02</timestamp>
  <chosen-solution>A (Direct Integration)</chosen-solution>
  <complexity>4/10</complexity>
  <risk>LOW</risk>
</metadata>

<chain-of-thought>
## Current State

| Component | Location | Purpose |
|-----------|----------|---------|
| MCP Server | `src/mcp/server.ts:68-147` | Initializes pattern system, runs migrations |
| Tool Registry | `src/mcp/tools/index.ts:126-346` | Switch-case tool dispatch |
| Pattern Discovery | `src/mcp/tools/discover.ts` | FTS3 + semantic scoring (NOT vector) |
| Task Repository | `src/storage/repositories/task-repository.ts` | SQLite task CRUD |
| File Watcher | `src/storage/watcher.ts:22-46` | Chokidar-based, 200ms debounce |
| Config | `src/config/apex-config.ts` | Static config, env var handling |

**Git Archaeology:**
- `c1044e9` (2025-08-02): Semantic discovery added with FTS + scoring
- `b472a68` (2025-09-06): FTS5→FTS3 migration for WASM compatibility
- `a83d685` (2025-11-01): Overview tool added (39 tests, pagination)

## Problem Decomposition

**Core Problem:** Enable semantic search over `.apex/tasks/*.md` files using true vector embeddings.

**Sub-problems:**
1. External API integration (Voyage AI) - no existing pattern
2. External database integration (MongoDB Atlas) - no existing pattern
3. Markdown chunking with mixed XML/heading formats
4. Real-time indexing via file watcher
5. MCP tool registration following existing patterns
6. Startup validation for required credentials

## Hidden Complexity

| Issue | Source | Impact |
|-------|--------|--------|
| No `.env` auto-loading | `apex-config.ts` | Must document env var setup |
| FTS schema churn | 8 fixes in 90 days | Avoid touching SQLite FTS |
| Singleton patterns | `database.ts:86` | Must follow for MongoDB |
| Rate limiting needed | Voyage API limits | Implement like `llm-extractor.ts:8` |

## Success Criteria

**Automated:**
- `npm test` passes with new semantic search tests
- `npm run type-check` clean
- MCP tool responds to `apex_semantic_search` calls
- Connection validation fails startup if credentials missing

**Manual:**
- Query "authentication patterns" returns relevant task files
- File edit triggers re-indexing within 1 second
</chain-of-thought>

<tree-of-thought>
## Solution A: Direct Integration (WINNER)

**Approach:** Straightforward client classes with singleton patterns

**Implementation:**
1. `VoyageClient` class at `src/clients/voyage.ts`
2. `MongoVectorStore` singleton at `src/clients/mongodb.ts`
3. `TaskIndexer` with file watcher at `src/indexing/task-indexer.ts`
4. `SemanticSearchService` at `src/mcp/tools/semantic-search.ts`

**Patterns:** PAT:AUTO:Coh7YFt2 (★★★☆☆), PAT:AUTO:a9f5JGcA (★★☆☆☆)

**Pros:** Simple, follows existing patterns, easy to debug
**Cons:** Tight coupling to Voyage/MongoDB

**Complexity:** 4/10 | **Risk:** LOW

---

## Solution B: Provider Abstraction Layer

**Approach:** Interface-based abstraction for swappable providers

**Implementation:** EmbeddingProvider/VectorStore interfaces + factory pattern

**Pros:** Swappable providers, testable
**Cons:** Over-engineering, no existing DI pattern

**Complexity:** 7/10 | **Risk:** MEDIUM

---

## Solution C: Event-Driven Pipeline

**Approach:** EventEmitter-based decoupled components

**Implementation:** IndexingPipeline with events, persistent queue

**Pros:** Highly decoupled, backpressure handling
**Cons:** Hard to trace, architectural divergence

**Complexity:** 8/10 | **Risk:** HIGH

---

**Winner:** Solution A - aligns with existing patterns, minimal abstraction, fastest to implement.

**Runner-up:** Solution B - premature abstraction for single provider.
</tree-of-thought>

<chain-of-draft>
## Draft 1 (Raw)
Add MongoDB and Voyage clients, create MCP tool, done.

**Issues:** No initialization location, no error handling, no file watching.

---

## Draft 2 (Pattern-Guided)
Follow PAT:AUTO:a9f5JGcA - initialize in `initializePatternSystem()`. Add singleton for MongoDB.

**Issues:** What if credentials missing? No validation. Chunking undefined.

---

## Draft 3 (Production-Ready)
Validate credentials at startup (fail fast). Initialize clients with retry. Singleton stores. Start watcher after successful connection. Hybrid chunking with content hashing.

```typescript
// server.ts:initializePatternSystem()
validateRequiredEnv(['VOYAGE_API_KEY', 'MONGODB_URI']);

const voyageClient = new VoyageClient({
  apiKey: process.env.VOYAGE_API_KEY,
  model: 'voyage-3.5-lite',
  dimensions: 1024,
  rateLimitMs: 100,
});
await voyageClient.testConnection();

const mongoStore = await MongoVectorStore.create({
  uri: process.env.MONGODB_URI,
  database: 'apex',
  collection: 'task_chunks',
});

const taskIndexer = new TaskIndexer({
  voyageClient, mongoStore,
  watchPath: '.apex/tasks',
  debounceMs: 500,
  useContentHash: true,
});
await taskIndexer.startWatcher();

await initializeTools(repository, sharedDb, { mongoStore, voyageClient });
```

**Evolution:** Applied Graceful Fallback pattern, added connection testing, content hashing prevents redundant embeddings.
</chain-of-draft>

<yagni>
## Explicitly Excluding

| Feature | Why Not | Defer Until |
|---------|---------|-------------|
| Provider Abstraction | Only one provider (Voyage) | Need second provider |
| SQLite Cache | User chose MongoDB-only | Connectivity issues |
| Multiple Indexes | One index sufficient | Scale issues |
| Streaming Chunker | Task files small | Memory issues |
| Background Queue Persistence | Watcher handles recovery | Crash recovery |
| Admin UI | CLI/MCP sufficient | User request |

## Preventing Scope Creep

- "Add OpenAI embeddings option" → Voyage sufficient
- "Cache locally for offline" → MongoDB-only chosen
- "Modify discover tool" → Keep tools separate
- "Support all markdown files" → Task files only

## Complexity Budget

| Aspect | Allocated | Used | Reserved |
|--------|-----------|------|----------|
| Total | 6/10 | 4/10 | 2/10 |
| New files | 6 | 6 | - |
| Dependencies | 2 | 2 | - |
</yagni>

<patterns>
## Applying

| Pattern ID | Trust | Where | Why |
|------------|-------|-------|-----|
| PAT:AUTO:Coh7YFt2 (Graceful Fallback) | ★★★☆☆ | `server.ts` | Fail gracefully, test connections |
| PAT:AUTO:a9f5JGcA (MCP DB Init) | ★★☆☆☆ | `server.ts:68-147` | Init in existing flow |
| PAT:VALIDATION:ZOD | ★★☆☆☆ | `schemas/search/types.ts` | Validate MCP inputs |
| PAT:MCP:SERVICE | ★★☆☆☆ | `tools/semantic-search.ts` | Follow TaskService pattern |

## Codebase Patterns

| Pattern | Location | Application |
|---------|----------|-------------|
| Singleton | `database.ts:86` | MongoVectorStore.getInstance() |
| Rate limiting | `llm-extractor.ts:8` | VoyageClient.embed() |
| Debounced watcher | `watcher.ts:13` | TaskIndexer |
| Retry with backoff | `database-utils.ts:23` | API calls |

## Not Using

- ANTI:AUTO:09FZrpo0 (Complex Fallback) - we're doing simple fail-fast
- Event-driven patterns - over-engineering
</patterns>

<architecture-decision>
## Decision
Direct Integration (Solution A) with singleton clients, file watcher, and MCP tools.

## Files to Create

| Path | Purpose | Pattern |
|------|---------|---------|
| `src/clients/voyage.ts` | Embedding generation | Rate limiting |
| `src/clients/mongodb.ts` | Vector store singleton | Singleton + getInstance |
| `src/indexing/markdown-chunker.ts` | Hybrid XML/heading chunking | - |
| `src/indexing/task-indexer.ts` | File watcher + pipeline | Debounce pattern |
| `src/mcp/tools/semantic-search.ts` | MCP tool service | PAT:MCP:SERVICE |
| `src/schemas/search/types.ts` | Zod schemas | PAT:VALIDATION:ZOD |

## Files to Modify

| Path | Change | Validation |
|------|--------|------------|
| `src/mcp/server.ts` | Add vector init in `initializePatternSystem()` | Startup logs |
| `src/mcp/tools/index.ts` | Register tools, add switch cases | Tool list includes new tools |
| `package.json` | Add `mongodb`, `voyageai` dependencies | `npm install` succeeds |

## Implementation Sequence

1. **Add dependencies** - `npm install mongodb voyageai`
2. **Create VoyageClient** - with rate limiting, connection test
3. **Create MongoVectorStore** - singleton, $vectorSearch wrapper
4. **Create MarkdownChunker** - hybrid XML/heading strategy
5. **Create TaskIndexer** - watcher + embedding pipeline
6. **Create SemanticSearchService** - MCP tool implementation
7. **Create Zod schemas** - request/response validation
8. **Wire initialization** - update `server.ts`
9. **Register tools** - update `tools/index.ts`
10. **Write tests** - unit + integration

## Validation Plan

**Automated:**
- `npm run type-check` - no type errors
- `npm test` - all tests pass
- Tool registration verified via MCP list

**Manual:**
- Set env vars, start MCP server
- Call `apex_semantic_search` with query
- Verify results include relevant task files
- Edit task file, verify re-indexing

## Potential Failures

| Risk | Mitigation | Detection |
|------|------------|-----------|
| Voyage API unavailable | Retry with backoff | Connection test at startup |
| MongoDB connection failure | Fail fast with clear error | Startup validation |
| Rate limiting | Debounce + rate limit | Monitor 429 responses |
| Large files | Max file size check | Log warnings |
| Malformed markdown | Graceful fallback to whole-file | Chunk count validation |
</architecture-decision>

<builder-handoff>
## Mission
Implement vector search over `.apex/tasks/*.md` using MongoDB Atlas and Voyage AI, following the Direct Integration architecture.

## Core Architecture
- **VoyageClient**: Singleton, rate-limited embedding generation
- **MongoVectorStore**: Singleton, $vectorSearch queries
- **TaskIndexer**: File watcher → chunker → embed → store pipeline
- **SemanticSearchService**: MCP tool following existing patterns

## Pattern Guidance
1. `PAT:AUTO:Coh7YFt2` → Test connections before proceeding
2. `PAT:AUTO:a9f5JGcA` → Initialize in `server.ts:initializePatternSystem()`
3. `PAT:MCP:SERVICE` → Follow `TaskService` class structure
4. Singleton pattern from `database.ts:86`
5. Rate limiting from `llm-extractor.ts:8`

## Implementation Order
1. Add npm dependencies (mongodb, voyageai)
2. Create `src/clients/voyage.ts` with connection test
3. Create `src/clients/mongodb.ts` singleton
4. Create `src/indexing/markdown-chunker.ts`
5. Create `src/indexing/task-indexer.ts` with watcher
6. Create `src/schemas/search/types.ts` (Zod)
7. Create `src/mcp/tools/semantic-search.ts`
8. Update `src/mcp/server.ts` initialization
9. Update `src/mcp/tools/index.ts` registration
10. Write tests

## Validation Gates
- After step 2: `voyageClient.testConnection()` succeeds
- After step 3: `mongoStore.ping()` succeeds
- After step 5: File watcher triggers on task file edit
- After step 9: `apex_semantic_search` appears in tool list
- Final: Integration test with real query

## Warnings
- **FTS schema is high-churn** - do NOT touch SQLite FTS tables
- **No .env auto-loading** - document env var setup
- **Credentials required** - fail startup if missing
- **Rate limit Voyage API** - 100ms minimum between calls
</builder-handoff>

<next-steps>
Run `/apex:implement vector-search-md-mongodb` to begin implementation.
</next-steps>
</plan>
