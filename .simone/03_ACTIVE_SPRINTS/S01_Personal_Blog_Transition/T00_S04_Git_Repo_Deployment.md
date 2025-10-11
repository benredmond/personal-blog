---
task_id: T00_S04
sprint_id: S01
status: open
priority: high
complexity: Low
estimated_hours: 1
created: 2025-10-11T04:30:00Z
depends_on: [T00_S01, T00_S02, T00_S03]
blocks: []
---

# Task: Initialize Git Repository and Vercel Deployment

## Description
Set up version control and continuous deployment for the personal blog. Create a separate GitHub repository and connect it to Vercel for automated deployments.

## Goal / Objectives
- Initialize git repository in `~/dev/personal-blog/`
- Create separate GitHub repository
- Configure .gitignore for Next.js
- Make initial commit with project structure
- Connect to Vercel for CD
- Verify deployment works

## Acceptance Criteria
- [ ] Git repository initialized with proper .gitignore
- [ ] Initial commit created with all project files
- [ ] GitHub repository created (separate from chinese-bot)
- [ ] Remote origin configured and pushed
- [ ] Vercel project connected to GitHub repo
- [ ] Automatic deployment configured (main branch)
- [ ] Preview deployment URL accessible
- [ ] Environment variables configured (if needed)
- [ ] Build succeeds on Vercel

## Technical Guidance

### Git Initialization
```bash
cd ~/dev/personal-blog

# Initialize git
git init

# Create .gitignore (Next.js template)
cat > .gitignore <<'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

# Initial commit
git add .
git commit -m "Initial commit: standalone personal blog project

- Next.js 15.3.1 + React 19.1.0
- Blog components extracted from chinese-bot
- Neo-Bauhaus design system duplicated
- L-Frame layout with vermilion accents
- 100% test coverage (42 tests)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### GitHub Repository Setup
```bash
# Create GitHub repo (via gh CLI)
gh repo create personal-blog --public --source=. --remote=origin

# Or manually:
# 1. Go to https://github.com/new
# 2. Create repo: "personal-blog"
# 3. Add remote: git remote add origin git@github.com:USERNAME/personal-blog.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Vercel Deployment
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Deploy
vercel --prod
```

**Vercel Configuration** (vercel.json - optional):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

## Before Starting
- [ ] Ensure T00_S01, T00_S02, T00_S03 are complete
- [ ] Verify all tests pass: `npm test`
- [ ] Check build succeeds: `npm run build`
- [ ] Have GitHub account ready
- [ ] Have Vercel account ready (can use GitHub OAuth)

## Common Gotchas
- .env files should NOT be committed (add to .gitignore)
- Large files (images) might need Git LFS
- Vercel auto-detects Next.js (no config usually needed)
- Main branch deploys to production, other branches to preview
- Build errors on Vercel might differ from local (check Node version)

## Environment Variables (if needed)

For MongoDB connection (implemented in T01):
```
# Add in Vercel dashboard or via CLI
vercel env add MONGODB_URI
```

## Validation Steps

### 1. Verify Git Setup
```bash
git status           # Should show clean working tree
git log --oneline    # Should show initial commit
git remote -v        # Should show GitHub origin
```

### 2. Verify GitHub
- Visit https://github.com/USERNAME/personal-blog
- Confirm files are visible
- Check commit history

### 3. Verify Vercel Deployment
- Visit Vercel dashboard: https://vercel.com/dashboard
- Confirm project appears
- Check deployment status (should be "Ready")
- Visit preview URL (e.g., personal-blog-xyz.vercel.app)
- Test blog page renders

### 4. Verify CI/CD
```bash
# Make a small change
echo "# Personal Blog" > README.md
git add README.md
git commit -m "Add README"
git push

# Check Vercel dashboard - should auto-deploy
```

## Success Indicators
✅ Git repository initialized with clean history
✅ GitHub repository created and pushed
✅ Vercel project connected
✅ Deployment succeeds (green checkmark)
✅ Preview URL accessible and loads blog
✅ Automatic deployments working (push triggers build)
✅ No build errors on Vercel
✅ No secrets or .env files committed

## Dependencies
- **Depends on**: T00_S01 (needs initialized project)
- **Depends on**: T00_S02 (needs blog components)
- **Depends on**: T00_S03 (needs design system for successful build)

## Related References
- Vercel Next.js guide: https://vercel.com/docs/frameworks/nextjs
- GitHub CLI: https://cli.github.com/
- Next.js .gitignore template: https://github.com/vercel/next.js/blob/canary/.gitignore
