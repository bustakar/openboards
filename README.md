This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Configure environment

Copy the example env file and edit values as needed:

```bash
cp .env.example .env.local
```

Ensure `DATABASE_URL` points to a Postgres database and `NEXT_PUBLIC_BASE_URL` matches your local URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Run migrations and seed

```bash
npm run drizzle:generate
npm run drizzle:migrate
npm run seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## CLI Tool

OpenBoards includes a comprehensive command-line interface for database management. This serves as a temporary admin solution until a proper admin dashboard is built.

### Quick Start

```bash
# View all available commands
npm run cli -- --help

# List all boards
npm run cli boards list

# List all posts
npm run cli posts list

# Update a post status
npm run cli posts update-status mobile-app
```

### Key Features

- **Boards Management**: Create, update, delete, and list boards
- **Posts Management**: View, update status, archive, and delete posts
- **Comments Management**: Manage comments across all posts
- **Interactive Mode**: Most commands support interactive selection
- **Filtering**: Filter posts by board/status, comments by post/author
- **Safety Features**: Confirmation prompts for destructive operations

### Common Operations

```bash
# Update board icon
npm run cli boards update features

# Change post status to "in progress"
npm run cli posts update-status mobile-app

# List posts with specific status
npm run cli posts list --status planned

# View comments on a specific post
npm run cli comments list --post mobile-app
```

For detailed CLI documentation, see [`cli/README.md`](cli/README.md).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## License

- Core (outside of `ee/`): AGPLv3. See `LICENSE`.
- Enterprise (`ee/`): commercial license. See `ee/LICENSE`.

This model follows approaches used by projects like Papermark ([repo](https://github.com/mfts/papermark)).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
