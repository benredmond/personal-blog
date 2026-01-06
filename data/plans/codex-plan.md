---
id: HWbpljkYlTXC3G8W7ZbpD
identifier: vector-search-md
title: "Research: Vector search over workflow markdown"
created: 2026-01-03T00:03:51Z
updated: 2026-01-03T02:42:21Z
phase: plan
status: active
---

# Research: Vector search over workflow markdown

<research>
<metadata>
  <timestamp>2026-01-03T00:42:28Z</timestamp>
  <agents-deployed>5</agents-deployed>
  <files-analyzed>24</files-analyzed>
  <confidence>8</confidence>
  <adequacy-score>0.72</adequacy-score>
  <ambiguities-resolved>0</ambiguities-resolved>
</metadata>

<context-pack-refs>
  ctx.patterns = research.apex-patterns
  ctx.impl = research.codebase-patterns
  ctx.web = research.web-research
  ctx.history = research.git-history
  ctx.docs = research.documentation
  ctx.risks = research.risks
  ctx.exec = research.recommendations.winner
</context-pack-refs>

<executive-summary>
Enhanced prompt:
```yaml
original_prompt: "do web research to confirm your plan"
enhanced_prompt:
  intent: "Validate the vector-search-over-markdown approach against Atlas Vector Search requirements."
  scope:
    in:
      - "Atlas Vector Search index definition requirements"
      - "$vectorSearch query stage parameters and limits"
      - "Embedding storage formats and dimension constraints"
      - "Index consistency behavior"
    out:
      - "Selecting a specific embedding vendor"
      - "Implementing the indexing pipeline now"
  acceptance_criteria:
    - "Document vectorSearch index fields (path, numDimensions, similarity, filter)."
    - "Document $vectorSearch required fields and numCandidates guidance."
  success_metrics:
    - "Research cites official MongoDB docs with URLs."
  related_patterns:
    - "APEX.SYSTEM:PAT:AUTO:Coh7YFt2"
    - "APEX.SYSTEM:PAT:AUTO:a9f5JGcA"
```

APEX currently provides text and similarity search through SQLite FTS and a task similarity engine, but it has no vector embedding pipeline or MongoDB integration. The workflow writes rich, structured Markdown task files in .apex/tasks (frontmatter plus XML-like sections), which makes them good candidates for chunked embedding and vector search. The codebase already has search-specific building blocks (query parsing, fuzzy matching, FTS triggers) and a file watcher pattern that can be adapted for Markdown indexing.

MongoDB's official Vector Search docs confirm the plan: you must create a vectorSearch index with explicit vector fields (path, numDimensions, similarity, optional quantization and hnswOptions) and query via the $vectorSearch aggregation stage with queryVector, index/path, limit, and numCandidates. The docs also emphasize constraints that should be baked into APEX design: embeddings must match numDimensions (<= 8192), embeddings in arrays of documents are not indexable, and index updates are eventually consistent via mongot change streams. This validates the watcher + hash strategy and the need for a dedicated query surface that shapes $vectorSearch requests.

Given the decision to use Voyage AI, MongoDB's embedding guidance explicitly recommends Voyage for state-of-the-art embeddings. We'll need to add a lightweight embedding client and load the Voyage API key from .env (or otherwise ensure env vars are injected), since the repo does not currently auto-load .env files.

Chunking should be hybrid: store one doc-level embedding per task for similarity search, then detect XML-style tags (e.g., <research>, <plan>) and chunk by those sections when present, otherwise parse Markdown with frontmatter and chunk by headings. This ensures stable chunk boundaries regardless of whether a task file is XML-like or plain Markdown while preserving holistic task similarity.
</executive-summary>

<web-research>
  <official-docs>MongoDB Atlas Vector Search index definitions require a vectorSearch index with vector fields specifying path, numDimensions (<= 8192), similarity (euclidean|cosine|dotProduct), optional quantization and hnswOptions, plus optional filter fields for pre-filtering (https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/includes/avs/avs-vector-search-type-considerations.rst). The $vectorSearch stage requires index, path, queryVector, limit, and numCandidates; numCandidates <= 10000 and recommended >= 20x limit for better recall (https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/atlas-vector-search/vector-search-stage.txt). Creating a vector search index requires MongoDB 6.0.11/7.0.2+ and Project Data Access Admin role (https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/atlas-vector-search/vector-search-type.txt). MongoDB embedding guidance recommends Voyage AI for state-of-the-art embeddings (https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/atlas-vector-search/create-embeddings.txt).</official-docs>
  <best-practices>Convert embeddings to BSON BinData vectors (float32/int1/int8) for efficient storage; avoid embedding fields inside arrays of documents/objects; use filter fields for pre-filtering and index them as type=filter; use $vectorSearch (knnBeta is deprecated for vectorSearch indexes); tune numCandidates around 20x limit to balance latency and recall; expect index updates to be eventually consistent and poll index readiness when needed; for production, implement a script to generate embeddings and customize it to your use case. For chunking, prefer semantic boundaries: XML sections if present, otherwise Markdown headings + frontmatter, and only fall back to size-based splits. Maintain both a doc-level embedding for similarity queries and section embeddings for targeted retrieval (https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/includes/avs/avs-vector-search-type-considerations.rst, https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/atlas-vector-search/vector-search-stage.txt, https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/atlas-vector-search/create-embeddings.txt).</best-practices>
  <security-concerns>Embedding pipelines can expose sensitive task markdown to external providers; use allowlists/redaction and keep credentials out of logs. Atlas index management requires elevated project roles (Project Data Access Admin), so index creation should be restricted to trusted automation (https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/atlas-vector-search/vector-search-type.txt).</security-concerns>
  <gap-analysis>APEX must add config for vectorSearch index parameters (numDimensions, similarity, quantization, filter mappings) and $vectorSearch query settings (numCandidates/limit). There is no current embedding storage format or change-consistency strategy in APEX, which is required because Atlas vector indexes are eventually consistent (https://raw.githubusercontent.com/mongodb/docs/main/content/atlas/source/includes/avs/avs-vector-search-type-considerations.rst).</gap-analysis>
</web-research>

<codebase-patterns>
  <primary-pattern location="src/intelligence/task-search.ts:1">Task similarity uses multi-signal scoring with caching; this is the closest existing search abstraction and can be augmented or bypassed when using embeddings (multi-signal + vector). Key flows at src/intelligence/task-search.ts:86 and src/intelligence/task-search.ts:175.</primary-pattern>
  <primary-pattern location="src/search/query-processor.ts:1">Search query processing already exists (FTS parsing, synonym expansion, fuzzy matching). This can be reused for hybrid search or query sanitization for a lexical fallback.</primary-pattern>
  <primary-pattern location="src/storage/watcher.ts:7">File watcher pattern (chokidar, debounced events) can be adapted to watch .apex/tasks and other markdown sources for incremental embedding refresh.</primary-pattern>
  <conventions>Tools and services are wired in src/mcp/tools/index.ts:56 with centralized initialization and Zod schemas; new MCP tools should follow the same pattern. CLI commands use Commander and FormatterFactory in src/cli/commands.</conventions>
  <reusable-snippets>PatternWatcher shows how to debounce file changes and emit add/change/unlink events for indexing (src/storage/watcher.ts:22).</reusable-snippets>
  <testing-patterns>No dedicated tests for search indexing in this repo; search behavior is exercised in task/pattern pipelines and CLI commands. Plan for unit tests around chunking and metadata extraction, and keep Atlas integration behind an interface for mocking.</testing-patterns>
  <inconsistencies>Task data lives in SQLite (tasks table) while workflow task files live in .apex/tasks markdown. Vector search will need to decide whether to treat markdown as the source of truth or sync metadata into the DB.</inconsistencies>
</codebase-patterns>

<apex-patterns>
  <pattern id="APEX.SYSTEM:PAT:AUTO:Coh7YFt2" trust="0.21" uses="1" success="100%">Generic fallback pattern; marginal relevance for external Mongo dependency.</pattern>
  <pattern id="APEX.SYSTEM:PAT:AUTO:a9f5JGcA" trust="0.09" uses="0" success="0%">MCP database initialization pattern; relevant if new tool needs to validate Mongo config at startup.</pattern>
  <anti-patterns>APEX.SYSTEM:ANTI:AUTO:09FZrpo0 warns about multiple fallback paths; prefer a single, explicit fallback (lexical search) if Atlas is unavailable.</anti-patterns>
</apex-patterns>

<documentation>
  <architecture-context>README documents that workflow task files live in .apex/tasks (README.md:384) and are created by /apex:research (README.md:395).</architecture-context>
  <past-decisions>Task similarity is cached in the task_similarity table and exposed via apex_task_find_similar (docs/mcp-tool-migration.md:110), showing that search is expected to be precomputed when possible.</past-decisions>
  <historical-learnings>CLI task management docs list "Task search by keyword" as a future enhancement, implying appetite for richer search beyond current filters (docs/CLI_TASK_MANAGEMENT.md:275).</historical-learnings>
  <docs-to-update>README.md (project structure) and docs/CLI_TASK_MANAGEMENT.md (future enhancements) once vector search is implemented.</docs-to-update>
</documentation>

<git-history>
  <similar-changes>Search-related work includes "feat(search): add advanced query processing with fuzzy matching and FTS5 support" (3730a08) and "feat(intelligence): add context pack service and task search capabilities" (e74b492). There are multiple fixes for search/discovery tests (10f75bf, 0294ec3, 42746a7).</similar-changes>
  <evolution>Search has evolved from simple lookup to multi-signal scoring plus FTS. Task similarity is precomputed and cached, which aligns with a batch or watcher-based vector indexing approach.</evolution>
</git-history>

<risks>
  <risk probability="M" impact="H">Embedding provider choice and credentials are undefined; implementation depends on this decision.</risk>
  <risk probability="M" impact="H">Markdown files may contain secrets; indexing without redaction can leak sensitive data to external services.</risk>
  <risk probability="M" impact="M">Dual storage (SQLite for tasks, Mongo for embeddings) can drift without strong sync rules and hashing.</risk>
  <risk probability="M" impact="M">Atlas vector indexes are eventually consistent; searches may miss recently updated chunks unless the index is queryable.</risk>
  <risk probability="M" impact="M">Voyage API rate limits/costs can affect indexing throughput; batching and backoff will be needed.</risk>
  <risk probability="L" impact="M">Adding the mongodb driver increases dependency surface; ESM compatibility and bundle size need verification.</risk>
</risks>

<recommendations>
  <solution id="A" name="Indexer + MCP tool with Atlas as primary">
    <philosophy>Keep existing SQLite data model, add a parallel vector index for markdown and expose it via a dedicated MCP tool.</philosophy>
    <path>1) Define an Atlas vectorSearch index with vector + filter fields (path, numDimensions <= 8192, similarity, optional quantization/hnswOptions), 2) add a hybrid indexer that stores one doc-level embedding per task plus section embeddings; sections come from XML tags when present, otherwise Markdown headings + frontmatter, 3) store Voyage AI embeddings as BinData float32 with metadata (path, section, hash, task id) mapped to filter fields, 4) load MongoDB and Voyage API credentials from .env (via dotenv or documented env injection), 5) add MCP tool apex_md_search that issues $vectorSearch with index/path/queryVector/limit/numCandidates (tune numCandidates ~20x limit), 6) optional CLI command apex md search as a wrapper.</path>
    <pros>Minimal disruption to existing DB schema, clear separation of concerns, easy to switch embedding models.</pros>
    <cons>Requires embedding provider integration and Mongo credentials; introduces a new persistence system.</cons>
    <risk-level>Medium</risk-level>
  </solution>
  <solution id="B" name="Hybrid lexical + vector search with local prefilter">
    <philosophy>Use existing FTS query processing to prefilter candidate chunks before vector search, reducing Atlas load.</philosophy>
    <path>1) Build a local chunk cache with FTS index, 2) prefilter top N chunks by keyword, 3) run vector search on Atlas for rerank or for fuzzy matches, 4) return blended results.</path>
    <pros>Lower Atlas cost, better exact match behavior, reuse QueryProcessor and FTS parser.</pros>
    <cons>More moving parts and data duplication; requires local index maintenance.</cons>
    <risk-level>Medium</risk-level>
  </solution>
  <solution id="C" name="Batch-only Atlas indexing + CLI search">
    <philosophy>Keep it simple: run a batch indexer that refreshes embeddings on demand and use CLI search for retrieval.</philosophy>
    <path>1) Add apex md index command to scan .md files and upload embeddings, 2) add apex md search to query Atlas via $vectorSearch, 3) skip background watchers.</path>
    <pros>Lowest implementation complexity, no background processes.</pros>
    <cons>Stale results unless users reindex; less seamless in workflow.</cons>
    <risk-level>Low</risk-level>
  </solution>
  <winner id="A" reasoning="Provides the best UX and aligns with existing MCP-first architecture while keeping SQLite data unchanged; watcher-based incremental updates match existing patterns."/>
</recommendations>

<next-steps>
Run `/apex:plan vector-search-md` to turn this research into architecture artifacts.
</next-steps>
</research>

<plan>
<metadata>
  <timestamp>2026-01-03T02:42:21Z</timestamp>
  <chosen-solution>A</chosen-solution>
  <complexity>7</complexity>
  <risk>MEDIUM</risk>
</metadata>

<chain-of-thought>
chain_of_thought:
  current_state:
    what_exists:
      - src/intelligence/task-search.ts:21 - Multi-signal similarity search with DB + LRU cache.
      - src/search/query-processor.ts:1 - FTS parsing, synonym expansion, fuzzy matching for lexical search.
      - src/storage/watcher.ts:7 - Debounced watcher pattern using chokidar.
      - src/mcp/tools/index.ts:56 - MCP tool registry and initialization flow.
    how_it_got_here:
      - Search evolution from commits 3730a08 (FTS + fuzzy query processing) and e74b492 (context pack + task search).
    dependencies:
      - chokidar watcher (existing)
      - MCP server initialization pipeline (src/mcp/server.ts:1)
      - Zod schema validation + generator (src/mcp/tools/*)
  problem_decomposition:
    core_problem: Provide vector search over .apex/tasks markdown using Atlas + embeddings without changing the SQLite task store.
    sub_problems:
      - Load and validate vector config from .env; hard fail if missing or invalid.
      - Chunk task markdown into doc-level + section-level chunks with stable IDs and hashes.
      - Generate embeddings via Voyage with correct dimensions.
      - Upsert/delete chunk docs in Mongo with vectorSearch-compatible fields.
      - Watch .apex/tasks for add/change/unlink and reindex incrementally.
      - Expose MCP tool for $vectorSearch queries (no lexical fallback).
  hidden_complexity:
      - Atlas vector index is eventually consistent; newly indexed chunks may not be searchable immediately.
      - Embedding dimension mismatches or model changes must invalidate cached vectors.
      - Chokidar event storms require debouncing and idempotent indexing.
      - Hard-fail requirement means no fallback path (avoid APEX.SYSTEM:ANTI:AUTO:09FZrpo0).
      - Task markdown varies (XML sections vs Markdown headings); chunking must be stable.
  success_criteria:
    automated:
      - vitest tests for chunking, hash stability, and config validation.
      - unit test for MCP tool schema validation and disabled-state error.
    manual:
      - Set env vars in .env, start MCP server, verify initial index completes.
      - Run apex_md_search and confirm results for known task content.
</chain-of-thought>

<tree-of-thought>
  <solution id="A">
    approach: Watcher-based Atlas vector indexer + MCP tool
    description: Maintain a Mongo vector collection with doc-level + section-level embeddings; watcher updates on markdown changes; MCP tool queries $vectorSearch.
    implementation:
      - Add env config + validation module (src/search/vector/config.ts:1).
      - Add markdown chunker (frontmatter + XML sections + headings fallback) (src/search/vector/markdown-chunker.ts:1).
      - Add Voyage embedding client with dimension checks (src/search/vector/voyage-client.ts:1).
      - Add Mongo vector store + upsert/delete logic (src/search/vector/mongo-store.ts:1).
      - Add indexer + watcher for .apex/tasks (src/search/vector/indexer.ts:1, src/search/vector/task-watcher.ts:1) using watcher pattern from src/storage/watcher.ts:7.
      - Add MCP tool apex_md_search and register it (src/mcp/tools/md-search.ts:1, src/mcp/tools/index.ts:56).
    patterns_used:
      - APEX.SYSTEM:PAT:AUTO:a9f5JGcA (trust 0.09, uses 0, success 0%)
    pros: Always fresh results, aligns with MCP-first architecture, avoids SQLite changes.
    cons: Requires Mongo + Voyage credentials; more moving parts; eventual consistency.
    complexity: 7
    risk: MEDIUM
  </solution>
  <solution id="B">
    approach: Hybrid lexical prefilter + vector rerank
    description: Use QueryProcessor to prefilter chunks locally, then run vector search for rerank or fallback.
    implementation:
      - Build local chunk cache + FTS index (new module) using src/search/query-processor.ts:1.
      - Prefilter top N candidates, then call Atlas for rerank.
      - Merge results with blended scoring.
    patterns_used:
      - APEX.SYSTEM:PAT:AUTO:a9f5JGcA (trust 0.09, uses 0, success 0%)
    pros: Lower Atlas usage, better exact-match recall.
    cons: Duplicate indexing logic; violates single-fallback guidance; higher complexity.
    complexity: 8
    risk: HIGH
  </solution>
  <solution id="C">
    approach: Batch-only Atlas indexing + MCP tool
    description: Run a manual indexer to refresh embeddings; no watcher.
    implementation:
      - Build batch indexer + upload embeddings.
      - Provide MCP tool only; users reindex manually.
    patterns_used:
      - APEX.SYSTEM:PAT:AUTO:a9f5JGcA (trust 0.09, uses 0, success 0%)
    pros: Lowest implementation complexity.
    cons: Stale results without manual reindexing; weaker UX.
    complexity: 4
    risk: LOW
  </solution>
  <winner id="A" reasoning="Best UX with minimal disruption and aligns with MCP-first architecture; runner-up C is simpler but yields stale results."/>
</tree-of-thought>

<chain-of-draft>
  <draft id="1">
    core_design: Batch-only indexer + MCP tool.
    identified_issues: Results go stale unless users reindex manually.
  </draft>
  <draft id="2">
    core_design: Hybrid lexical prefilter + vector rerank.
    improvements: Reduced Atlas load and better exact matches.
    remaining_issues: High complexity and contradicts anti-pattern guidance.
  </draft>
  <draft id="3">
    core_design: Watcher-based incremental indexer + MCP tool with hard-fail behavior.
    why_this_evolved: Balances UX with existing watcher pattern and avoids fallback complexity.
    patterns_integrated: Uses MCP init validation pattern (APEX.SYSTEM:PAT:AUTO:a9f5JGcA) for config gating.
  </draft>
</chain-of-draft>

<yagni>
  <excluding>
    - feature: CLI wrapper for md search
      why_not: MVP is MCP-only; CLI adds surface area.
      cost_if_included: Extra command wiring + docs + tests.
      defer_until: MCP tool usage validated.
    - feature: Lexical fallback / hybrid search
      why_not: Hard-fail requirement; avoid APEX.SYSTEM:ANTI:AUTO:09FZrpo0.
      cost_if_included: Dual-index maintenance and ambiguous behavior.
      defer_until: Explicit requirement for fallback.
    - feature: Redaction/allowlist pipeline
      why_not: MVP is opt-in with no redaction.
      cost_if_included: Parsing and policy complexity.
      defer_until: Security requirements defined.
    - feature: Batch-only CLI reindex command
      why_not: Watcher-based indexing chosen for MVP UX.
      cost_if_included: Additional CLI surface + docs.
      defer_until: Need for manual reindexing is proven.
  </excluding>
  <scope-creep-prevention>
    - Multi-provider embeddings: avoid until usage proves need.
    - UI integration: keep MCP-only for MVP.
  </scope-creep-prevention>
  <future-considerations>
    - Add CLI wrapper and docs after MCP adoption.
    - Add redaction controls if sensitive data appears in task files.
  </future-considerations>
  <complexity-budget allocated="8" used="7" reserved="1"/>
</yagni>

<patterns>
  <applying>
    - pattern_id: APEX.SYSTEM:PAT:AUTO:a9f5JGcA
      trust_score: 0.09
      usage_stats: 0 uses, 0% success
      why_this_pattern: Gate MCP tool initialization on config validation for predictable startup behavior.
      where_applying: src/mcp/tools/index.ts:56, src/mcp/tools/md-search.ts:1
      source: ctx.patterns
  </applying>
  <rejected>
    - pattern_id: APEX.SYSTEM:PAT:AUTO:Coh7YFt2
      why_not: Represents fallback behavior; hard-fail requirement forbids fallback logic.
  </rejected>
  <missing_patterns>
    - need: Vector indexing pipeline pattern
      workaround: Implement bespoke indexer with unit tests and clear interfaces.
    - need: Markdown chunking strategy pattern
      workaround: Use stable XML-section-first chunking with heading fallback and hash diffing.
  </missing_patterns>
</patterns>

<architecture-decision>
architecture_decision:
  decision: Implement watcher-based Atlas vector indexing with Voyage embeddings and an MCP-only apex_md_search tool, with env-configured hard-fail behavior.
  files_to_modify:
    - path: src/mcp/tools/index.ts
      purpose: Register apex_md_search tool and initialize vector services/watcher when enabled.
      pattern: APEX.SYSTEM:PAT:AUTO:a9f5JGcA
      validation: tests/mcp/tools/md-search.test.ts
    - path: src/mcp/index.ts
      purpose: Load .env early for MCP server (dotenv/config).
      pattern: APEX.SYSTEM:PAT:AUTO:a9f5JGcA
      validation: tests/search/vector-config.test.ts
    - path: package.json
      purpose: Add mongodb + dotenv dependencies.
      pattern: none (no applicable pattern IDs in ctx)
      validation: npm test (affected tests only)
  files_to_create:
    - path: src/search/vector/config.ts
      purpose: Env validation for Atlas/Voyage settings and enable flag.
      pattern: APEX.SYSTEM:PAT:AUTO:a9f5JGcA
      test_plan: tests/search/vector-config.test.ts
    - path: src/search/vector/types.ts
      purpose: Shared types for chunk metadata and search results.
      pattern: none (no applicable pattern IDs in ctx)
      test_plan: tests/search/markdown-chunker.test.ts
    - path: src/search/vector/markdown-chunker.ts
      purpose: Parse frontmatter + XML sections + heading fallback into stable chunks.
      pattern: none (no applicable pattern IDs in ctx)
      test_plan: tests/search/markdown-chunker.test.ts
    - path: src/search/vector/voyage-client.ts
      purpose: Batch embed content with Voyage, enforce dimensions.
      pattern: none (no applicable pattern IDs in ctx)
      test_plan: tests/search/vector-indexer.test.ts (mocked)
    - path: src/search/vector/mongo-store.ts
      purpose: Mongo connection + upsert/delete + $vectorSearch query helpers.
      pattern: none (no applicable pattern IDs in ctx)
      test_plan: tests/search/vector-indexer.test.ts (mocked)
    - path: src/search/vector/indexer.ts
      purpose: Orchestrate chunking, hashing, embedding, and persistence.
      pattern: none (no applicable pattern IDs in ctx)
      test_plan: tests/search/vector-indexer.test.ts
    - path: src/search/vector/task-watcher.ts
      purpose: Watch .apex/tasks for add/change/unlink and call indexer.
      pattern: none (no applicable pattern IDs in ctx)
      test_plan: tests/search/vector-indexer.test.ts (mocked watcher)
    - path: src/mcp/tools/md-search.ts
      purpose: MCP tool schema + handler for $vectorSearch.
      pattern: APEX.SYSTEM:PAT:AUTO:a9f5JGcA
      test_plan: tests/mcp/tools/md-search.test.ts
  implementation_sequence:
    1. Add config module + dotenv load; validate required env vars and enable flag.
    2. Implement chunker + hash logic; add unit tests.
    3. Implement Voyage client + Mongo store (mockable).
    4. Implement indexer + watcher with initial scan when enabled.
    5. Add MCP tool + tool registration + tests.
  validation_plan:
    automated:
      - npm test -- tests/search/markdown-chunker.test.ts
      - npm test -- tests/search/vector-config.test.ts
      - npm test -- tests/search/vector-indexer.test.ts
      - npm test -- tests/mcp/tools/md-search.test.ts
    manual:
      - Set .env vars and run MCP server; verify indexing logs.
      - Call apex_md_search and confirm results for a known task file.
  potential_failures:
    - risk: Missing/invalid env vars cause tool failure
      mitigation: Strict config validation with clear error messages
      detection: tests/search/vector-config.test.ts and runtime error
    - risk: Embedding dimension mismatch
      mitigation: Validate vector length before insert
      detection: indexer throws before Mongo write
    - risk: Atlas index eventual consistency
      mitigation: Document latency; avoid read-after-write assumptions
      detection: manual validation of search timing
    - risk: Watcher event storms
      mitigation: Debounce and hash-diff before embedding
      detection: performance logs in debug
</architecture-decision>

<builder-handoff>
  <mission>Implement watcher-based Atlas vector indexing and MCP-only apex_md_search with env-configured hard-fail behavior.</mission>
  <core-architecture>Vector config + markdown chunker + Voyage embedder + Mongo vector store + watcher-driven indexer + MCP tool.</core-architecture>
  <pattern-guidance>Apply APEX.SYSTEM:PAT:AUTO:a9f5JGcA for MCP init/config gating; avoid fallback paths (APEX.SYSTEM:ANTI:AUTO:09FZrpo0).</pattern-guidance>
  <implementation-order>
    1. Config + dotenv load and validation.
    2. Chunker + hash + tests.
    3. Voyage client + Mongo store.
    4. Indexer + watcher + initial scan.
    5. MCP tool + registration + tests.
  </implementation-order>
  <validation-gates>
    - After step 2: markdown chunker tests pass.
    - After step 4: indexer tests pass with mocked store.
    - After step 5: MCP tool tests pass and tool list includes apex_md_search.
  </validation-gates>
  <warnings>
    - Do not add lexical fallback or hybrid search.
    - Enforce vector dimension checks and hard-fail on config errors.
    - Avoid logging sensitive env values.
    - Expect eventual consistency in Atlas search results.
  </warnings>
</builder-handoff>

<next-steps>
Run `/apex:implement vector-search-md` to begin implementation.
</next-steps>
</plan>

<implementation>
<!-- Populated by /apex:implement -->
</implementation>

<ship>
<!-- Populated by /apex:ship -->
</ship>
