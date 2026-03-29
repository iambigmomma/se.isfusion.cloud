# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website and blog built with Next.js, TypeScript, Tailwind CSS, MDX Bundler, FaunaDB, and SWR. The site features blog posts, a library of code snippets, project showcases, and interactive features like view/like tracking and Spotify integration.

## Development Commands

```bash
# Development
yarn dev                 # Start development server on localhost:3000
yarn build              # Build production bundle
yarn start              # Start production server
yarn typecheck          # Type-check without emitting files

# Linting & Formatting
yarn lint               # Run Next.js linting
yarn lint:fix           # Auto-fix ESLint issues and format code
yarn lint:strict        # Lint with zero warnings tolerance
yarn format             # Format all files with Prettier
yarn format:check       # Check formatting without modifying files

# Testing
yarn cy                 # Open Cypress interactive test runner
yarn cy:headless        # Run Cypress tests in headless mode

# Content Management
yarn mdgen <slug>       # Generate cross-posted markdown for dev.to and Hashnode
                        # Example: yarn mdgen my-blog-post
                        # Outputs to scripts/out/<slug>/ with devto.mdx, hashnode.mdx, and og_image.png

# Pre-Commit Workflow
yarn pre-commit-check   # Run typecheck + lint before committing
yarn test:all           # Run typecheck + lint + build (full CI/CD check)
```

## Pre-Commit Workflow

**IMPORTANT**: Always run checks before committing to ensure CI/CD passes:

```bash
# Quick check before commit (recommended for every commit)
yarn pre-commit-check

# Full check before pushing to main (includes build)
yarn test:all
```

### What Gets Checked Automatically

The project uses **Husky + lint-staged** for automatic pre-commit checks:

1. **ESLint** - Code quality and style (zero warnings allowed)
2. **Prettier** - Code formatting
3. **Commitlint** - Conventional commit message format

### What You Should Run Manually

**Before every commit**, run:

```bash
yarn pre-commit-check
```

This will:

- ✅ TypeScript type checking (`yarn typecheck`)
- ✅ ESLint with zero warnings (`yarn lint:strict`)

**Before pushing to main**, run:

```bash
yarn test:all
```

This will:

- ✅ TypeScript type checking
- ✅ ESLint with zero warnings
- ✅ Production build test

### Common Issues

1. **TypeScript errors**: Run `yarn typecheck` to see all type errors
2. **Import sorting**: Run `yarn lint --fix` to auto-fix
3. **Commit message format**: Use conventional commits (feat:, fix:, docs:, etc.)
   - Lines must not exceed 100 characters
   - Format: `type: short description\n\nLonger explanation with\nline breaks as needed`

## Architecture

### Path Aliases

TypeScript is configured with `@/*` aliases that map to `src/*`. All imports use these aliases for better organization:

- `@/lib` - Utility functions and helpers
- `@/hooks` - React hooks
- `@/components` - React components
- `@/types` - TypeScript type definitions
- `@/constants` - Constants and configuration

### Content Management with MDX

All content (blog posts, library snippets, projects) lives in `src/contents/` as MDX files with frontmatter metadata. The MDX processing pipeline is centralized in `src/lib/mdx.ts`:

- **`getFiles(type)`**: Returns all files for a content type (blog, library, projects)
- **`getFileBySlug(type, slug)`**: Bundles MDX with rehype/remark plugins (syntax highlighting, autolink headings, GFM support) and returns compiled code with frontmatter
- **`getAllFilesFrontmatter(type)`**: Extracts frontmatter from all files of a type, includes reading time calculation
- **`getRecommendations(currSlug)`**: Returns 3 related blog posts based on tag similarity

Content types are defined in `src/types/frontmatters.ts`. Each type has specific required frontmatter fields:

- **BlogFrontmatter**: title, description, banner, publishedAt, tags
- **LibraryFrontmatter**: title, description, tags
- **ProjectFrontmatter**: title, description, publishedAt, techs, banner

### MDX Client-Side Utilities

`src/lib/mdx-client.ts` provides client-side utilities for content manipulation:

- **`sortByDate()`**: Sorts content by publishedAt or lastUpdated date
- **`sortByTitle()`**: Alphabetically sorts content by title
- **`getTags()`**: Extracts all unique tags from content, sorted by frequency
- **`getFeatured()`**: Filters content by featured slugs array

### MDX Components

MDX content can use custom React components defined in `src/components/content/MDXComponents.tsx`:

- `CloudinaryImg` - Optimized images from Cloudinary
- `LiteYouTubeEmbed` - Lightweight YouTube embeds
- `GithubCard` - GitHub repository cards
- `TweetCard` - Embedded tweets
- `SplitImage` / `Split` - Side-by-side image layouts
- `Quiz` - Interactive quiz components
- `CustomCode` / `Pre` - Enhanced code blocks with syntax highlighting

### Database Integration (FaunaDB)

View and like tracking is handled through FaunaDB via `src/lib/fauna.ts`:

- **`getAllContent()`**: Fetches all content metadata from database
- **`getContentMeta(slug)`**: Gets views/likes for a specific slug
- **`upsertContentMeta(slug)`**: Increments view count for content
- **`upsertLike(slug, sessionId)`**: Handles like interactions (max 5 per user session)

The database stores: `{ slug, views, likes, likesByUser: { [sessionId]: count } }`

### SWR Data Fetching Pattern

The site uses SWR for client-side data fetching with optimistic updates. Key hook: `src/hooks/useContentMeta.tsx`:

- Fetches content metadata (views, likes) from `/api/content/[slug]`
- Uses `fallbackData` from pre-fetched cache for instant rendering
- Implements optimistic UI updates for like button
- Conditionally increments views on page load based on `incrementMetaFlag`
- Debounced mutation revalidation (1s) after like actions

### Feature Flags

All major features are feature-flagged in `src/constants/env.ts`. By default, most features require production environment (`isProd = process.env.NODE_ENV === 'production'`):

- `commentFlag`: Giscus comments integration
- `contentMetaFlag`: FaunaDB view/like tracking
- `incrementMetaFlag`: Auto-increment views on page load (also checks localStorage)
- `spotifyFlag`: Spotify Now Playing widget
- `newsletterFlag`: Revue newsletter integration
- `feedbackFlag`: Feedback Fish integration
- `sayHelloFlag`: Console greeting message
- `blockDomainMeta`: Domain-restricted meta increments

To enable features locally, change `isProd` to `true` for the specific flag, but expect errors without proper environment variables.

### Page Structure

Next.js pages follow standard routing in `src/pages/`:

- Dynamic routes: `blog/[slug].tsx`, `library/[slug].tsx`, `projects/[slug].tsx`
- API routes in `pages/api/` handle server-side operations:
  - `/api/spotify`: Spotify Now Playing data
  - `/api/content`: Content metadata CRUD
  - `/api/content/[slug]`: Single content metadata and view increment
  - `/api/like/[slug]`: Like increment endpoint
  - `/api/newsletter`: Newsletter subscription

### Component Organization

Components are organized by purpose in `src/components/`:

- `buttons/`: Interactive button components
- `content/`: Blog-specific components (MDX components, comment section, table of contents)
  - `blog/`: Blog-specific components (Quiz, etc.)
  - `card/`: Card components (GithubCard)
  - `library/`: Library-specific components
  - `projects/`: Project-specific components
- `form/`: Form elements and inputs
- `images/`: Image components with Cloudinary integration
- `layout/`: Layout wrappers, header, footer, SEO
- `links/`: Custom link components (underlined, button-styled, etc.)

### Image Handling

Images are hosted on Cloudinary. The site uses lazy loading with blur placeholders. Cloudinary URLs use the `cloudinary-build-url` package for optimization. Next.js Image component is configured to allow domains: `res.cloudinary.com` and `i.scdn.co` (for Spotify).

### Styling Approach

- Tailwind CSS with custom configuration in `tailwind.config.js`
- Typography plugin for MDX content styling
- Dark mode support via `next-themes`
- Component-level styles in `src/styles/`

### Import Sorting Convention

ESLint enforces strict import ordering via `simple-import-sort` plugin (see `.eslintrc.js`):

1. External libraries & side effects
2. CSS files
3. `@/lib` and `@/hooks`
4. `@/data`
5. `@/components`
6. Other `@/` imports
7. Relative imports (up to 3 levels)
8. `@/types`

The linter will auto-fix import order on save or when running `yarn lint:fix`.

## Testing

End-to-end tests use Cypress. Test files are in `cypress/integration/`. The project uses local-cypress for running tests. Use `yarn cy` for interactive mode or `yarn cy:headless` for CI/headless mode.

## Deployment

The site is configured for Vercel deployment (`vercel.json`). Post-build, `next-sitemap` generates the sitemap automatically via the `postbuild` script.

## Cross-Posting Workflow

The `scripts/cross-post.js` script converts MDX blog posts for external platforms (dev.to and Hashnode):

- Transforms custom React components into platform-specific syntax:
  - `CloudinaryImg` → Direct image URLs
  - `GithubCard` → `{% github user/repo %}` (dev.to) or `%[https://github.com/user/repo]` (Hashnode)
  - `LiteYouTubeEmbed` → `{% youtube id %}` (dev.to) or YouTube embed URL (Hashnode)
  - `TweetCard` → `{% twitter id %}` (dev.to) or Twitter URL (Hashnode)
- Appends platform-specific footers with links back to the main site
- Downloads OG images for social sharing (from `og.isfusion.cloud` API)
- Outputs to `scripts/out/<slug>/` with `devto.mdx`, `hashnode.mdx`, and `og_image.png`

## Environment Variables

Required variables are documented in `.env.example`:

- `FAUNA_SECRET`: FaunaDB database access for view/like tracking
- `IP_ADDRESS_SALT`: For hashing user sessions in like tracking
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`: Spotify API integration for Now Playing widget
- `ADMIN_PASSWORD`: Dev tools page access (default: "admin")
- `REVUE_TOKEN`: Newsletter subscription via Revue API
- `DEVTO_KEY`: Dev.to cross-posting API key

Most features gracefully degrade when environment variables are missing in development.

## Code Quality

- Husky pre-commit hooks run lint-staged (ESLint + Prettier on staged files)
- Commitlint enforces conventional commit messages
- TypeScript strict mode enabled
- ESLint configured with TypeScript, Next.js, and Prettier rules
- Unused imports automatically flagged and removable via `unused-imports` plugin
