import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { getDatabase } from '@/server/db';
import { boards } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const boardsCommand = new Command('boards')
  .description('Manage boards')
  .addCommand(
    new Command('list')
      .description('List all boards')
      .action(async () => {
        const { db } = getDatabase();
        const allBoards = await db
          .select({
            id: boards.id,
            name: boards.name,
            slug: boards.slug,
            description: boards.description,
            icon: boards.icon,
            position: boards.position,
            createdAt: boards.createdAt,
          })
          .from(boards)
          .orderBy(desc(boards.position), desc(boards.createdAt));

        if (allBoards.length === 0) {
          console.log(chalk.yellow('No boards found.'));
          return;
        }

        console.log(chalk.blue('\n📋 Boards:'));
        console.log('─'.repeat(80));
        
        allBoards.forEach((board, index) => {
          console.log(
            `${chalk.cyan(`${index + 1}.`)} ${board.icon || '📋'} ${chalk.bold(board.name)}`
          );
          console.log(`   Slug: ${chalk.gray(board.slug)}`);
          if (board.description) {
            console.log(`   Description: ${chalk.gray(board.description)}`);
          }
          console.log(`   Position: ${chalk.gray(board.position)}`);
          console.log(`   Created: ${chalk.gray(board.createdAt.toLocaleDateString())}`);
          console.log('');
        });
      })
  )
  .addCommand(
    new Command('create')
      .description('Create a new board')
      .action(async () => {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Board name:',
            validate: (input) => input.trim().length > 0 || 'Name is required',
          },
          {
            type: 'input',
            name: 'slug',
            message: 'Board slug (leave empty for auto-generation):',
            default: (answers: { name?: string }) => answers.name?.toLowerCase().replace(/\s+/g, '-'),
          },
          {
            type: 'input',
            name: 'description',
            message: 'Board description (optional):',
          },
          {
            type: 'input',
            name: 'icon',
            message: 'Board icon (emoji, optional):',
            default: '📋',
          },
          {
            type: 'number',
            name: 'position',
            message: 'Board position (optional):',
            default: 0,
          },
        ]);

        const { db } = getDatabase();
        const slug = answers.slug || answers.name.toLowerCase().replace(/\s+/g, '-');

        try {
          const [newBoard] = await db
            .insert(boards)
            .values({
              name: answers.name.trim(),
              slug: slug.trim(),
              description: answers.description?.trim() || null,
              icon: answers.icon?.trim() || '📋',
              position: answers.position || 0,
            })
            .returning();

          console.log(chalk.green('\n✅ Board created successfully!'));
          console.log(chalk.blue(`Name: ${newBoard.name}`));
          console.log(chalk.blue(`Slug: ${newBoard.slug}`));
        } catch (error) {
          console.error(chalk.red('❌ Error creating board:'), error);
        }
      })
  )
  .addCommand(
    new Command('update')
      .description('Update a board')
      .argument('[slug]', 'Board slug')
      .action(async (slug) => {
        const { db } = getDatabase();

        // If no slug provided, show list to select from
        let boardSlug = slug;
        if (!boardSlug) {
          const allBoards = await db
            .select({ slug: boards.slug, name: boards.name })
            .from(boards)
            .orderBy(desc(boards.position));

          if (allBoards.length === 0) {
            console.log(chalk.yellow('No boards found.'));
            return;
          }

          const { selectedSlug } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedSlug',
              message: 'Select a board to update:',
              choices: allBoards.map((b) => ({
                name: `${b.name} (${b.slug})`,
                value: b.slug,
              })),
            },
          ]);
          boardSlug = selectedSlug;
        }

        const [board] = await db
          .select()
          .from(boards)
          .where(eq(boards.slug, boardSlug))
          .limit(1);

        if (!board) {
          console.log(chalk.red(`Board with slug "${boardSlug}" not found.`));
          return;
        }

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Board name:',
            default: board.name,
            validate: (input) => input.trim().length > 0 || 'Name is required',
          },
          {
            type: 'input',
            name: 'description',
            message: 'Board description:',
            default: board.description || '',
          },
          {
            type: 'input',
            name: 'icon',
            message: 'Board icon (emoji):',
            default: board.icon || '📋',
          },
          {
            type: 'number',
            name: 'position',
            message: 'Board position:',
            default: board.position,
          },
        ]);

        try {
          const [updatedBoard] = await db
            .update(boards)
            .set({
              name: answers.name.trim(),
              description: answers.description?.trim() || null,
              icon: answers.icon?.trim() || '📋',
              position: answers.position || 0,
            })
            .where(eq(boards.id, board.id))
            .returning();

          console.log(chalk.green('\n✅ Board updated successfully!'));
          console.log(chalk.blue(`Name: ${updatedBoard.name}`));
          console.log(chalk.blue(`Slug: ${updatedBoard.slug}`));
        } catch (error) {
          console.error(chalk.red('❌ Error updating board:'), error);
        }
      })
  )
  .addCommand(
    new Command('delete')
      .description('Delete a board')
      .argument('[slug]', 'Board slug')
      .action(async (slug) => {
        const { db } = getDatabase();

        // If no slug provided, show list to select from
        let boardSlug = slug;
        if (!boardSlug) {
          const allBoards = await db
            .select({ slug: boards.slug, name: boards.name })
            .from(boards)
            .orderBy(desc(boards.position));

          if (allBoards.length === 0) {
            console.log(chalk.yellow('No boards found.'));
            return;
          }

          const { selectedSlug } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedSlug',
              message: 'Select a board to delete:',
              choices: allBoards.map((b) => ({
                name: `${b.name} (${b.slug})`,
                value: b.slug,
              })),
            },
          ]);
          boardSlug = selectedSlug;
        }

        const [board] = await db
          .select()
          .from(boards)
          .where(eq(boards.slug, boardSlug))
          .limit(1);

        if (!board) {
          console.log(chalk.red(`Board with slug "${boardSlug}" not found.`));
          return;
        }

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete board "${board.name}" (${board.slug})? This action cannot be undone.`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Deletion cancelled.'));
          return;
        }

        try {
          await db.delete(boards).where(eq(boards.id, board.id));
          console.log(chalk.green('\n✅ Board deleted successfully!'));
        } catch (error) {
          console.error(chalk.red('❌ Error deleting board:'), error);
        }
      })
  );
