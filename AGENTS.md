# PostPencil — Complete Project Documentation

> **Last Updated:** 2026-06-23
> **Status:** Production-ready
> **Stack:** Next.js 15 App Router + TypeScript + Tailwind CSS + Drizzle ORM + MySQL + Auth.js

---

## Project Overview

PostPencil is an X/Twitter-style social learning platform where users share educational resources (PDFs, notes, presentations, assignments, question papers). Users can like, comment, bookmark, follow creators, and discover trending content.

**Live URL:** http://localhost:3001 (dev) / https://postpencil.com (production)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS |
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
├── app/
│   ├── layout.tsx                    # Root layout (Plus Jakarta Sans, JetBrains Mono)
│   ├── page.tsx                      # Redirects to /home
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
│   │   ├── home/page.tsx             # Feed (latest/following/trending)
│   │   ├── explore/page.tsx          # Explore (trending, tags, categories)
│   │   ├── notifications/page.tsx    # Notifications list
│   │   ├── bookmarks/page.tsx        # Bookmarks with collections
│   │   ├── upload/page.tsx           # Upload resources
│   │   ├── settings/page.tsx         # X-style settings (6 categories)
│   │   ├── search/page.tsx           # Search results
│   │   ├── admin/page.tsx            # Admin dashboard
│   │   ├── help/page.tsx             # Help center + tickets
│   │   ├── post/[postId]/page.tsx    # Post detail
│   │   └── user/[username]/page.tsx  # User profile
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
│       │   │   └── download/route.ts # Record download
│       ├── users/
│       │   ├── [username]/
│       │   │   ├── route.ts          # GET/PATCH user profile
│       │   │   ├── posts/route.ts    # GET user's posts
│       │   │   └── follow/route.ts   # Toggle follow
│       ├── search/route.ts           # Full-text search
│       ├── notifications/route.ts    # GET/POST notifications
│       ├── bookmarks/
│       │   ├── route.ts              # GET bookmarks
│       │   └── collections/route.ts  # GET/POST collections
│       ├── tags/route.ts             # GET trending tags
│       ├── upload/route.ts           # File upload to /uploads/
│       ├── reports/route.ts          # Create report
│       ├── user-settings/route.ts    # GET/PATCH user preferences
│       ├── sessions/route.ts         # GET sessions, heartbeat, revoke
│       ├── tickets/route.ts          # GET/POST support tickets
│       ├── email/test/route.ts       # Admin SMTP test
│       └── admin/
│           ├── route.ts              # Admin stats
│           ├── reports/route.ts      # List reports
│           ├── reports/[reportId]/   # Update report
│           ├── users/route.ts        # List users
│           └── users/[userId]/ban/   # Ban user
├── components/
│   ├── auth/auth-guard.tsx           # Redirects logged-in users from auth pages
│   ├── layout/
│   │   ├── sidebar.tsx               # Desktop sidebar (260px) + mobile overlay
│   │   ├── topbar.tsx                # Sticky top bar with hamburger
│   │   ├── mobile-nav.tsx            # Floating bottom nav
│   │   └── main-layout.tsx           # Shell layout with auth guard
│   ├── post/
│   │   ├── post-card.tsx             # Feed post card
│   │   └── post-detail.tsx           # Full post view
│   ├── feed/
│   │   ├── feed-list.tsx             # Infinite scroll feed
│   │   ├── feed-tabs.tsx             # For You / Following / Trending
│   │   └── post-card-skeleton.tsx    # Loading skeleton
│   ├── comments/
│   │   ├── comment-section.tsx       # Comment form + list
│   │   └── comment-item.tsx          # Single comment
│   ├── user/
│   │   ├── profile-header.tsx        # Profile banner + stats
│   │   ├── user-profile.tsx          # Full profile page
│   │   └── user-card.tsx             # Compact user card
│   ├── upload/upload-form.tsx        # Drag & drop upload
│   ├── search/
│   │   ├── search-bar.tsx            # Search input
│   │   ├── search-results.tsx        # Tabbed results
│   │   └── explore-content.tsx       # Explore page content
│   ├── notifications/
│   │   ├── notification-card.tsx     # Single notification
│   │   └── notification-list.tsx     # Notification list
│   ├── admin/admin-dashboard.tsx     # Admin stats + reports + users
│   ├── bookmarks/bookmark-collections.tsx
│   ├── help/help-content.tsx         # FAQ + tickets + contact
│   ├── settings/settings-form.tsx    # X-style settings (6 categories)
│   ├── legal/legal-layout.tsx        # Legal page wrapper
│   └── ui/                           # 13 shadcn-style components
│       ├── button.tsx, input.tsx, textarea.tsx, badge.tsx
│       ├── card.tsx, avatar.tsx, dialog.tsx, tabs.tsx
│       ├── skeleton.tsx, label.tsx, dropdown-menu.tsx
│       ├── tooltip.tsx, scroll-area.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # 20+ Drizzle tables + relations
│   │   └── index.ts                  # DB connection pool
│   ├── auth/
│   │   ├── config.ts                 # Auth.js config (Google, GitHub, Credentials)
│   │   └── options.ts                # Re-exports
│   ├── email.ts                      # Nodemailer + email templates + DB logging
│   ├── utils.ts                      # cn, formatNumber, formatDate, generateId, etc.
│   ├── types/index.ts                # TypeScript types
│   └── validators.ts                 # Zod schemas
├── hooks/
│   ├── use-auth.ts                   # useRequireAuth
│   ├── use-posts.ts                  # useFeed, useLikePost, useBookmarkPost
│   ├── use-user.ts                   # useFollowUser, useUser, useUserPosts
│   ├── use-notifications.ts          # useNotifications
│   ├── use-upload.ts                 # useUpload with progress
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
- **login_sessions** — userId, provider, ip, device, browser, os, isCurrent, timestamps
- **tickets** — userId, subject, category, message, status, adminReply
- **user_settings** — userId (unique), 15 preference booleans, theme

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

---

## Environment Variables

```env
DATABASE_HOST="srv665.hstgr.io"
DATABASE_USER="u687264317_postpencil"
DATABASE_PASSWORD="B9&s9Ffdu3X"
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
npx next build       # Production build (uses --ignoreBuildErrors for TS)

# Database
npx drizzle-kit push # Push schema changes to MySQL
npx drizzle-kit studio # Open Drizzle Studio

# Lint
npm run lint
```

---

## Known Issues & TODOs

1. TypeScript type checking is disabled in build (`ignoreBuildErrors: true`) due to subagent-generated code inconsistencies
2. Some API routes use `db.query.tableName.findFirst()` (Drizzle relational query API) while others use `db.select().from()` — should be unified
3. The `verification_tokens` table uses DrizzleAdapter's default schema which may conflict with custom columns
4. No rate limiting middleware implemented yet
5. No CSRF protection middleware
6. File upload uses local filesystem — should be migrated to cloud storage
7. No image optimization for uploaded files
8. No pagination for admin lists
9. No real-time notifications (WebSocket/SSE)
10. No search indexing (Meilisearch/Algolia)

---

## File Upload System

Files are uploaded to `/public/uploads/` with UUID naming:
```
/uploads/
├── pdfs/      # .pdf
├── images/    # .jpg, .png, .webp
├── docs/      # .doc, .docx
├── ppts/      # .ppt, .pptx
└── zips/      # .zip
```

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
