# OpenBoards

Source-available feedback boards and roadmap for multi-project teams.

License: Elastic License v2 (ELv2). You may use, modify, and distribute; you may not offer it as a managed service. For commercial hosting rights, contact the author.

© 2025 Karel Busta

## Stack

Next.js (App Router), better-auth (magic link + GitHub), Drizzle ORM, Postgres, shadcn/ui, Zod.

## Features (MVP)

- Public: `/[project]/feedback` (boards + posts + submit), `/[project]/roadmap`
- Anonymous voting (one per person) and comments (optional display name)
- Anonymous post creation (stored with `visitorId`)
- Private dashboard: orgs/teams, projects, feedback, roadmap
- Multi-tenant RBAC (OWNER/ADMIN/MEMBER/VIEWER/BILLING)

## Routing

- Public:
  - `/[project]/feedback`
  - `/[project]/roadmap`
- Private (dashboard):
  - `/[org]/[project]/feedback` (single page; dialogs for new/detail)
  - `/[org]/[project]/roadmap`
  - `/[org]/settings/{profile,team,billing,projects,boards}`

## Local Development

1. Copy `.env.example` to `.env.local` and fill values.
2. Start Postgres (Docker/Neon) and create database `openboards`.
3. Run migrations and seed data.
4. Start the app.

## Contributing

Issues and PRs welcome. By contributing you agree contributions may be relicensed in the future (CLA may be introduced).

## License

Elastic License 2.0 (ELv2). See `LICENSE.md`. You may not provide this software as a managed service to third parties.
