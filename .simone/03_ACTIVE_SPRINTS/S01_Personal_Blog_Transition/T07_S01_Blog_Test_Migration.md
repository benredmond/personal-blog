---
task_id: T07_S01
sprint_id: S01
status: open
priority: medium
complexity: Medium
estimated_hours: 2-3
created: 2025-10-11T19:45:00Z
depends_on: [TX00_S02, T01_S01]
blocks: []
---

# Task: Migrate Blog Component Tests

## Description
Migrate remaining 41 blog component tests from chinese-bot to personal-blog. Update test mocks from Pages Router (next/router) to App Router (next/navigation) patterns. Ensure 100% test coverage is maintained.

## Goal / Objectives
- Migrate BlogListing.test.tsx from chinese-bot
- Migrate BlogPostCard.test.tsx from chinese-bot
- Update all test mocks to use next/navigation instead of next/router
- Ensure all 42 tests pass (1 already migrated: EmptyState.test.tsx)
- Maintain 100% test coverage on blog components

## Acceptance Criteria
- [ ] BlogListing.test.tsx migrated with updated mocks
- [ ] BlogPostCard.test.tsx migrated with updated mocks
- [ ] All tests use next/navigation mocks (not next/router)
- [ ] All 42 tests passing: `npm test -- components/blog`
- [ ] Test coverage remains at 100% for blog components
- [ ] No warnings or deprecated patterns in tests
- [ ] Tests properly handle Client Component vs Server Component patterns

## Test Files to Migrate

### From chinese-bot
```
Source: ~/dev/chinese-bot/frontend/__tests__/components/blog/
Target: ~/dev/personal-blog/__tests__/components/blog/

Files:
- BlogListing.test.jsx → BlogListing.test.tsx (update mocks)
- BlogPostCard.test.jsx → BlogPostCard.test.tsx (update mocks)
- EmptyState.test.jsx → EmptyState.test.tsx ✅ (already done)
```

## Mock Updates Required

### Pages Router → App Router Mock Changes

**OLD (Pages Router)**:
```javascript
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: { page: '1' },
    pathname: '/blog',
  }),
}));
```

**NEW (App Router)**:
```javascript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/blog',
  useSearchParams: () => new URLSearchParams('page=1'),
}));
```

## Known Issues from TX00_S02

1. **BlogListing uses useRouter** - Tests need to mock next/navigation hooks
2. **Client Component testing** - BlogListing is now a Client Component
3. **Server Component patterns** - BlogPostCard and EmptyState are Server-safe
4. **TypeScript conversion** - All tests need TypeScript interfaces

## Testing Strategy

### Unit Tests
- **BlogListing.test.tsx**: Test rendering, pagination, post click handlers
- **BlogPostCard.test.tsx**: Test variant rendering, metadata display, L-Frame borders
- **EmptyState.test.tsx**: ✅ Already passing

### Mock Strategy
```typescript
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/blog'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock fetch globally (already in jest.setup.js)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ posts: mockPosts, total: 10 }),
  })
);
```

## Before Starting
- [ ] Verify TX00_S02 completed (blog components migrated)
- [ ] Verify T01_S01 completed (API routes exist) - Optional but helpful
- [ ] Check jest.setup.js has correct next/navigation mocks
- [ ] Review current test infrastructure setup

## Common Gotchas
- **Client Component testing**: BlogListing needs render with proper mocks
- **useSearchParams**: Returns URLSearchParams object, not plain object
- **TypeScript types**: Import types from @testing-library/react
- **CSS modules**: May need mock in jest.config.js if tests fail
- **Async components**: Server Components can't be directly tested (test children instead)

## Success Indicators
✅ All 42 tests passing
✅ No console warnings during test run
✅ Coverage report shows 100% for blog components
✅ Tests run in under 30 seconds
✅ No flaky tests (run multiple times to verify)

## Dependencies
- **Depends on**: TX00_S02 (blog components must exist first)
- **Optional**: T01_S01 (API routes helpful but not required for unit tests)

## Notes from TX00_S02 Completion
- Test infrastructure validated with 1 passing test (EmptyState.test.tsx)
- Jest 30.2.0 and React Testing Library 16.3.0 installed
- jest.setup.js configured with next/navigation mocks
- Build passing, components ready for testing

## Estimated Time Breakdown
- Migrate BlogListing.test.tsx: 1 hour (20+ tests)
- Migrate BlogPostCard.test.tsx: 1 hour (15+ tests)
- Fix any TypeScript/mock issues: 30 min
- Verify coverage and cleanup: 30 min
**Total**: 2-3 hours
