---
task_id: T00_S03
sprint_id: S01
status: open
priority: high
complexity: Medium
estimated_hours: 1-2
created: 2025-10-11T04:30:00Z
depends_on: [T00_S01, T00_S02]
blocks: [T03_S01]
---

# Task: Duplicate Neo-Bauhaus Design System

## Description
Extract and duplicate the Neo-Bauhaus L-Frame design system (~600 lines of CSS) from chinese-bot into the personal blog project. This maintains the distinctive vermilion borders and 9/10-rated aesthetic while keeping the projects independent.

## Goal / Objectives
- Copy Neo-Bauhaus CSS variables and utilities
- Extract L-Frame component (MasterGrid)
- Replicate color palette (vermilion accent, neutral grays)
- Maintain typography and spacing scales
- Preserve 9/10 design aesthetic

## Acceptance Criteria
- [ ] Design system CSS copied to `styles/design-system.css`
- [ ] MasterGrid component implemented (L-Frame layout)
- [ ] Color variables defined in Tailwind config
- [ ] Typography scale matches chinese-bot
- [ ] Spacing/sizing utilities available
- [ ] Blog components render with correct Neo-Bauhaus styling
- [ ] L-Frame borders appear correctly (vermilion accents)
- [ ] All blog tests still pass (no styling regressions)

## File Extraction Map

### CSS Files to Copy
```
Source: ~/dev/chinese-bot/frontend/styles/
Target: ~/dev/personal-blog/styles/

Files to review and extract:
- globals.css (Neo-Bauhaus variables)
- Any design-system.css or theme.css files
```

### Components to Implement
```
Target: ~/dev/personal-blog/components/layout/

New files:
- MasterGrid.jsx (L-Frame layout component)
- LFrame.jsx (if separate from MasterGrid)
```

### Configuration Updates
```
Target: ~/dev/personal-blog/tailwind.config.js

Add:
- Neo-Bauhaus color palette
- Custom spacing scale
- Typography configuration
```

## Technical Guidance

### Expected Color Palette (from chinese-bot)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#E63946',      // Vermilion accent
        'gray-50': '#F8F9FA',
        'gray-100': '#E9ECEF',
        'gray-900': '#212529',
        // ... other colors from chinese-bot
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        // Custom spacing scale if exists
      }
    }
  }
}
```

### MasterGrid Component Pattern
```javascript
// components/layout/MasterGrid.jsx
// ABOUTME: L-Frame layout component for Neo-Bauhaus design system
// ABOUTME: Creates distinctive border accents with vermilion color

export default function MasterGrid({ children, className = '' }) {
  return (
    <div className={`master-grid ${className}`}>
      {/* L-Frame borders */}
      <div className="l-frame-top" />
      <div className="l-frame-left" />

      {/* Content area */}
      <main className="content-area">
        {children}
      </main>
    </div>
  );
}
```

### CSS Variables to Extract
Look for these in chinese-bot styles:
```css
:root {
  --color-primary: #E63946;
  --color-bg: #F8F9FA;
  --color-text: #212529;
  --spacing-unit: 8px;
  --border-width: 2px;
  /* ... other variables */
}
```

## Before Starting
- [ ] Review chinese-bot design system: `cat ~/dev/chinese-bot/frontend/styles/globals.css`
- [ ] Identify MasterGrid implementation: `cat ~/dev/chinese-bot/frontend/components/layout/MasterGrid.jsx`
- [ ] Check Tailwind config: `cat ~/dev/chinese-bot/frontend/tailwind.config.js`
- [ ] List all design-related CSS: `ls ~/dev/chinese-bot/frontend/styles/`

## Common Gotchas
- CSS custom properties need to be accessible globally
- L-Frame borders might use absolute positioning (ensure responsive)
- Tailwind 4.x config format differs from 3.x
- Some styles might be defined inline in components (extract to CSS)
- Font imports (Inter, JetBrains Mono) need to be added to `_document.js`

## Validation Steps

### Visual Check
1. Run dev server: `npm run dev`
2. Navigate to `/blog` page
3. Verify L-Frame borders appear (vermilion accents)
4. Check typography matches chinese-bot aesthetic
5. Confirm spacing/padding looks consistent

### Programmatic Check
```bash
# Run tests to ensure no styling regressions
npm test -- components/blog

# Check for missing CSS variables
grep -r "var(--" pages/ components/ | grep undefined

# Verify Tailwind compilation
npm run build
```

## Success Indicators
✅ Blog pages render with Neo-Bauhaus aesthetic
✅ L-Frame borders visible with vermilion accent
✅ Typography matches chinese-bot (9/10 design rating)
✅ All 42 blog tests still pass
✅ No console warnings about missing CSS variables
✅ Build completes without Tailwind errors
✅ Responsive behavior works (borders scale correctly)

## Dependencies
- **Depends on**: T00_S01 (needs initialized project)
- **Depends on**: T00_S02 (needs blog components to style)
- **Blocks**: T03_S01 (visual identity updates need base design system)

## Related References
- Source design system: `~/dev/chinese-bot/frontend/styles/`
- Source components: `~/dev/chinese-bot/frontend/components/layout/MasterGrid.jsx`
- Design rating: 9/10 from previous conversation
- Research: `.simone/research_personal_blog_validation.md` (mentions Neo-Bauhaus aesthetic)
