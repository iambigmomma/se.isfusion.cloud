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
```

## Architecture

### Content Management with MDX

All content (blog posts, library snippets, projects) lives in `src/contents/` as MDX files with frontmatter metadata. The MDX processing pipeline is centralized in `src/lib/mdx.ts`:

- **`getFiles(type)`**: Returns all files for a content type (blog, library, projects)
- **`getFileBySlug(type, slug)`**: Bundles MDX with rehype/remark plugins (syntax highlighting, autolink headings, GFM support) and returns compiled code with frontmatter
- **`getAllFilesFrontmatter(type)`**: Extracts frontmatter from all files of a type, includes reading time calculation
- **`getRecommendations(currSlug)`**: Returns 3 related blog posts based on tag similarity

Content types are defined in `src/types/frontmatters.ts`. Each type has specific required frontmatter fields.

### Database Integration (FaunaDB)

View and like tracking is handled through FaunaDB via `src/lib/fauna.ts`:

- **`getAllContent()`**: Fetches all content metadata from database
- **`getContentMeta(slug)`**: Gets views/likes for a specific slug
- **`upsertContentMeta(slug)`**: Increments view count for content
- **`upsertLike(slug, sessionId)`**: Handles like interactions (max 5 per user session)

The database stores: `{ slug, views, likes, likesByUser: { [sessionId]: count } }`

### Feature Flags

All major features are feature-flagged in `src/constants/env.ts`. By default, most features require production environment:

- `commentFlag`: Giscus comments integration
- `contentMetaFlag`: FaunaDB view/like tracking
- `incrementMetaFlag`: Auto-increment views on page load
- `spotifyFlag`: Spotify Now Playing widget
- `newsletterFlag`: Revue newsletter integration
- `feedbackFlag`: Feedback Fish integration

To enable features locally, change `isProd` to `true` for the specific flag, but expect errors without proper environment variables.

### Page Structure

Next.js pages follow standard routing in `src/pages/`:

- Dynamic routes: `blog/[slug].tsx`, `library/[slug].tsx`, `projects/[slug].tsx`
- API routes in `pages/api/` handle server-side operations (Spotify, content metadata, likes, newsletter)

### Component Organization

Components are organized by purpose in `src/components/`:

- `buttons/`: Interactive button components
- `content/`: Blog-specific components (MDX components, comment section, table of contents)
- `form/`: Form elements and inputs
- `images/`: Image components with Cloudinary integration
- `layout/`: Layout wrappers, header, footer, SEO
- `links/`: Custom link components (underlined, button-styled, etc.)

### Image Handling

Images are hosted on Cloudinary. The site uses lazy loading with blur placeholders. Cloudinary URLs use the `cloudinary-build-url` package for optimization.

### Styling Approach

- Tailwind CSS with custom configuration in `tailwind.config.js`
- Typography plugin for MDX content styling
- Dark mode support via `next-themes`
- Component-level styles in `src/styles/`

### Import Sorting Convention

ESLint enforces strict import ordering via `simple-import-sort`:

1. External libraries & side effects
2. CSS files
3. `@/lib` and `@/hooks`
4. `@/data`
5. `@/components`
6. Other `@/` imports
7. Relative imports (up to 3 levels)
8. `@/types`

## Testing

End-to-end tests use Cypress. Test files are in `cypress/integration/`. The project uses local-cypress for running tests.

## Deployment

The site is configured for Vercel deployment (`vercel.json`). Post-build, `next-sitemap` generates the sitemap automatically.

## Cross-Posting Workflow

The `scripts/cross-post.js` script converts MDX blog posts for external platforms:

- Transforms custom React components (CloudinaryImg, GithubCard, LiteYouTubeEmbed, TweetCard) into platform-specific syntax
- Appends platform-specific footers with links back to the main site
- Downloads OG images for social sharing

## Environment Variables

Required variables are documented in `.env.example`:

- `FAUNA_SECRET`: FaunaDB database access
- `IP_ADDRESS_SALT`: For hashing user sessions
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`: Spotify API integration
- `ADMIN_PASSWORD`: Dev tools page access
- `REVUE_TOKEN`: Newsletter subscription
- `DEVTO_KEY`: Dev.to cross-posting

Most features gracefully degrade when environment variables are missing in development.

## Code Quality

- Husky pre-commit hooks run lint-staged
- Commitlint enforces conventional commit messages
- TypeScript strict mode enabled
- ESLint configured with TypeScript, Next.js, and Prettier rules
