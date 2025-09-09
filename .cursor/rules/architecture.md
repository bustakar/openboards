# OpenBoards Architecture Rules

## Stack

- Next.js App Router (TypeScript, RSC + server actions) – Next 15
- React 19
- better-auth (GitHub OAuth + Magic Link) with Organizations plugin
- Drizzle ORM + Postgres
- shadcn/ui + Tailwind v4
- Zod for validation
- Nodemailer + SMTP for emails (Mailpit in dev)

## Project layout

- Source root: `src/`
- Path alias: `@/*` → `src/*`
- Database:
  - `src/db/auth-schema.ts` → core auth/org tables (user, session, organization, member, invitation, …)
  - `src/db/schema.ts` → re-exports public schema
  - `src/db/index.ts` → Drizzle client
- HTTP/auth:
  - `src/server/auth.ts` → better-auth server instance (`auth.api.*`)
  - `src/app/api/auth/[...all]/route.ts` → Next handler for better-auth
  - `src/server/org-repo.ts` → DB-only queries (no framework-specific code)
- UI:
  - `src/components/ui/*` → shadcn primitives only
  - `src/components/sidebar/*` → sidebar shell
  - `src/components/org/*` → organization UI (switcher, settings, members, invites, delete)
- App router (private dashboard + public):
  - Private root: `src/app/dashboard`
  - Public invites: `src/app/invite/[invitationId]/page.tsx`

## Routing

- Private (dashboard):
  - `/dashboard` → shell entry; use for generic pages or redirectors
  - `/dashboard/organization/select` → org picker
  - `/dashboard/organization/setup` → create organization
  - `/dashboard/[org]/settings` → organization settings
  - `/dashboard/[org]/feedback` → feedback (project/boards to be added later)
  - Future: `/dashboard/[org]/roadmap`
- Public:
  - `/invite/[invitationId]` → accept/reject org invitations
  - Future: `/[project]/feedback`, `/[project]/roadmap`
- Layouts:
  - `src/app/dashboard/layout.tsx` → requires session; renders children (sidebar comes from nested layout)
  - `src/app/dashboard/[org]/layout.tsx` → membership check by slug; redirects:
    - if user has 0 orgs → `/dashboard/organization/setup`
    - if slug not in user orgs → `/dashboard/organization/select`
  - Sidebar is rendered in `src/components/sidebar/app-sidebar.tsx` and consumed by org-scoped layout pages.

## Auth

- Always retrieve session on the server with:
  - `await auth.api.getSession({ headers: await headers() })`
- Prefer better-auth Organization APIs where available:
  - Listing orgs: `auth.api.listOrganizations`
  - Full org (members + invites): `auth.api.getFullOrganization`
  - Invites: `auth.api.inviteMember`, `auth.api.getInvitation`, `auth.api.acceptInvitation`, `auth.api.rejectInvitation`
  - Active org: `auth.api.organization.setActiveOrganization` (server) / `authClient.organization.setActiveOrganization` (client)
- Login flows use GitHub or Magic Link; after login redirect back to the desired page.

## Organization model and onboarding

- Org slug is the primary key in private URLs (`/dashboard/[org]/...`).
- Keep session active organization in sync with the route param when inside `[org]` layout.
- Onboarding rules:
  - If user has no memberships → redirect to `/dashboard/organization/setup`
  - If user has memberships but hits an org slug they don’t belong to → `/dashboard/organization/select`
- Org switcher:
  - Server renders org list for the shell; client switcher calls `setActiveOrganization`, then `router.refresh()`.

## RBAC & Security

- Roles: `owner`, `admin`, `member`
- Permissions (initial):
  - Invite/update/remove members: `admin+`
  - Delete organization: `owner` (and only if sole owner)
- Enforce on server:
  - Actions must load session via `headers()` and verify org membership/role.
  - Never trust client props for authorization.
- Invariants:
  - Never demote or remove the last `owner`.
  - Invitation acceptance must attach membership to the logged-in user and can set the org as active.

## Data access

- Repositories (`src/server/*-repo.ts`) are DB-only (Drizzle queries, no Next/better-auth/cookies).
- Prefer better-auth organization APIs over direct DB writes for org operations (invites, acceptance, deletion).
- Server actions are the only request boundary:
  - Define them near pages or in a small `server/*-service.ts` if multiple pages share business rules.
  - Validate input with Zod; return small JSON; redirect or `router.refresh()` from the client.

## Server actions

- Mark with `'use server'`.
- Pattern:
  - `const h = await headers();`
  - `const session = await auth.api.getSession({ headers: h });`
  - Authorization checks (membership/role).
  - Perform operation (prefer `auth.api.*` for org ops).
  - Revalidate or redirect.
- Do not import client modules from actions; keep them side-effect free and deterministic.

## Invitations

- Emails include link to `/invite/[invitationId]`.
- Invite page logic:
  - If session email matches invite email and status is `pending` → Accept/Reject (use `auth.api.acceptInvitation`/`rejectInvitation`), set active org, then redirect into `/dashboard/[org]`.
  - If not logged in → prompt login and return to the same invite URL.
  - If logged in with different email → prompt to switch account.
  - Show proper states for `accepted/rejected/canceled/expired`.

## Components (server vs client)

- Prefer Server Components for data fetching and composition.
- Use Client Components for interactivity only (`'use client'`), e.g., dropdowns, dialogs, forms, switcher buttons.
- Pass primitive data props from server to client; client calls actions or auth client APIs.

## Validation & Errors

- All mutating operations must validate with Zod in the server action.
- Surface errors with user-friendly messages; do not leak internal details.
- Use optimistic UI only where safe; fall back to `router.refresh()` on completion.

## Naming & Style

- Kebab-case filenames: `org-switcher.tsx`, `member-invite-button.tsx`
- Route segments reflect domain: `/dashboard/[org]/settings`, `/dashboard/[org]/feedback`
- Keep imports absolute via `@/…`
- Keep styles Tailwind-first; extract only shared patterns.

## Performance & DX

- Favor RSC for data loading; actions thin and validated.
- Use count queries for gating (membership/project counts).
- Avoid N+1: use joins for member lists.
- CI (target): type-check, lint, build; run migrations on CI.

## Testing (target)

- Smoke flows: auth → org setup → invite → accept → settings
- Unit-test repo queries and services with a test DB or in-memory adapter.
