---
task_id: T04_S01
sprint_id: S01
status: open
priority: high
complexity: Medium-High
estimated_hours: 3-4
created: 2025-10-11T02:52:02Z
updated: 2025-10-11T04:10:00Z
depends_on: [T01_S01, T02_S01, T03_S01, T05_S01]
---

# Task: Configure Subdomain and Deploy to Production

## Description
Configure `blog.koucai.chat` subdomain routing and deploy the personal blog to production. **Critical discovery**: Middleware exists with complex Clerk + CSP integration. Subdomain routing must be added carefully to avoid breaking existing auth/security infrastructure.

## Goal / Objectives
- Configure Next.js middleware for subdomain routing
- Setup DNS CNAME record for blog.koucai.chat
- Add subdomain to Vercel project
- Test subdomain locally
- Deploy to production
- Verify blog accessible at blog.koucai.chat

## Acceptance Criteria
- [ ] Middleware created for subdomain routing (if not exists)
- [ ] DNS CNAME configured: `blog.koucai.chat` → Vercel
- [ ] Vercel project updated with `blog.koucai.chat` domain
- [ ] Local testing works with `blog.localhost`
- [ ] Production deployment successful
- [ ] `blog.koucai.chat` loads personal blog
- [ ] Mobile responsiveness verified
- [ ] Page load time < 3s
- [ ] SSL certificate provisioned automatically
- [ ] All blog routes work correctly

## Conversation Insights

### File References
- `frontend/middleware.ts` - **EXISTS** with Clerk auth + CSP headers (151 lines)
- Research: `.simone/research_personal_blog_validation.md` - Subdomain routing validation
- Research: `~/.apex/plans/research_blog_subdomain_migration.md` - Solution A (middleware approach)
- Vercel config: `frontend/vercel.json` or project settings

### Critical Discoveries (From Validation Research)
- ✅ **Middleware EXISTS** - Complex integration with Clerk + CSP + nonce generation
- ✅ **DNS already configured** - `blog.koucai.chat` resolves to Vercel
- ❌ **No subdomain routing** - Only path-based `/blog` routes (line 65)
- ⚠️ **Integration complexity** - Must preserve Clerk auth flow and CSP headers

### Model Recommendations
- Add subdomain detection BEFORE Clerk middleware execution
- Apply CSP headers to early-return rewrite response
- Update test mode middleware with parallel subdomain logic
- Test locally first with `/etc/hosts` before production deploy

### Key Decisions
- **Solution A: Middleware routing** (from research)
  - Single codebase, one deployment
  - Subdomain routes via edge middleware
  - No CORS issues, shared auth (if needed later)
  - Cost-effective: $20/mo Vercel Pro (or free Hobby)

## Technical Guidance

### Step 1: Check if Middleware Exists

```bash
# Check if middleware already configured
ls frontend/middleware.ts
# If exists: Review and update
# If not exists: Create new
```

### Step 2: Add Subdomain Routing to Existing Middleware

**IMPORTANT**: The middleware already exists with Clerk + CSP integration. We need to add subdomain routing carefully.

**File**: `frontend/middleware.ts` (EDIT - lines 47-50)

**Current code** (line 47):
```typescript
async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isTestMode) {
    return testMiddleware(request);
  }
```

**Add subdomain routing BEFORE Clerk import** (insert after line 46):
```typescript
async function middleware(request: NextRequest, event: NextFetchEvent) {
  // [NEW] Subdomain routing - handle blog.koucai.chat
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.includes('localhost')
    ? hostname.split('.')[0]
    : hostname.match(/^([^.]+)\./)?.[1];

  // Skip static files for subdomain routing
  const isStaticFile = request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.');

  // Route blog subdomain to /blog pages
  if (subdomain === 'blog' && !isStaticFile) {
    const url = request.nextUrl.clone();
    // Rewrite blog.koucai.chat → /blog
    url.pathname = `/blog${url.pathname === '/' ? '' : url.pathname}`;

    // [CRITICAL] Apply CSP headers to rewrite response
    const response = NextResponse.rewrite(url);
    const nonce = crypto.randomUUID();
    const isDevelopment = process.env.NODE_ENV === 'development';
    const cspConfig = getCSPConfig(nonce, isDevelopment);
    const cspHeader = generateCSPHeader(cspConfig);
    const colonIndex = cspHeader.indexOf(': ');
    const cspHeaderValue = cspHeader.substring(colonIndex + 2);

    response.headers.set(
      cspConfig.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
      cspHeaderValue
    );

    const reportToHeader = generateReportToHeader();
    const reportColonIndex = reportToHeader.indexOf(': ');
    const reportToValue = reportToHeader.substring(reportColonIndex + 2);
    response.headers.set('Report-To', reportToValue);
    response.headers.set('x-nonce', nonce);

    return response;
  }

  if (isTestMode) {
    return testMiddleware(request);
  }
```

**Why this integration approach**:
1. **Executes BEFORE Clerk** - Avoids double-processing blog routes through auth
2. **Applies CSP headers** - Maintains security policy for blog subdomain
3. **Early return** - Blog traffic skips Clerk middleware entirely (blog is public)
4. **Preserves existing logic** - No changes to Clerk or test mode flows
  beforeAuth: (req: NextRequest) => {
    const url = req.nextUrl.clone();
    const hostname = req.headers.get('host') || '';

    // Handle localhost development
    const subdomain = hostname.includes('localhost')
      ? hostname.split('.')[0]
      : hostname.match(/^([^.]+)\./)?.[1];

    // Skip static files and APIs
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/static') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Route blog subdomain to /blog pages
    if (subdomain === 'blog') {
      url.pathname = `/blog${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  },

  publicRoutes: [
    '/',
    '/blog(.*)',  // Blog is public
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**If Clerk not used**, simplified version:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  const subdomain = hostname.includes('localhost')
    ? hostname.split('.')[0]
    : hostname.match(/^([^.]+)\./)?.[1];

  // Skip static files
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Route blog subdomain
  if (subdomain === 'blog') {
    url.pathname = `/blog${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Step 3: Test Locally

**Add to `/etc/hosts`**:
```bash
sudo vi /etc/hosts
# Add line:
127.0.0.1 blog.localhost
```

**Test**:
```bash
# Start dev server
cd frontend
npm run dev

# Test in browser
open http://blog.localhost:3000
# Should show blog listing page

# Test main domain still works
open http://localhost:3000
# Should show main app
```

### Step 4: Configure DNS

**DNS Provider** (Vercel, Cloudflare, or domain registrar):

**Option A: Wildcard CNAME** (Recommended):
```
*.koucai.chat → CNAME → cname.vercel-dns.com
```

**Option B: Specific subdomain**:
```
blog.koucai.chat → CNAME → cname.vercel-dns.com
```

**Check existing DNS**:
```bash
# Check if wildcard already configured
dig *.koucai.chat

# Check specific subdomain
dig blog.koucai.chat
```

### Step 5: Configure Vercel

**In Vercel Dashboard**:
1. Go to project settings → Domains
2. Add domain: `blog.koucai.chat`
3. Vercel will provide DNS instructions (if not already configured)
4. Wait for SSL certificate provisioning (~10 minutes)

**Verify**:
- Main domain: `koucai.chat` (or `app.koucai.chat`)
- Blog subdomain: `blog.koucai.chat`

### Step 6: Deploy

```bash
cd frontend
npm run build  # Test build succeeds
git add .
git commit -m "feat(blog): Configure subdomain routing for personal blog

- Add Next.js middleware for blog.koucai.chat routing
- Implement subdomain rewrite to /blog pages
- Enable local testing via blog.localhost
- Prepare for production deployment

Related: T04_S01 Subdomain Deployment"

git push origin main
```

**Monitor Vercel deployment**:
- Check build logs
- Verify deployment success
- Check middleware runs at edge

### Step 7: Production Testing

**Test checklist**:
```bash
# Test blog subdomain
curl -I https://blog.koucai.chat
# Should return 200 OK

# Test blog post detail
curl -I https://blog.koucai.chat/posts/ai-changes-everything-thinking-vs-doing
# Should return 200 OK (once [slug].jsx handles URL)

# Test main domain still works
curl -I https://koucai.chat
# Should return 200 OK
```

**Browser testing**:
- [ ] Visit `blog.koucai.chat` - loads blog listing
- [ ] Check mobile responsiveness
- [ ] Test post detail page
- [ ] Verify navigation links work
- [ ] Check page load speed (< 3s)
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)

## Before Starting
- [ ] Verify blog works locally at `/blog` route
- [ ] Check if middleware already exists
- [ ] Confirm DNS provider access
- [ ] Confirm Vercel project access
- [ ] Backup current middleware (if exists)

## Common Gotchas
- Middleware runs on every request - ensure matchers are specific
- Local testing requires `/etc/hosts` modification
- DNS propagation can take minutes to hours
- SSL certificate provisioning takes ~10 minutes
- Edge middleware has size limits (~1MB)
- Test main domain still works after middleware changes

## Rollback Plan
If deployment fails:
```bash
# Revert middleware changes
git revert HEAD
git push origin main

# Or disable subdomain in Vercel dashboard
# Remove blog.koucai.chat from domains
```

## Success Indicators
✅ Middleware created/updated successfully
✅ Local testing works: `blog.localhost:3000` loads blog
✅ DNS configured: `blog.koucai.chat` resolves to Vercel
✅ Vercel domain added: `blog.koucai.chat` in project
✅ Production deployment successful
✅ `blog.koucai.chat` loads personal blog
✅ SSL certificate active (https works)
✅ Page load < 3s
✅ Mobile responsive
✅ Main domain (`koucai.chat`) still works

## Performance Checklist
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] Images optimized (Next.js Image component)

## Security Checklist
- [ ] SSL certificate active (https)
- [ ] Security headers present (CSP, etc.)
- [ ] No sensitive data in client logs
- [ ] API endpoints still protected (if any)

## Dependencies
- **Depends on**: T01_S01 (backend must work)
- **Depends on**: T02_S01 (personal branding must be complete)
- **Depends on**: T03_S01 (visual identity finalized)

## Related References
- Research: `~/.apex/plans/research_blog_subdomain_migration.md` - Solution A
- Middleware docs: [Next.js Middleware](https://nextjs.org/docs/pages/building-your-application/routing/middleware)
- Vercel docs: [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- Plan: `~/.apex/plans/plan_personal_blog_transition.md` - "Phase 4: Deployment & DNS"
