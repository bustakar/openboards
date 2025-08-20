import { boards, comments, posts } from '@/db/schema';
import { getDatabase } from '@/server/db';
import chalk from 'chalk';
import { Command } from 'commander';
import { and, desc, eq } from 'drizzle-orm';
import inquirer from 'inquirer';

export const commentsCommand = new Command('comments')
  .description('Manage comments')
  .addCommand(
    new Command('list')
      .description('List comments')
      .option('-p, --post <slug>', 'Filter by post slug')
      .option('-a, --author <name>', 'Filter by author name')
      .action(async (options) => {
        const { db } = getDatabase();

        const query = db
          .select({
            id: comments.id,
            body: comments.body,
            authorName: comments.authorName,
            isArchived: comments.isArchived,
            createdAt: comments.createdAt,
            postTitle: posts.title,
            postSlug: posts.slug,
            boardName: boards.name,
          })
          .from(comments)
          .leftJoin(posts, eq(comments.postId, posts.id))
          .leftJoin(boards, eq(posts.boardId, boards.id));

        const conditions = [];

        if (options.post) {
          conditions.push(eq(posts.slug, options.post));
        }

        if (options.author) {
          conditions.push(eq(comments.authorName, options.author));
        }

        let allComments;
        if (conditions.length > 0) {
          allComments = await query
            .where(and(...conditions))
            .orderBy(desc(comments.createdAt));
        } else {
          allComments = await query.orderBy(desc(comments.createdAt));
        }

        if (allComments.length === 0) {
          console.log(chalk.yellow('No comments found.'));
          return;
        }

        console.log(chalk.blue('\n💬 Comments:'));
        console.log('─'.repeat(100));

        allComments.forEach((comment, index) => {
          console.log(
            `${chalk.cyan(`${index + 1}.`)} ${chalk.bold(
              comment.authorName || 'Anonymous'
            )}`
          );
          console.log(
            `   Post: ${chalk.gray(comment.postTitle)} (${comment.postSlug})`
          );
          console.log(
            `   Board: ${chalk.gray(comment.boardName || 'Unknown')}`
          );
          console.log(
            `   Content: ${chalk.gray(comment.body.substring(0, 100))}${
              comment.body.length > 100 ? '...' : ''
            }`
          );
          console.log(
            `   Created: ${chalk.gray(comment.createdAt.toLocaleDateString())}`
          );
          if (comment.isArchived) {
            console.log(`   ${chalk.red('📁 Archived')}`);
          }
          console.log('');
        });
      })
  )
  .addCommand(
    new Command('view')
      .description('View a specific comment')
      .argument('[id]', 'Comment ID')
      .action(async (id) => {
        const { db } = getDatabase();

        let commentId = id;
        if (!commentId) {
          const allComments = await db
            .select({
              id: comments.id,
              body: comments.body,
              authorName: comments.authorName,
              postTitle: posts.title,
            })
            .from(comments)
            .leftJoin(posts, eq(comments.postId, posts.id))
            .orderBy(desc(comments.createdAt));

          if (allComments.length === 0) {
            console.log(chalk.yellow('No comments found.'));
            return;
          }

          const { selectedId } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedId',
              message: 'Select a comment to view:',
              choices: allComments.map((c) => ({
                name: `${c.authorName || 'Anonymous'} on "${c.postTitle}"`,
                value: c.id,
              })),
            },
          ]);
          commentId = selectedId;
        }

        const [comment] = await db
          .select({
            id: comments.id,
            body: comments.body,
            authorName: comments.authorName,
            isArchived: comments.isArchived,
            createdAt: comments.createdAt,
            postTitle: posts.title,
            postSlug: posts.slug,
            boardName: boards.name,
          })
          .from(comments)
          .leftJoin(posts, eq(comments.postId, posts.id))
          .leftJoin(boards, eq(posts.boardId, boards.id))
          .where(eq(comments.id, commentId))
          .limit(1);

        if (!comment) {
          console.log(chalk.red(`Comment with ID "${commentId}" not found.`));
          return;
        }

        console.log(chalk.blue('\n💬 Comment Details:'));
        console.log('─'.repeat(80));
        console.log(chalk.bold(`Author: ${comment.authorName || 'Anonymous'}`));
        console.log(
          `Post: ${chalk.gray(comment.postTitle)} (${comment.postSlug})`
        );
        console.log(`Board: ${chalk.gray(comment.boardName || 'Unknown')}`);
        console.log(
          `Created: ${chalk.gray(comment.createdAt.toLocaleDateString())}`
        );
        if (comment.isArchived) {
          console.log(`${chalk.red('📁 Archived')}`);
        }
        console.log('');

        console.log(chalk.blue('Content:'));
        console.log('─'.repeat(40));
        console.log(comment.body);
        console.log('');
      })
  )
  .addCommand(
    new Command('create')
      .description('Create a new comment')
      .action(async () => {
        const { db } = getDatabase();

        // First, select a post
        const allPosts = await db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            boardName: boards.name,
          })
          .from(posts)
          .leftJoin(boards, eq(posts.boardId, boards.id))
          .orderBy(desc(posts.createdAt));

        if (allPosts.length === 0) {
          console.log(chalk.yellow('No posts found. Cannot create comment.'));
          return;
        }

        const { postId } = await inquirer.prompt([
          {
            type: 'list',
            name: 'postId',
            message: 'Select a post to comment on:',
            choices: allPosts.map((p) => ({
              name: `${p.title} (${p.boardName})`,
              value: p.id,
            })),
          },
        ]);

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'body',
            message: 'Comment content:',
            validate: (input) =>
              input.trim().length > 0 || 'Comment content is required',
          },
          {
            type: 'input',
            name: 'authorName',
            message: 'Author name (optional):',
          },
        ]);

        try {
          const [newComment] = await db
            .insert(comments)
            .values({
              postId,
              body: answers.body.trim(),
              authorName: answers.authorName?.trim() || null,
              visitorId: 'cli-admin', // Use a special visitor ID for CLI-created comments
            })
            .returning();

          console.log(chalk.green('\n✅ Comment created successfully!'));
          console.log(
            chalk.blue(`Author: ${newComment.authorName || 'Anonymous'}`)
          );
          console.log(
            chalk.blue(
              `Content: ${newComment.body.substring(0, 50)}${
                newComment.body.length > 50 ? '...' : ''
              }`
            )
          );
        } catch (error) {
          console.error(chalk.red('❌ Error creating comment:'), error);
        }
      })
  )
  .addCommand(
    new Command('update')
      .description('Update a comment')
      .argument('[id]', 'Comment ID')
      .action(async (id) => {
        const { db } = getDatabase();

        let commentId = id;
        if (!commentId) {
          const allComments = await db
            .select({
              id: comments.id,
              body: comments.body,
              authorName: comments.authorName,
              postTitle: posts.title,
            })
            .from(comments)
            .leftJoin(posts, eq(comments.postId, posts.id))
            .orderBy(desc(comments.createdAt));

          if (allComments.length === 0) {
            console.log(chalk.yellow('No comments found.'));
            return;
          }

          const { selectedId } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedId',
              message: 'Select a comment to update:',
              choices: allComments.map((c) => ({
                name: `${c.authorName || 'Anonymous'} on "${c.postTitle}"`,
                value: c.id,
              })),
            },
          ]);
          commentId = selectedId;
        }

        const [comment] = await db
          .select({
            id: comments.id,
            body: comments.body,
            authorName: comments.authorName,
          })
          .from(comments)
          .where(eq(comments.id, commentId))
          .limit(1);

        if (!comment) {
          console.log(chalk.red(`Comment with ID "${commentId}" not found.`));
          return;
        }

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'body',
            message: 'Comment content:',
            default: comment.body,
            validate: (input) =>
              input.trim().length > 0 || 'Comment content is required',
          },
          {
            type: 'input',
            name: 'authorName',
            message: 'Author name:',
            default: comment.authorName || '',
          },
        ]);

        try {
          const [updatedComment] = await db
            .update(comments)
            .set({
              body: answers.body.trim(),
              authorName: answers.authorName?.trim() || null,
            })
            .where(eq(comments.id, comment.id))
            .returning();

          console.log(chalk.green('\n✅ Comment updated successfully!'));
          console.log(
            chalk.blue(`Author: ${updatedComment.authorName || 'Anonymous'}`)
          );
          console.log(
            chalk.blue(
              `Content: ${updatedComment.body.substring(0, 50)}${
                updatedComment.body.length > 50 ? '...' : ''
              }`
            )
          );
        } catch (error) {
          console.error(chalk.red('❌ Error updating comment:'), error);
        }
      })
  )
  .addCommand(
    new Command('archive')
      .description('Archive/unarchive a comment')
      .argument('[id]', 'Comment ID')
      .action(async (id) => {
        const { db } = getDatabase();

        let commentId = id;
        if (!commentId) {
          const allComments = await db
            .select({
              id: comments.id,
              body: comments.body,
              authorName: comments.authorName,
              isArchived: comments.isArchived,
              postTitle: posts.title,
            })
            .from(comments)
            .leftJoin(posts, eq(comments.postId, posts.id))
            .orderBy(desc(comments.createdAt));

          if (allComments.length === 0) {
            console.log(chalk.yellow('No comments found.'));
            return;
          }

          const { selectedId } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedId',
              message: 'Select a comment:',
              choices: allComments.map((c) => ({
                name: `${c.authorName || 'Anonymous'} on "${c.postTitle}" ${
                  c.isArchived ? '📁 Archived' : '💬 Active'
                }`,
                value: c.id,
              })),
            },
          ]);
          commentId = selectedId;
        }

        const [comment] = await db
          .select({
            id: comments.id,
            body: comments.body,
            authorName: comments.authorName,
            isArchived: comments.isArchived,
          })
          .from(comments)
          .where(eq(comments.id, commentId))
          .limit(1);

        if (!comment) {
          console.log(chalk.red(`Comment with ID "${commentId}" not found.`));
          return;
        }

        const action = comment.isArchived ? 'unarchive' : 'archive';
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to ${action} comment by "${
              comment.authorName || 'Anonymous'
            }"?`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Operation cancelled.'));
          return;
        }

        try {
          const [updatedComment] = await db
            .update(comments)
            .set({ isArchived: !comment.isArchived })
            .where(eq(comments.id, comment.id))
            .returning();

          console.log(chalk.green(`\n✅ Comment ${action}d successfully!`));
          console.log(
            chalk.blue(`Author: ${updatedComment.authorName || 'Anonymous'}`)
          );
          console.log(chalk.blue(`Archived: ${updatedComment.isArchived}`));
        } catch (error) {
          console.error(chalk.red(`❌ Error ${action}ing comment:`), error);
        }
      })
  )
  .addCommand(
    new Command('delete')
      .description('Delete a comment')
      .argument('[id]', 'Comment ID')
      .action(async (id) => {
        const { db } = getDatabase();

        let commentId = id;
        if (!commentId) {
          const allComments = await db
            .select({
              id: comments.id,
              body: comments.body,
              authorName: comments.authorName,
              postTitle: posts.title,
            })
            .from(comments)
            .leftJoin(posts, eq(comments.postId, posts.id))
            .orderBy(desc(comments.createdAt));

          if (allComments.length === 0) {
            console.log(chalk.yellow('No comments found.'));
            return;
          }

          const { selectedId } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedId',
              message: 'Select a comment to delete:',
              choices: allComments.map((c) => ({
                name: `${c.authorName || 'Anonymous'} on "${c.postTitle}"`,
                value: c.id,
              })),
            },
          ]);
          commentId = selectedId;
        }

        const [comment] = await db
          .select({
            id: comments.id,
            body: comments.body,
            authorName: comments.authorName,
          })
          .from(comments)
          .where(eq(comments.id, commentId))
          .limit(1);

        if (!comment) {
          console.log(chalk.red(`Comment with ID "${commentId}" not found.`));
          return;
        }

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete comment by "${
              comment.authorName || 'Anonymous'
            }"? This action cannot be undone.`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Deletion cancelled.'));
          return;
        }

        try {
          await db.delete(comments).where(eq(comments.id, comment.id));
          console.log(chalk.green('\n✅ Comment deleted successfully!'));
        } catch (error) {
          console.error(chalk.red('❌ Error deleting comment:'), error);
        }
      })
  );
