# OpenBoards

Source-available (ELv2) feedback boards & roadmap for multi‑project teams.

## Features

- Public feedback portal with boards and posts
- Private dashboard for moderation & settings
- Subdomains and optional custom domains for per‑org public pages
- Multiple organization members

## Tech stack

- Next.js 15 (App Router) + React 19
- Drizzle ORM + PostgreSQL
- better-auth, Zod
- Tailwind CSS + shadcn/ui
- Nodemailer (SMTP)

## Getting started

1. Install dependencies: `npm install`
2. Create `.env.local` (database URL + email/auth settings)
3. Apply migrations: `npm run db:migrate`
4. Start dev server: `npm run dev` and open `http://localhost:3000`

Tip: in development you can test subdomains via `http://[org].localhost:3000/feedback`.

## Contributing

Issues and PRs welcome. By contributing you agree contributions may be relicensed in the future (CLA may be introduced).

## License

Elastic License 2.0 (ELv2). See `LICENSE.md`. You may not provide this software as a managed service to third parties.
