# Contributing to OpenBoards

Thank you for your interest in contributing to OpenBoards! This document provides guidelines and information for contributors.

## What is OpenBoards?

OpenBoards is an open-source feedback and roadmap management platform that helps teams collect, organize, and prioritize user feedback. It's built with Next.js, Better Auth, Drizzle ORM, and PostgreSQL.

## How Can I Contribute?

### 🐛 Report Bugs

- Use the GitHub issue tracker
- Include steps to reproduce the bug
- Describe the expected vs. actual behavior
- Include your environment details (OS, browser, etc.)

### 💡 Suggest Features

- Check existing issues first
- Describe the feature and its use case
- Explain how it fits into the project's goals

### 🔧 Submit Code Changes

- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Make your changes
- Add tests if applicable
- Commit with clear commit messages
- Push to your branch
- Open a Pull Request

## Development Setup

### Local Development

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Set up your PostgreSQL database
5. Run migrations: `npm run db:migrate`
6. Start the development server: `npm run dev`

### Database

- We use Drizzle ORM with PostgreSQL
- Run `npm run db:generate` to create new migrations
- Run `npm run db:migrate` to apply migrations
- Run `npm run db:seed` to populate test data

## Code Style & Standards

### TypeScript

- Use TypeScript for all new code
- Follow strict mode guidelines
- Use proper type annotations
- Avoid `any` types

### React/Next.js

- Use functional components with hooks
- Follow Next.js 13+ App Router patterns
- Use server components when possible
- Implement proper error boundaries

### Database

- Use Drizzle ORM for all database operations
- Write migrations for schema changes
- Include proper indexes for performance
- Use transactions for multi-table operations

## Commit Message Format

We use conventional commits:

```
type: description

[optional body]

[optional footer]
```

Types:

- `feature`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feature: add GitHub OAuth provider
fix: resolve migration constraint issue
docs: update installation instructions
```

## Pull Request Process

1. **Title**: Use a clear, descriptive title
2. **Description**: Explain what the PR does and why
3. **Screenshots**: Include screenshots for UI changes
4. **Breaking Changes**: Note any breaking changes
5. **Related Issues**: Link related issues with `Closes #123`

## Review Process

- All PRs require at least one review & review from maintainer
- Address review comments promptly
- Maintainers may request changes before merging
- CI checks must pass before merging

## Getting Help

- Check existing issues and discussions
- Join our community discussions
- Ask questions in GitHub Discussions
- Reach out to maintainers for guidance

## License

By contributing to OpenBoards, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

Thank you for contributing to OpenBoards! 🎉
