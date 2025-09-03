# OpenBoards Architecture Rules

## Stack

- Next.js App Router (TypeScript, RSC + server actions)
- better-auth (magic link + GitHub)
- Drizzle ORM + Postgres
- shadcn/ui + Tailwind
- Zod for input validation
- Nodemailer + SMTP for emails (Mailpit in dev)

## Multi-tenancy

- Core entities carry `orgId`; project-scoped entities carry `orgId` + `projectId`.
- Public `project` slug is globally unique and used for public routes (`/[project]/feedback`, `/[project]/roadmap`).
- Private dashboard routes are org-scoped: `/[org]/[project]/...`.

## Routing

- Public:
  - `app/(public)/[project]/feedback/page.tsx` (boards list + posts list + new post form)
  - `app/(public)/[project]/roadmap/page.tsx`
- Private (dashboard):
  - `app/(app)/dashboard/page.tsx` (org picker)
  - `app/(app)/[org]/(project)/[project]/feedback/page.tsx` (single page; dialogs for new/edit/detail)
  - `app/(app)/[org]/(project)/[project]/roadmap/page.tsx`
  - `app/(app)/[org]/settings/{profile,team,billing,projects,boards}/page.tsx`

## Auth

- Magic link (email) + GitHub OAuth at launch; email+password may be added later.
- Sessions stored in Postgres.
- Anonymous interactions supported via signed `visitorId` cookie (HMAC with `COOKIE_SIGNING_SECRET`).

## RBAC & Security

- Roles: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `BILLING`.
- Server-only data access in server actions/route handlers.
- Helpers:
  - `requireMembership(orgId, minRole)`
  - `assertProjectAccess(projectId)`
- Input validation with Zod for all mutating endpoints.
- Anti-abuse: rate-limit votes/comments (userId or visitorId + IP), honeypot fields.

## Product rules

- Roadmap statuses: `backlog`, `planned`, `in_progress`, `done`, `closed`.
- Voting: one vote per person per post (unique on `(postId, COALESCE(userId, visitorId))`).
- Anonymous comments allowed; optional display name; default “Anonymous”.
- Anonymous posts allowed; store `visitorId` on posts created by anonymous users.

## Data model (pseudocode)

```ts
users(id, email, name, image)
organizations(id, slug, name)
memberships(id, userId, orgId, role)
projects(id, orgId, slug UNIQUE GLOBAL, name)
boards(id, orgId, projectId, slug, name, visibility)
posts(id, orgId, projectId, boardId, authorUserId?, visitorId?, title, body, status, priority)
votes(id, orgId, postId, userId?, visitorId?, UNIQUE(postId, COALESCE(userId, visitorId)))
comments(id, orgId, postId, userId?, visitorId?, displayName?, body, parentCommentId?, createdAt)
tags(id, orgId, projectId, name, color)
postTags(postId, tagId, UNIQUE(postId, tagId))
```

## Performance & DX

- Prefer RSC for data fetching; keep server actions thin and validated.
- Indexing: composite indexes on `(orgId, projectId)`, `(projectId, boardId)`, `(postId, userId)`.
- CI: type-check, lint, build; migrations run on CI.
