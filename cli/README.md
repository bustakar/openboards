# OpenBoards CLI

A command-line interface for managing OpenBoards database. This CLI tool provides temporary admin functionality until a proper admin dashboard is built.

## Installation

The CLI is included with the OpenBoards project. Make sure you have the required dependencies installed:

```bash
npm install
```

## Usage

Run the CLI using the npm script:

```bash
npm run cli
```

Or directly with tsx:

```bash
npx tsx cli/index.ts
```

## Commands

### Boards Management

#### List Boards

```bash
npm run cli boards list
```

Lists all boards with their details including name, slug, description, icon, and position.

#### Create Board

```bash
npm run cli boards create
```

Interactive command to create a new board. Prompts for:

- Board name (required)
- Board slug (auto-generated if not provided)
- Description (optional)
- Icon emoji (optional, defaults to 📋)
- Position (optional, defaults to 0)

#### Update Board

```bash
npm run cli boards update [slug]
```

Interactive command to update an existing board. If no slug is provided, shows a list to select from.

#### Delete Board

```bash
npm run cli boards delete [slug]
```

Deletes a board. If no slug is provided, shows a list to select from. Requires confirmation.

### Posts Management

#### List Posts

```bash
npm run cli posts list
npm run cli posts list --board features
npm run cli posts list --status planned
npm run cli posts list --board features --status in_progress
```

Lists all posts with filtering options:

- `--board <slug>`: Filter by board slug
- `--status <status>`: Filter by status (backlog, planned, in_progress, completed, closed)

#### View Post

```bash
npm run cli posts view [slug]
```

Shows detailed information about a specific post including content, status, votes, and comments.

#### Update Post Status

```bash
npm run cli posts update-status [slug]
```

Interactive command to update a post's status. Available statuses:

- backlog
- planned
- in_progress
- completed
- closed

#### Archive/Unarchive Post

```bash
npm run cli posts archive [slug]
```

Toggles the archived state of a post. Archived posts are hidden from the UI.

#### Delete Post

```bash
npm run cli posts delete [slug]
```

Deletes a post permanently. Requires confirmation.

### Comments Management

#### List Comments

```bash
npm run cli comments list
npm run cli comments list --post mobile-app
npm run cli comments list --author "John Doe"
```

Lists all comments with filtering options:

- `--post <slug>`: Filter by post slug
- `--author <name>`: Filter by author name

#### View Comment

```bash
npm run cli comments view [id]
```

Shows detailed information about a specific comment.

#### Create Comment

```bash
npm run cli comments create
```

Interactive command to create a new comment. Prompts for:

- Post selection (from list)
- Comment content (required)
- Author name (optional)

#### Update Comment

```bash
npm run cli comments update [id]
```

Interactive command to update an existing comment's content and author name.

#### Archive/Unarchive Comment

```bash
npm run cli comments archive [id]
```

Toggles the archived state of a comment. Archived comments are hidden from the UI.

#### Delete Comment

```bash
npm run cli comments delete [id]
```

Deletes a comment permanently. Requires confirmation.

## Examples

### Quick Status Updates

```bash
# Update a post status to "in progress"
npm run cli posts update-status mobile-app

# List all planned posts
npm run cli posts list --status planned

# Archive a problematic comment
npm run cli comments archive 123
```

### Board Management

```bash
# Create a new board
npm run cli boards create

# Update board icon
npm run cli boards update features

# List all boards
npm run cli boards list
```

### Content Management

```bash
# View all comments on a specific post
npm run cli comments list --post mobile-app

# Create a comment on a post
npm run cli comments create

# View post details
npm run cli posts view mobile-app
```

## Environment Setup

Make sure your `.env.local` file contains the database connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/openboards
```

## Error Handling

The CLI includes comprehensive error handling:

- Database connection errors
- Validation errors
- Confirmation prompts for destructive operations
- Clear error messages with suggestions

## Interactive Mode

Most commands support interactive mode when no arguments are provided:

- Lists are shown for selection
- Prompts guide you through the process
- Default values are provided where appropriate

## Safety Features

- Confirmation prompts for destructive operations
- Validation of required fields
- Clear feedback for all operations
- Error handling with helpful messages
