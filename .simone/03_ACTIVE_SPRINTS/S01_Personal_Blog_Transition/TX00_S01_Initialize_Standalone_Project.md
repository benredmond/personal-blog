---
task_id: T00_S01
sprint_id: S01
status: complete
priority: critical
complexity: Low
estimated_hours: 1
created: 2025-10-11T04:30:00Z
completed: 2025-10-11T13:30:00Z
blocks: [T00_S02, T00_S03, T00_S04]
---

# Task: Initialize Standalone Next.js Project

## Description
Create a new standalone Next.js 15 application at `~/dev/personal-blog/` with the same base configuration as the chinese-bot frontend. This is the foundation for extracting the blog into its own independent project.

## Goal / Objectives
- Initialize clean Next.js 15 project with React 19
- Match chinese-bot configuration (ESLint, Tailwind, etc.)
- Set up basic project structure (pages, components, lib)
- Install core dependencies
- Verify dev server runs successfully

## Acceptance Criteria
- [x] Project initialized at `~/dev/personal-blog/`
- [x] Next.js 15.5.4 + React 19.1.0 installed (App Router)
- [x] Tailwind CSS configured
- [x] ESLint + Prettier configured (match chinese-bot standards)
- [x] Basic folder structure created: `components/`, `lib/`, `public/images/`
- [x] Dev server runs (default Next.js page available)
- [x] Default homepage renders successfully
- [x] No console errors or warnings (ESLint passes)

## Technical Guidance

### Initialization Command
```bash
cd ~/dev
npx create-next-app@15.3.1 personal-blog \
  --js \
  --tailwind \
  --eslint \
  --app=false \
  --src-dir=false \
  --import-alias="@/*"
```

### Key Configuration

**package.json** - Match these versions from chinese-bot:
```json
{
  "dependencies": {
    "next": "15.3.1",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "eslint": "^9",
    "eslint-config-next": "15.3.1",
    "prettier": "^3.4.2",
    "tailwindcss": "^4.0.14"
  }
}
```

**Folder Structure to Create**:
```
~/dev/personal-blog/
├── pages/
│   ├── _app.js
│   ├── _document.js
│   ├── index.js
│   └── api/
├── components/
├── lib/
├── public/
│   └── images/
├── styles/
│   └── globals.css
├── .eslintrc.json
├── tailwind.config.js
└── package.json
```

### ESLint Configuration
Match chinese-bot standards (check `~/dev/chinese-bot/frontend/.eslintrc.json`):
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "no-unused-vars": "warn"
  }
}
```

## Before Starting
- [ ] Confirm `~/dev/personal-blog/` doesn't already exist (or is empty)
- [ ] Check Node version: `node --version` (should be 18+ for Next.js 15)
- [ ] Review chinese-bot config: `~/dev/chinese-bot/frontend/package.json`

## Common Gotchas
- Next.js 15 uses Pages Router by default if `--app=false` is set
- Port 3000 might be in use (Next.js will auto-increment to 3001)
- Import alias `@/*` maps to project root for cleaner imports
- Tailwind 4.x has different config than 3.x

## Success Indicators
✅ `npm run dev` starts without errors
✅ `localhost:3000` shows Next.js default page
✅ No console errors in browser or terminal
✅ ESLint passes: `npm run lint`
✅ Project structure matches chinese-bot conventions

## Dependencies
- **Blocks**: T00_S02 (can't extract components without base project)
- **Blocks**: T00_S03 (can't add design system without base project)
- **Blocks**: T00_S04 (can't deploy without initialized project)

## Related References
- Source repo: `~/dev/chinese-bot/frontend/`
- Next.js 15 docs: https://nextjs.org/docs
