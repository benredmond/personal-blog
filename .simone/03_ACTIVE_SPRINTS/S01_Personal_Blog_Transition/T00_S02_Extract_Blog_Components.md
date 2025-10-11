---
task_id: T00_S02
sprint_id: S01
status: open
priority: critical
complexity: Medium
estimated_hours: 2-3
created: 2025-10-11T04:30:00Z
depends_on: [T00_S01]
blocks: [T01_S01]
---

# Task: Extract Blog Components from Chinese-Bot

## Description
Copy all blog-related components, pages, and utilities from `~/dev/chinese-bot/frontend/` to the new standalone project. Maintain the 100% test coverage by migrating tests as well.

## Goal / Objectives
- Extract blog pages (`pages/blog/`)
- Extract blog components (`components/blog/`)
- Extract blog tests (`__tests__/components/blog/`)
- Update import paths to work in new project structure
- Verify all 42 tests pass in new location

## Acceptance Criteria
- [ ] Blog pages copied: `index.jsx`, `[slug].jsx`
- [ ] Blog components copied: `BlogPostCard.jsx`, `BlogListing.jsx`, `EmptyState.jsx`
- [ ] Blog tests copied with 100% coverage maintained
- [ ] All import paths updated (remove chinese-bot-specific imports)
- [ ] Tests pass: `npm test -- components/blog`
- [ ] No references to chinese-bot codebase remain
- [ ] Blog listing page renders (will show empty state until T01)
- [ ] TypeScript/ESLint errors resolved

## File Migration Map

### Pages to Copy
```
Source: ~/dev/chinese-bot/frontend/pages/blog/
Target: ~/dev/personal-blog/pages/blog/

Files:
- index.jsx → index.jsx
- [slug].jsx → [slug].jsx
```

### Components to Copy
```
Source: ~/dev/chinese-bot/frontend/components/blog/
Target: ~/dev/personal-blog/components/blog/

Files:
- BlogPostCard.jsx → BlogPostCard.jsx
- BlogListing.jsx → BlogListing.jsx
- EmptyState.jsx → EmptyState.jsx
```

### Tests to Copy
```
Source: ~/dev/chinese-bot/frontend/__tests__/components/blog/
Target: ~/dev/personal-blog/__tests__/components/blog/

Files:
- BlogListing.test.jsx → BlogListing.test.jsx
- BlogPostCard.test.jsx → BlogPostCard.test.jsx
- EmptyState.test.jsx → EmptyState.test.jsx
```

### Supporting Files
```
- lib/api/blog.js (if exists)
- Any blog utilities in lib/
```

## Import Path Updates Required

**Remove these imports** (chinese-bot specific):
- `import MasterGrid from '@/components/layout/MasterGrid'` → Will be replaced in T00_S03
- Any references to chinese-bot design system components
- Clerk authentication imports (if any)

**Update these imports**:
- Ensure all `@/` aliases work correctly in new project
- Update relative paths if folder structure changed
- Add placeholder for design system components (to be implemented in T00_S03)

## Technical Guidance

### Test Configuration
Copy Jest/testing-library config from chinese-bot:
```bash
# Copy test setup files
cp ~/dev/chinese-bot/frontend/jest.config.js ~/dev/personal-blog/
cp ~/dev/chinese-bot/frontend/jest.setup.js ~/dev/personal-blog/
```

Install test dependencies:
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "jest": "^29.x",
    "jest-environment-jsdom": "^29.x"
  }
}
```

### Temporary Stubs for Missing Dependencies

Create temporary stubs for dependencies implemented in T00_S03:
```javascript
// components/layout/MasterGrid.jsx (temporary stub)
export default function MasterGrid({ children }) {
  return <div className="container mx-auto px-4">{children}</div>;
}
```

## Before Starting
- [ ] T00_S01 completed (project initialized)
- [ ] Verify all blog files exist in chinese-bot: `ls ~/dev/chinese-bot/frontend/pages/blog/`
- [ ] Check test setup in chinese-bot: `cat ~/dev/chinese-bot/frontend/jest.config.js`
- [ ] List all blog-related imports: `grep -r "from.*blog" ~/dev/chinese-bot/frontend/`

## Common Gotchas
- MasterGrid component won't exist yet (create temporary stub)
- Design system colors/styles will be missing (handled in T00_S03)
- API endpoint will 404 until T01 (expected, empty state should show)
- Test imports might need path adjustments
- Some tests might depend on chinese-bot context (remove or mock)

## Success Indicators
✅ All 42 blog tests pass in new project
✅ Blog listing page renders without console errors
✅ Empty state shows (API 404 is expected until T01)
✅ No import errors or missing dependencies
✅ ESLint passes on all copied files
✅ Test coverage remains at 100%

## Dependencies
- **Depends on**: T00_S01 (needs initialized project)
- **Blocks**: T01_S01 (backend API needs components to be present)

## Related References
- Source files: `~/dev/chinese-bot/frontend/pages/blog/`, `~/dev/chinese-bot/frontend/components/blog/`
- Test files: `~/dev/chinese-bot/frontend/__tests__/components/blog/`
- Design system (for T00_S03): `~/dev/chinese-bot/frontend/styles/`
