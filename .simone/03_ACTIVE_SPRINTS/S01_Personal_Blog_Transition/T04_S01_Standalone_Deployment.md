---
task_id: T04_S01
sprint_id: S01
status: open
priority: high
complexity: Low
estimated_hours: 1-2
created: 2025-10-11T02:52:02Z
updated: 2025-10-11T04:35:00Z
depends_on: [T00_S04, T01_S01, T02_S01, T03_S01, T05_S01]
---

# Task: Standalone Production Deployment

## Description
Deploy the personal blog as a completely standalone Next.js application to its own Vercel project with its own domain or subdomain. This is a separate deployment from chinese-bot with no subdomain routing complexity.

## Goal / Objectives
- Verify Vercel project is connected (from T00_S04)
- Configure custom domain or use Vercel subdomain
- Set up environment variables for production
- Test production build locally
- Deploy to production
- Verify blog accessible at production URL
- Set up automatic deployments from main branch

## Acceptance Criteria
- [ ] Production build succeeds locally
- [ ] MongoDB environment variables configured in Vercel
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned automatically
- [ ] Production deployment successful
- [ ] Blog accessible at production URL
- [ ] All blog routes work correctly
- [ ] Markdown rendering works in production
- [ ] Images load correctly
- [ ] Mobile responsiveness verified
- [ ] Page load time < 3s
- [ ] Automatic deployments configured

## Technical Guidance

### Step 1: Verify Local Production Build

```bash
cd ~/dev/personal-blog

# Test production build
npm run build

# Test production mode locally
npm run start

# Verify:
# - Build completes without errors
# - No TypeScript errors
# - No ESLint errors
# - All pages accessible
```

### Step 2: Configure Environment Variables in Vercel

**In Vercel Dashboard** (https://vercel.com/dashboard):
1. Go to your personal-blog project
2. Settings → Environment Variables
3. Add the following:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal_blog?retryWrites=true&w=majority
NODE_ENV=production
```

**Via CLI**:
```bash
vercel env add MONGODB_URI production
# Paste your MongoDB connection string when prompted

vercel env add NODE_ENV production
# Enter: production
```

### Step 3: Configure Custom Domain

**Option A: Custom Domain** (e.g., `benredmond.com`)
1. In Vercel Dashboard → Domains
2. Add domain: `benredmond.com` (or `blog.benredmond.com`)
3. Configure DNS at your domain provider:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for SSL certificate provisioning (~10 minutes)

**Option B: Vercel Subdomain** (e.g., `benredmond-blog.vercel.app`)
- Automatically assigned by Vercel
- No DNS configuration needed
- Format: `[project-name].vercel.app`

### Step 4: Deploy to Production

**Via Git Push** (Recommended):
```bash
cd ~/dev/personal-blog

# Ensure all changes committed
git status

# Push to main branch (triggers automatic deployment)
git push origin main
```

**Via Vercel CLI**:
```bash
cd ~/dev/personal-blog

# Deploy to production
vercel --prod
```

### Step 5: Monitor Deployment

1. Watch Vercel dashboard for deployment progress
2. Check build logs for errors
3. Verify deployment status: "Ready"
4. Get production URL from dashboard

### Step 6: Production Testing

**Automated checks**:
```bash
# Test homepage
curl -I https://your-domain.com
# Should return 200 OK

# Test blog listing
curl -I https://your-domain.com/blog
# Should return 200 OK

# Test MongoDB connection (check for posts)
curl https://your-domain.com/api/blog/posts
# Should return JSON with posts array
```

**Manual browser testing**:
- [ ] Visit homepage (if exists) or `/blog`
- [ ] Verify blog listing page loads
- [ ] Click on a blog post
- [ ] Verify markdown renders correctly
- [ ] Verify images load
- [ ] Test navigation links
- [ ] Check social share buttons work
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Safari, Firefox)

### Step 7: Configure Automatic Deployments

Vercel automatically deploys on push to main branch by default.

**Verify automatic deployment settings**:
1. Vercel Dashboard → Settings → Git
2. Ensure "Production Branch" is set to `main`
3. Enable "Automatically merge pull requests" (optional)

**Test automatic deployment**:
```bash
# Make a small change
echo "\n# Personal Blog\n\nMy personal blog built with Next.js" > README.md

# Commit and push
git add README.md
git commit -m "Add README"
git push origin main

# Check Vercel dashboard - should trigger new deployment
```

## Environment Variables Reference

Required for production:
```
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

Optional (add if needed):
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX (Google Analytics)
```

## Before Starting
- [ ] T00_S04 completed (git repo and initial deployment set up)
- [ ] T01_S01 completed (MongoDB backend working)
- [ ] T02_S01 completed (personal branding components added)
- [ ] T03_S01 completed (visual identity finalized)
- [ ] T05_S01 completed (SEO/OpenGraph tags added)
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Production MongoDB connection string ready
- [ ] Domain purchased (if using custom domain)

## Common Gotchas
- MongoDB connection string must use production credentials (not local)
- Ensure MongoDB network access allows Vercel IPs (or allow all: 0.0.0.0/0)
- DNS propagation can take minutes to hours for custom domains
- SSL certificate provisioning takes ~10 minutes
- Environment variables require redeployment to take effect
- Build errors in production might differ from local (check Node version matches)

## Performance Checklist
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors in production
- [ ] Images optimized (use Next.js Image component if applicable)
- [ ] API responses < 500ms

## Security Checklist
- [ ] SSL certificate active (https)
- [ ] Environment variables not exposed in client code
- [ ] MongoDB connection string not in git repository
- [ ] Content Security Policy headers configured (if needed)
- [ ] No sensitive data in error messages

## Rollback Plan

If deployment fails:
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or rollback in Vercel dashboard
# Deployments → Previous deployment → Promote to Production
```

## Success Indicators
✅ Production build succeeds with no errors
✅ Environment variables configured correctly
✅ Domain configured and SSL active
✅ Production deployment successful (green checkmark)
✅ Blog accessible at production URL
✅ MongoDB connection working in production
✅ Markdown rendering works correctly
✅ Images load properly
✅ Page load time < 3s
✅ Mobile responsive
✅ Automatic deployments working
✅ No console errors

## Post-Deployment Tasks

1. **Set up monitoring** (optional):
   - Enable Vercel Analytics
   - Set up error tracking (Sentry, LogRocket, etc.)
   - Configure uptime monitoring

2. **Update DNS records** (if using custom domain):
   - Verify DNS propagation: `dig yourdomain.com`
   - Test from different locations

3. **Share the blog**:
   - Update social media profiles with blog URL
   - Add blog link to GitHub profile
   - Update LinkedIn with blog link

## Dependencies
- **Depends on**: T00_S04 (git repo and initial deployment)
- **Depends on**: T01_S01 (backend must work)
- **Depends on**: T02_S01 (personal branding must be complete)
- **Depends on**: T03_S01 (visual identity finalized)
- **Depends on**: T05_S01 (SEO/OpenGraph for production)

## Related References
- Vercel deployment docs: https://vercel.com/docs/deployments/overview
- Vercel custom domains: https://vercel.com/docs/concepts/projects/custom-domains
- Vercel environment variables: https://vercel.com/docs/concepts/projects/environment-variables
- MongoDB Atlas IP allowlist: https://www.mongodb.com/docs/atlas/security/ip-access-list/
