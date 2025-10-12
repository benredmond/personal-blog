# Personal Blog

Personal blog built with Next.js 15, featuring Neo-Bauhaus design with Scandinavian Strata aesthetics.

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS 4 + Custom Neo-Bauhaus Design System
- **Content**: JSON file backend with markdown rendering
- **Rendering**: Static Generation with ISR (1-hour revalidation)
- **Deployment**: Vercel (automatic CI/CD from GitHub)

## Features

- 📝 Markdown blog posts with GitHub Flavored Markdown
- 🎨 Neo-Bauhaus L-Frame design with vermilion accents
- ⚡ Optimized performance (10-50ms TTFB on static pages)
- 🔒 Security headers with CSP configuration
- 📱 Fully responsive design
- 🧪 Comprehensive test coverage

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Architecture

- **Backend**: Direct data access via `lib/blog.ts` (no HTTP overhead)
- **Storage**: Blog posts in `data/blog-posts.json` (version controlled)
- **Caching**: Dual-layer strategy (module-level + React cache)
- **Deployment**: Static generation at build time, ISR for updates

## Performance Metrics

- **First Load JS**: 122 KB
- **TTFB**: 10-50ms (CDN cache hit)
- **Build Time**: ~1.1 seconds
- **Lighthouse Score**: 95-100 (estimated)

## Project Structure

```
personal-blog/
├── app/                  # Next.js App Router pages
│   ├── blog/            # Blog listing and detail pages
│   └── layout.tsx       # Root layout with fonts and metadata
├── components/          # React components
│   └── blog/           # Blog-specific components
├── lib/                # Data access layer
│   └── blog.ts         # Blog data functions with caching
├── data/               # Content storage
│   └── blog-posts.json # Blog posts (markdown content)
└── __tests__/          # Test files
```

## License

MIT
