---
task_id: T03_S01
sprint_id: S01
status: open
priority: medium
complexity: Simple
estimated_hours: 1-2
created: 2025-10-11T02:52:02Z
depends_on: [T01_S01]
---

# Task: Visual Identity Updates (Optional Polish)

## Description
Optional visual polish to ensure blog feels personal rather than corporate. Main decision: keep Neo-Bauhaus design (9/10 rating) or simplify. Recommendation is to keep current design as it's Ben's aesthetic choice, not Koucai-specific branding.

## Goal / Objectives
- Decide: Keep Neo-Bauhaus design or simplify
- Update any Koucai-specific visual elements (if needed)
- Ensure blog feels personal, not corporate
- Maintain 9/10 design quality rating
- Optional: Simplify colors if desired

## Acceptance Criteria
- [ ] Design decision made (keep or simplify)
- [ ] If keeping: No changes needed (Neo-Bauhaus is Ben's aesthetic)
- [ ] If simplifying: Border colors updated, MasterGrid optionally replaced
- [ ] Blog still looks professional and polished
- [ ] Mobile responsive maintained
- [ ] All 42 tests still pass
- [ ] Visual consistency across all blog pages

## Conversation Insights

### Model Recommendations
- **Recommendation: KEEP Neo-Bauhaus design**
  - 9/10 design rating from professional review
  - Already tested and accessible (100% coverage)
  - It's Ben's aesthetic choice, not Koucai branding
  - Professional appearance for personal brand
  - L-Frame architecture is signature style

- **Alternative: Simplify**
  - Only if Ben specifically wants minimalist aesthetic
  - Replace vermilion with neutral gray
  - Replace MasterGrid with simple container
  - Simpler but less distinctive

### Key Decisions
- Neo-Bauhaus is personal aesthetic, not corporate branding
- L-Frame borders differentiate blog from generic templates
- Keep professional appearance for credibility
- Vermilion red is blog identity (TOP + LEFT borders)

## Technical Guidance

### Option A: Keep Neo-Bauhaus Design (Recommended)

**Action**: NO CODE CHANGES NEEDED

**Rationale**:
- Design quality: 9/10 professional rating
- Fully tested: 42 passing tests, 100% coverage
- Accessible: WCAG 2.1 AA compliant
- Performance: Optimized CSS, no bloat
- Identity: Distinctive visual style for personal brand
- Architecture: L-Frame is signature construct

**Verification**:
- [ ] Confirm vermilion borders feel personal, not corporate
- [ ] Check MasterGrid layout works for content
- [ ] Verify design system CSS loaded correctly
- [ ] Test mobile responsiveness maintained

### Option B: Simplify Design (Alternative)

**Only pursue if Ben explicitly requests minimalism**

**Changes to make**:

1. **Simplify BlogPostCard borders**:
```css
/* components/blog/BlogPostCard.module.css */

.lFrameBorderTop {
  background: var(--color-gray-700);  /* Was: var(--color-vermilion) */
}

.lFrameBorderLeft {
  background: var(--color-gray-700);  /* Was: var(--color-vermilion) */
}
```

2. **Replace MasterGrid with simple container** (optional):
```jsx
// pages/blog/index.jsx
// Replace:
<MasterGrid>
  {/* content */}
</MasterGrid>

// With:
<div className="container max-w-6xl mx-auto px-4">
  {/* content */}
</div>
```

3. **Remove category color logic** (optional):
```jsx
// components/blog/BlogPostCard.jsx
// Remove matcha green special handling:
const isLearningCategory = category && /learn|study|lesson|tutorial|guide/i.test(category);
// Keep all categories same color
```

## Design System Variables

**Current Colors** (keep these):
- Vermilion: `#ff3a2d` - Blog borders (TOP + LEFT)
- Ultramarine: `#0052cc` - Links and accents
- Off-white: `#fffef9` - Background
- Warm gray: Text colors

**Typography**:
- Blog body: 18px
- Max-width: 720px (optimized for reading)
- Line height: 1.6
- Perfect fourth scale (1.333)

**Spacing** (Ma principles):
- 8px baseline grid
- Ma (間) negative space
- Generous mobile padding

## Before Starting
- [ ] **DECIDE**: Keep Neo-Bauhaus or simplify?
- [ ] Review design system at `styles/`
- [ ] Check current BlogPostCard appearance
- [ ] Consider: Does vermilion feel "Koucai" or "professional blog"?
- [ ] Test blog appearance in browser

## Common Gotchas
- Don't accidentally break existing styles
- Maintain 8px grid alignment if keeping system
- Ensure mobile responsiveness if changing layouts
- Run tests after any CSS changes
- Keep accessibility (color contrast ratios)

## Success Indicators
✅ Design decision documented
✅ Blog feels personal, not corporate
✅ Professional appearance maintained (or intentionally simplified)
✅ All tests still pass (42 tests)
✅ Mobile responsive
✅ Accessibility maintained (WCAG 2.1 AA)
✅ Performance not degraded

## Decision Tree

**If keeping Neo-Bauhaus**:
- Mark task as completed (no changes)
- Document decision: "Kept Neo-Bauhaus - Ben's aesthetic"
- Verify appearance feels personal

**If simplifying**:
- Update BlogPostCard.module.css (border colors)
- Optionally replace MasterGrid
- Run tests: `npm test`
- Verify mobile responsiveness
- Check accessibility still meets standards

## Testing Checklist
- [ ] Run full test suite: `npm test`
- [ ] Visual regression: Compare before/after screenshots
- [ ] Mobile test: Verify responsiveness on phone
- [ ] Accessibility: Run Lighthouse audit
- [ ] Performance: Check page load times

## Dependencies
- **Depends on**: T01_S01 (needs working blog to update visually)
- **Optional**: Can run parallel with T02_S01

## Related References
- Design review: `.simone/03_ACTIVE_SPRINTS/S08_Marketing_Website_Blog/meta.md` - 9/10 rating
- BlogPostCard: `components/blog/BlogPostCard.jsx`
- Design system: `styles/`
- Plan: `~/.apex/plans/plan_personal_blog_transition.md` - "Phase 2: Visual Identity"
