#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { boardsCommand } from './commands/boards';
import { postsCommand } from './commands/posts';
import { commentsCommand } from './commands/comments';

// Load environment variables
dotenv.config({ path: '.env.local' });

const program = new Command();

program
  .name('openboards-cli')
  .description('CLI tool for managing OpenBoards database')
  .version('1.0.0')
  .addHelpText('after', `

Examples:
  $ npm run cli boards list                    List all boards
  $ npm run cli posts list --status planned    List posts with planned status
  $ npm run cli posts update-status mobile-app Update post status
  $ npm run cli comments list --post mobile-app List comments on a post

For detailed documentation, see: cli/README.md
  `);

// Add commands
program.addCommand(boardsCommand);
program.addCommand(postsCommand);
program.addCommand(commentsCommand);

// Global error handler
program.exitOverride();

try {
  program.parse();
} catch (err) {
  if (err instanceof Error) {
    console.error(chalk.red('Error:'), err.message);
  } else {
    console.error(chalk.red('An unexpected error occurred'));
  }
  process.exit(1);
}
