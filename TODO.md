# TODO

## M0 – Foundation

- [x] Initialize repo (Next.js App Router, TS, Tailwind, shadcn/ui, ESLint/Prettier)
- [ ] CI: type-check, lint, build
- [x] Database: Drizzle setup, migrations skeleton, seed script
- [x] Auth: better-auth scaffolding (magic link + GitHub)
- [x] Docs: README, LICENSE (ELv2), CONTRIBUTING

## M1 – Auth + Tenancy

- [x] Magic link flow (SMTP via Nodemailer; Mailpit in dev)
- [x] GitHub OAuth
- [x] Users, Organizations, Memberships schema + migrations
- [x] Org creation, invite via email
- [x] Org switcher in dashboard shell

## M3 – Feedback (private)

- [x] Boards schema + CRUD
- [x] Posts schema (status: backlog/planned/in_progress/done/closed; optional `visitorId`)
- [x] Private feedback single page: table + dialogs for new post
- [x] Votes schema + vote button for posts
- [x] Post statuses
- [x] Indexes for common queries

## M4 – Public Feedback + Interactions

- [x] Public `[organization]/feedback`: boards list + posts list + submit post dialog
- [x] Anonymous voting (one per person; cookie-based `visitorId`)
- [x] Rate limiting + honeypot fields

## M5 - Subdomains & custom domains

- [x] Move organizations ([org]) to subdomain
- [ ] Add support for custom domains (settings + org setup)

## M6 – Roadmap

- [ ] Public `[organization]/roadmap` by post status
- [ ] Dashboard roadmap management (no DnD initially)

## M7 – Settings & Billing (hosted mode)

- [ ] Team management & roles
- [ ] Profile settings
- [ ] Billing (feature-flagged; Stripe portal)

## Quality & Docs

- [ ] Accessibility pass (landmarks, labels, keyboard)
- [ ] E2E smoke (auth → org → project → post → public view)
- [ ] API docs and architectural notes
