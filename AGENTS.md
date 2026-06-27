# PostPencil — Complete Project Documentation

> **Last Updated:** 2026-06-27
> **Status:** Production-ready
> **Stack:** Next.js 16 App Router + TypeScript + Tailwind CSS v4 + Drizzle ORM + MySQL + Auth.js

---

## Project Overview

PostPencil is an X/Twitter-style social learning platform where users share educational resources (PDFs, notes, presentations, assignments, question papers). Users can like, comment, bookmark, follow creators, and discover trending content.

**Live URL:** http://localhost:3000 (dev) / https://postpencil.com (production)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 App Router, TypeScript, Tailwind CSS |
| UI Components | Custom shadcn/ui pattern (Radix UI primitives) |
| State | TanStack Query + Zustand |
| Backend | Next.js Route Handlers |
| Database | Hostinger MySQL |
| ORM | Drizzle ORM |
| Auth | Auth.js (NextAuth v5 beta) |
| Email | Nodemailer (Hostinger SMTP) |
| Hosting | Vercel (frontend) + Hostinger (DB + SMTP) |

---

## Project Structure

```
src/
├── middleware.ts                     # JWT auth + rate limiting + route protection
├── app/
│   ├── layout.tsx                    # Root layout (Plus Jakarta Sans, JetBrains Mono)
│   ├── page.tsx                      # Landing page for unauthenticated users
│   ├── globals.css                   # Tailwind + theme vars + animations
│   ├── not-found.tsx                 # 404 page with SVG illustration
│   ├── error.tsx                     # Runtime error page
│   ├── global-error.tsx              # Layout error page
│   ├── sitemap.ts                    # Dynamic sitemap
│   ├── robots.ts                     # robots.txt
│   ├── verify-email/                 # Email verification page
│   ├── pending-verification/         # Resend verification page
│   ├── forgot-password/              # Forgot password page
│   ├── reset-password/               # Reset password page
│   ├── privacy/                      # Privacy policy
│   ├── terms/                        # Terms of service
│   ├── cookies/                      # Cookie policy
│   ├── guidelines/                   # Community guidelines
│   ├── (auth)/
│   │   ├── layout.tsx                # Auth layout with AuthGuard
│   │   ├── login/page.tsx            # Login (email/username + OAuth)
│   │   └── register/page.tsx         # Register with verification
│   ├── (main)/
│   │   ├── loading.tsx               # Skeleton loader for all routes
│   │   ├── error.tsx                 # Error boundary with retry
│   │   ├── not-found.tsx             # 404 within app shell
│   │   ├── home/page.tsx             # Feed (latest/following/trending)
│   │   ├── explore/page.tsx          # Explore (trending, tags, categories)
│   │   ├── notifications/page.tsx    # Notifications list
│   │   ├── bookmarks/page.tsx        # Bookmarks with collections
│   │   ├── upload/page.tsx           # Upload resources
│   │   ├── settings/page.tsx         # X-style settings (6 categories)
│   │   ├── search/page.tsx           # Search results with autocomplete
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin layout (separate from main app)
│   │   │   ├── page.tsx              # Admin dashboard (bento grid)
│   │   │   ├── users/page.tsx        # User management (search, filter, ban/unban)
│   │   │   ├── reports/page.tsx      # Report management (resolve/dismiss)
│   │   │   ├── content/page.tsx      # Content management (posts grid)
│   │   │   ├── analytics/page.tsx    # Platform analytics (stats, charts)
│   │   │   ├── activity/page.tsx     # Activity feed (timeline)
│   │   │   ├── messages/page.tsx     # Support tickets (reply system)
│   │   │   └── settings/page.tsx     # Admin settings
│   │   ├── help/page.tsx             # Help center + tickets
│   │   ├── discuss/page.tsx          # Discussion feed
│   │   ├── discuss/[discussionId]/   # Discussion detail (server-rendered metadata)
│   │   ├── post/[postId]/page.tsx    # Post detail with related posts
│   │   └── user/[username]/page.tsx  # User profile with followers modal
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts      # Auth.js handlers
│       │   ├── register/route.ts           # User registration
│       │   ├── verify-email/route.ts       # Email verification
│       │   ├── resend-verification/route.ts # Resend verification
│       │   ├── check-verification/route.ts # Check if verified
│       │   ├── forgot-password/route.ts    # Send reset email
│       │   └── reset-password/route.ts     # Reset password
│       ├── posts/
│       │   ├── route.ts              # GET list, POST create
│       │   ├── [postId]/
│       │   │   ├── route.ts          # GET single post
│       │   │   ├── like/route.ts     # Toggle like
│       │   │   ├── comments/route.ts # GET/POST comments
│       │   │   ├── bookmark/route.ts # Toggle bookmark
│       │   │   ├── download/route.ts # Record download
│       │   │   ├── thread/route.ts   # Thread navigation
│       │   │   └── related/route.ts  # Related posts by tags/subject
│       ├── discussions/
│       │   ├── route.ts              # GET/POST discussions
│       │   └── [id]/
│       │       ├── route.ts          # GET/PATCH/DELETE discussion
│       │       ├── like/route.ts     # Toggle like
│       │       └── replies/route.ts  # GET/POST replies
│       ├── users/
│       │   └── [username]/
│       │       ├── route.ts          # GET/PATCH user profile
│       │       ├── posts/route.ts    # GET user's posts
│       │       ├── follow/route.ts   # Toggle follow
│       │       └── followers/route.ts # GET followers/following list
│       ├── search/
│       │   ├── route.ts              # Full-text search
│       │   └── autocomplete/route.ts # Autocomplete suggestions
│       ├── notifications/route.ts    # GET/POST notifications
│       ├── bookmarks/
│       │   ├── route.ts              # GET bookmarks
│       │   └── collections/route.ts  # GET/POST collections
│       ├── tags/route.ts             # GET trending tags
│       ├── upload/route.ts           # File upload with server-side validation
│       ├── reports/route.ts          # Create report
│       ├── user-settings/
│       │   ├── route.ts              # GET/PATCH user preferences
│       │   ├── profile/route.ts      # Update profile info
│       │   └── password/route.ts     # Change password
│       ├── sessions/route.ts         # GET sessions, heartbeat, revoke
│       ├── tickets/route.ts          # GET/POST support tickets
│       ├── email/test/route.ts       # Admin SMTP test
│       └── admin/
│           ├── route.ts              # Admin stats
│           ├── reports/route.ts      # List reports
│           ├── reports/[reportId]/   # Update report
│           ├── users/route.ts        # List users with pagination
│           └── users/[userId]/ban/   # Ban user
├── components/
│   ├── auth/auth-guard.tsx           # Redirects logged-in users from auth pages
│   ├── layout/
│   │   ├── sidebar.tsx               # Desktop sidebar (260px) + mobile overlay
│   │   ├── topbar.tsx                # Sticky top bar with hamburger
│   │   ├── mobile-nav.tsx            # Floating bottom nav with notification badge
│   │   ├── main-layout.tsx           # Shell layout with auth guard
│   │   └── footer.tsx                # Minimal footer
│   ├── post/
│   │   ├── post-card.tsx             # Feed post card
│   │   ├── post-detail.tsx           # Full post view
│   │   ├── modern-post-detail.tsx    # Modern post detail with thread nav + related posts
│   │   └── thread-nav.tsx            # Thread navigation component
│   ├── feed/
│   │   ├── feed-list.tsx             # Infinite scroll feed
│   │   ├── feed-tabs.tsx             # For You / Following / Trending
│   │   ├── post-card-skeleton.tsx    # Loading skeleton
│   │   ├── modern-feed.tsx           # Modern feed with tabs
│   │   └── modern-post-card.tsx      # Modern post card component
│   ├── comments/
│   │   ├── comment-section.tsx       # Comment form + list
│   │   ├── comment-item.tsx          # Single comment
│   │   └── modern-comment-section.tsx # Modern comment section
│   ├── discuss/
│   │   ├── discussion-card.tsx       # Discussion list card
│   │   ├── discussion-compose.tsx    # Discussion creation form
│   │   ├── discussion-detail.tsx     # Discussion detail view
│   │   └── discussion-feed.tsx       # Discussion feed list
│   ├── user/
│   │   ├── profile-header.tsx        # Profile banner + stats
│   │   ├── user-profile.tsx          # Full profile page with followers modal
│   │   └── user-card.tsx             # Compact user card
│   ├── upload/upload-form.tsx        # Drag & drop upload
│   ├── search/
│   │   ├── search-bar.tsx            # Search input with autocomplete + recent searches
│   │   ├── search-results.tsx        # Tabbed results
│   │   └── explore-content.tsx       # Explore page content
│   ├── notifications/
│   │   ├── notification-card.tsx     # Single notification
│   │   └── notification-list.tsx     # Notification list with query invalidation
│   ├── admin/
│   │   ├── admin-sidebar.tsx         # Admin-specific sidebar (theme compatible)
│   │   ├── admin-layout.tsx          # Admin layout wrapper
│   │   └── admin-dashboard.tsx       # Admin dashboard with bento grid
│   ├── bookmarks/bookmark-collections.tsx
│   ├── help/help-content.tsx         # FAQ + tickets + contact
│   ├── settings/settings-form.tsx    # X-style settings (6 categories)
│   ├── legal/legal-layout.tsx        # Legal page wrapper
│   └── ui/                           # 13 shadcn-style components
│       ├── button.tsx, input.tsx, textarea.tsx, badge.tsx
│       ├── card.tsx, avatar.tsx, dialog.tsx, tabs.tsx
│       ├── skeleton.tsx, label.tsx, dropdown-menu.tsx
│       ├── tooltip.tsx, scroll-area.tsx
│       ├── animations.tsx, theme-toggle.tsx
│       └── floating-theme-toggle.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # 20+ Drizzle tables + relations
│   │   └── index.ts                  # DB connection pool
│   ├── auth/
│   │   ├── config.ts                 # Auth.js config (Google, GitHub, Credentials)
│   │   └── options.ts                # Re-exports
│   ├── email.ts                      # Nodemailer + email templates + DB logging
│   ├── utils.ts                      # cn, formatNumber, formatDate, generateId, etc.
│   ├── cache.ts                      # Caching utilities
│   ├── seo.ts                        # SEO utilities and JSON-LD
│   ├── rate-limit.ts                 # Sliding window rate limiter
│   ├── rate-limit.ts                 # Sliding window rate limiter
│   ├── types/index.ts                # TypeScript types
│   └── validators.ts                 # Zod schemas (post, comment, profile, discussion, auth, ticket, report, settings)
├── hooks/
│   ├── use-auth.ts                   # useRequireAuth
│   ├── use-posts.ts                  # useFeed, useLikePost, useBookmarkPost
│   ├── use-user.ts                   # useFollowUser, useUser, useUserPosts
│   ├── use-notifications.ts          # useNotifications
│   ├── use-upload.ts                 # useUpload with progress
│   ├── use-discussions.ts            # useDiscussions, useCreateDiscussion
│   └── use-session-heartbeat.ts      # 5min session heartbeat
├── providers/
│   ├── index.tsx                     # Providers barrel (AuthProvider, ThemeProvider, QueryProvider, TooltipProvider, Toaster)
│   ├── theme-provider.tsx            # next-themes ThemeProvider
│   ├── query-provider.tsx            # TanStack QueryProvider
│   └── auth-provider.tsx             # next-auth SessionProvider
├── stores/index.ts                   # Zustand stores (useUploadModal, useMobileNav)
└── types/next-auth.d.ts             # Session type augmentation
```

---

## Database Schema (20+ Tables)

All tables use `varchar(36)` UUIDs as primary keys, MySQL `timestamp` for dates, and proper foreign keys with cascading deletes.

### Core Tables
- **users** — id, name, username (unique), email (unique), password, provider, providerAccountId, image, banner, bio, college, course, semester, twitterUrl, githubUrl, linkedinUrl, websiteUrl, role (user/admin), isPrivate, isBanned, followersCount, followingCount, postsCount, timestamps
- **accounts** — OAuth accounts linked to users
- **sessions** — Auth.js sessions
- **verification_tokens** — Email verification + password reset tokens

### Content Tables
- **posts** — id, userId, title, description, subject, course, semester, college, resourceType, likesCount, commentsCount, downloadsCount, bookmarksCount, viewsCount, trendingScore, timestamps
- **files** — id, postId, fileName, originalName, fileUrl, fileSize, mimeType, fileType
- **comments** — id, postId, userId, parentId, content, likesCount, timestamps
- **likes** — userId + postId (unique)
- **bookmarks** — userId + postId (unique), collectionId
- **bookmark_collections** — userId, name, description

### Social Tables
- **follows** — followerId + followingId (unique)
- **notifications** — userId, actorId, type, postId, message, isRead

### Content Tables
- **tags** — name (unique), slug (unique), postsCount
- **post_tags** — postId + tagId (unique)
- **downloads** — userId, postId

### System Tables
- **reports** — targetType, targetId, reason, status
- **recent_searches** — userId, query
- **email_logs** — userId, to, subject, body, purpose, status
- **tickets** — userId, subject, category, message, status, adminReply
- **user_settings** — userId (unique), 15 preference booleans, theme
- **discussions** — id, userId, content, imageUrl, likesCount, repliesCount, viewsCount, timestamps
- **discussion_likes** — userId + discussionId (unique)
- **discussion_replies** — id, discussionId, userId, parentId, content, likesCount, timestamps

---

## Authentication Flow

### Login
1. User enters email/username + password
2. `/api/auth/check-verification` checks credentials AND email verification status
3. If not verified → redirect to `/pending-verification`
4. If verified → `signIn("credentials")` → JWT token
5. Session heartbeat every 5 minutes via `/api/sessions`

### Registration
1. User fills form → POST `/api/auth/register`
2. Creates user + verification token (24h expiry)
3. Sends verification email via Hostinger SMTP
4. Shows "Check your email" with 30s cooldown + resend button

### OAuth (Google/GitHub)
1. `signIn("google"/"github")` → callback
2. `signIn` callback creates user if new (auto-generates unique username)
3. Auto-verified email, welcome email sent
4. Login session logged

### Password Reset
1. `/forgot-password` → email → POST `/api/auth/forgot-password`
2. Sends reset email (1h token expiry)
3. `/reset-password?token=...&id=...` → POST `/api/auth/reset-password`

---

## Middleware & Security

### Route Protection (`src/middleware.ts`)
- JWT-based authentication via `next-auth/jwt`
- Protected routes: `/upload`, `/settings`, `/bookmarks`, `/notifications`, `/admin`
- Protected API routes: POST endpoints, `/api/reports`, `/api/user-settings`, `/api/tickets`
- Admin-only routes: `/admin`, `/api/admin/*`
- Public routes: `/`, `/home`, `/explore`, `/search`, `/post/*`, `/user/*`, `/discuss/*`, auth pages, legal pages

### Rate Limiting (`src/lib/rate-limit.ts`)
- **Auth routes**: 10 requests per 15 minutes
- **Upload routes**: 20 requests per hour
- **API routes**: 60 requests per minute
- Uses sliding window algorithm with in-memory store

### Server-Side Validation
- File uploads: MIME type whitelist enforced server-side
- Profile images: Uploaded via `/api/upload` endpoint (no blob URLs)
- Admin access: Server-side role check in page component + middleware

---

## Key Design Decisions

1. **Profile URLs use usernames** — `/user/[username]` not `/user/[id]`
2. **Email verification required** — unverified users redirected to `/pending-verification`
3. **Settings page uses X/Twitter layout** — left sidebar categories + right content
4. **Mobile nav** — shows at `< 1024px` (lg: breakpoint), floating pill with centered upload button
5. **Desktop sidebar** — shows at `>= 1024px`, Settings & Support expandable submenu
6. **AuthGuard** — logged-in users redirected away from login/register pages
7. **Session tracking** — every login logged with device/browser/OS info
8. **Email logging** — every email sent logged to `email_logs` table with purpose and body
9. **Preferences saved to DB** — all notification/privacy/appearance toggles persist
10. **Root page serves landing** — `/` shows landing page for unauthenticated users; authenticated users redirect to `/home`
11. **Drizzle queries use `db.select().from()`** — standardized across all API routes for consistency
12. **Admin panel has dedicated layout** — separate sidebar, dark/light theme, different navigation
13. **Rate limiting via middleware** — sliding window for auth, upload, and general API routes
14. **Autocomplete in search** — debounced suggestions with recent searches stored in localStorage
15. **Related posts** — shown at bottom of post detail, matched by tags/subject/course

---

## Environment Variables

```env
DATABASE_HOST="srv665.hstgr.io"
DATABASE_USER="u687264317_postpencil"
DATABASE_PASSWORD="..."
DATABASE_NAME="u687264317_postpencil"
AUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="postpencil@protoolvault.in"
SMTP_PASS="..."
SMTP_FROM="PostPencil <postpencil@protoolvault.in>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Commands

```bash
# Development
npm run dev          # Start dev server on port 3000

# Build
npx next build       # Production build (uses ignoreBuildErrors for TS)

# Database
npx drizzle-kit push # Push schema changes to MySQL
npx drizzle-kit studio # Open Drizzle Studio

# Lint
npm run lint
```

---

## Known Issues & TODOs

1. TypeScript type checking is temporarily disabled in build (`ignoreBuildErrors: true`) due to pre-existing type errors that need incremental fixing
2. File upload uses PHP server — should be migrated to cloud storage (S3/R2) for Vercel compatibility
3. No image optimization for uploaded files — should generate thumbnails and serve WebP variants
4. No real-time notifications (WebSocket/SSE) — currently uses 60s polling
5. No search indexing (Meilisearch/Algolia) — uses MySQL LIKE queries
6. Middleware is deprecated in Next.js 16 — should migrate to `proxy` convention when stable

---

## File Upload System

Files are uploaded to PHP server at `postpencil.protoolvault.in`:
- Client-side: `react-dropzone` with 50MB limit
- Server-side: MIME type whitelist validation
- Database: `files` table stores metadata (fileName, originalName, fileUrl, fileSize, mimeType, fileType)

---

## Email System

- **Provider**: Hostinger SMTP (port 465, SSL)
- **Templates**: Verification, Reset Password, Welcome
- **Logging**: All emails logged to `email_logs` table
- **Format**: Branded HTML emails with PostPencil logo

---

## Deployment

1. **Vercel**: Frontend (auto-deploy from git)
2. **Hostinger**: MySQL database + SMTP
3. **Environment**: Copy `.env.local` to Vercel environment variables
4. **Database**: Run `npx drizzle-kit push` after schema changes
