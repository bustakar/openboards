# TODO

## M0 – Foundation

- [x] Initialize repo (Next.js App Router, TS, Tailwind, shadcn/ui, ESLint/Prettier)
- [ ] CI: type-check, lint, build
- [x] Database: Drizzle setup, migrations skeleton, seed script
- [x] Auth: better-auth scaffolding (magic link + GitHub)
- [x] Docs: README, LICENSE (ELv2), CONTRIBUTING

## M1 – Auth + Tenancy

- [ ] Magic link flow (SMTP via Nodemailer; Mailpit in dev)
- [ ] GitHub OAuth
- [x] Users, Organizations, Memberships schema + migrations
- [ ] Org creation, invite via email
- [ ] Org switcher in dashboard shell

## M2 – Projects + Dashboard Shell

- [ ] Projects schema (global unique `slug`)
- [ ] Dashboard layout + nav + breadcrumbs
- [ ] Project create/edit/delete
- [ ] Guards: `requireMembership`, `assertProjectAccess`

## M3 – Feedback (private)

- [ ] Boards schema + CRUD
- [ ] Posts schema (status: backlog/planned/in_progress/done/closed; optional `visitorId`)
- [ ] Private feedback single page: table + filters; dialogs for new post + post detail
- [ ] Tags + status transitions
- [ ] Indexes for common queries

## M4 – Public Feedback + Interactions

- [ ] Public `[project]/feedback`: boards list + posts list + submit post dialog
- [ ] Anonymous voting (one per person; cookie-based `visitorId`)
- [ ] Anonymous comments (optional display name; default “Anonymous”)
- [ ] Rate limiting + honeypot fields

## M5 – Roadmap

- [ ] Public `[project]/roadmap` by post status
- [ ] Dashboard roadmap management (no DnD initially)

## M6 – Settings & Billing (hosted mode)

- [ ] Team management & roles
- [ ] Profile settings
- [ ] Billing (feature-flagged; Stripe portal)

## Quality & Docs

- [ ] Accessibility pass (landmarks, labels, keyboard)
- [ ] E2E smoke (auth → org → project → post → public view)
- [ ] API docs and architectural notes
