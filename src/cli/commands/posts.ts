import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { getDatabase } from '@/server/db';
import { posts, boards } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

const POST_STATUSES = ['backlog', 'planned', 'in_progress', 'completed', 'closed'] as const;

export const postsCommand = new Command('posts')
  .description('Manage posts')
  .addCommand(
    new Command('list')
      .description('List posts')
      .option('-b, --board <slug>', 'Filter by board slug')
      .option('-s, --status <status>', 'Filter by status')
      .action(async (options) => {
        const { db } = getDatabase();
        
        const query = db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            status: posts.status,
            voteCount: posts.voteCount,
            commentCount: posts.commentCount,
            isArchived: posts.isArchived,
            createdAt: posts.createdAt,
            boardName: boards.name,
            boardSlug: boards.slug,
          })
          .from(posts)
          .leftJoin(boards, eq(posts.boardId, boards.id));

        const conditions = [];
        
        if (options.board) {
          conditions.push(eq(boards.slug, options.board));
        }
        
        if (options.status) {
          conditions.push(eq(posts.status, options.status));
        }

        let allPosts;
        if (conditions.length > 0) {
          allPosts = await query.where(and(...conditions)).orderBy(desc(posts.createdAt));
        } else {
          allPosts = await query.orderBy(desc(posts.createdAt));
        }

        if (allPosts.length === 0) {
          console.log(chalk.yellow('No posts found.'));
          return;
        }

        console.log(chalk.blue('\n📝 Posts:'));
        console.log('─'.repeat(100));
        
        allPosts.forEach((post, index) => {
          const statusColor = {
            backlog: chalk.gray,
            planned: chalk.yellow,
            in_progress: chalk.blue,
            completed: chalk.green,
            closed: chalk.red,
          }[post.status] || chalk.gray;

          console.log(
            `${chalk.cyan(`${index + 1}.`)} ${chalk.bold(post.title)}`
          );
          console.log(`   Board: ${chalk.gray(post.boardName || 'Unknown')} (${post.boardSlug})`);
          console.log(`   Status: ${statusColor(post.status)}`);
          console.log(`   Votes: ${chalk.gray(post.voteCount)} | Comments: ${chalk.gray(post.commentCount)}`);
          console.log(`   Slug: ${chalk.gray(post.slug)}`);
          console.log(`   Created: ${chalk.gray(post.createdAt.toLocaleDateString())}`);
          if (post.isArchived) {
            console.log(`   ${chalk.red('📁 Archived')}`);
          }
          console.log('');
        });
      })
  )
  .addCommand(
    new Command('view')
      .description('View a specific post')
      .argument('[slug]', 'Post slug')
      .action(async (slug) => {
        const { db } = getDatabase();

        let postSlug = slug;
        if (!postSlug) {
          const allPosts = await db
            .select({
              slug: posts.slug,
              title: posts.title,
              boardName: boards.name,
            })
            .from(posts)
            .leftJoin(boards, eq(posts.boardId, boards.id))
            .orderBy(desc(posts.createdAt));

          if (allPosts.length === 0) {
            console.log(chalk.yellow('No posts found.'));
            return;
          }

          const { selectedSlug } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedSlug',
              message: 'Select a post to view:',
              choices: allPosts.map((p) => ({
                name: `${p.title} (${p.boardName})`,
                value: p.slug,
              })),
            },
          ]);
          postSlug = selectedSlug;
        }

        const [post] = await db
          .select({
            id: posts.id,
            title: posts.title,
            body: posts.body,
            slug: posts.slug,
            status: posts.status,
            voteCount: posts.voteCount,
            commentCount: posts.commentCount,
            isArchived: posts.isArchived,
            createdAt: posts.createdAt,
            boardName: boards.name,
            boardSlug: boards.slug,
          })
          .from(posts)
          .leftJoin(boards, eq(posts.boardId, boards.id))
          .where(eq(posts.slug, postSlug))
          .limit(1);

        if (!post) {
          console.log(chalk.red(`Post with slug "${postSlug}" not found.`));
          return;
        }

        const statusColor = {
          backlog: chalk.gray,
          planned: chalk.yellow,
          in_progress: chalk.blue,
          completed: chalk.green,
          closed: chalk.red,
        }[post.status] || chalk.gray;

        console.log(chalk.blue('\n📝 Post Details:'));
        console.log('─'.repeat(80));
        console.log(chalk.bold(`Title: ${post.title}`));
        console.log(`Board: ${chalk.gray(post.boardName)} (${post.boardSlug})`);
        console.log(`Status: ${statusColor(post.status)}`);
        console.log(`Votes: ${chalk.gray(post.voteCount)} | Comments: ${chalk.gray(post.commentCount)}`);
        console.log(`Slug: ${chalk.gray(post.slug)}`);
        console.log(`Created: ${chalk.gray(post.createdAt.toLocaleDateString())}`);
        if (post.isArchived) {
          console.log(`${chalk.red('📁 Archived')}`);
        }
        console.log('');
        
        if (post.body) {
          console.log(chalk.blue('Content:'));
          console.log('─'.repeat(40));
          console.log(post.body);
          console.log('');
        }
      })
  )
  .addCommand(
    new Command('update-status')
      .description('Update post status')
      .argument('[slug]', 'Post slug')
      .action(async (slug) => {
        const { db } = getDatabase();

        let postSlug = slug;
        if (!postSlug) {
          const allPosts = await db
            .select({
              slug: posts.slug,
              title: posts.title,
              status: posts.status,
              boardName: boards.name,
            })
            .from(posts)
            .leftJoin(boards, eq(posts.boardId, boards.id))
            .orderBy(desc(posts.createdAt));

          if (allPosts.length === 0) {
            console.log(chalk.yellow('No posts found.'));
            return;
          }

          const { selectedSlug } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedSlug',
              message: 'Select a post to update:',
              choices: allPosts.map((p) => ({
                name: `${p.title} (${p.boardName}) - ${p.status}`,
                value: p.slug,
              })),
            },
          ]);
          postSlug = selectedSlug;
        }

        const [post] = await db
          .select({
            id: posts.id,
            title: posts.title,
            status: posts.status,
          })
          .from(posts)
          .where(eq(posts.slug, postSlug))
          .limit(1);

        if (!post) {
          console.log(chalk.red(`Post with slug "${postSlug}" not found.`));
          return;
        }

        const { newStatus } = await inquirer.prompt([
          {
            type: 'list',
            name: 'newStatus',
            message: `Current status: ${post.status}. Select new status:`,
            choices: POST_STATUSES.map((status) => ({
              name: status,
              value: status,
            })),
          },
        ]);

        try {
          const [updatedPost] = await db
            .update(posts)
            .set({ status: newStatus })
            .where(eq(posts.id, post.id))
            .returning();

          console.log(chalk.green('\n✅ Post status updated successfully!'));
          console.log(chalk.blue(`Title: ${updatedPost.title}`));
          console.log(chalk.blue(`New Status: ${updatedPost.status}`));
        } catch (error) {
          console.error(chalk.red('❌ Error updating post status:'), error);
        }
      })
  )
  .addCommand(
    new Command('archive')
      .description('Archive/unarchive a post')
      .argument('[slug]', 'Post slug')
      .action(async (slug) => {
        const { db } = getDatabase();

        let postSlug = slug;
        if (!postSlug) {
          const allPosts = await db
            .select({
              slug: posts.slug,
              title: posts.title,
              isArchived: posts.isArchived,
              boardName: boards.name,
            })
            .from(posts)
            .leftJoin(boards, eq(posts.boardId, boards.id))
            .orderBy(desc(posts.createdAt));

          if (allPosts.length === 0) {
            console.log(chalk.yellow('No posts found.'));
            return;
          }

          const { selectedSlug } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedSlug',
              message: 'Select a post:',
              choices: allPosts.map((p) => ({
                name: `${p.title} (${p.boardName}) ${p.isArchived ? '📁 Archived' : '📄 Active'}`,
                value: p.slug,
              })),
            },
          ]);
          postSlug = selectedSlug;
        }

        const [post] = await db
          .select({
            id: posts.id,
            title: posts.title,
            isArchived: posts.isArchived,
          })
          .from(posts)
          .where(eq(posts.slug, postSlug))
          .limit(1);

        if (!post) {
          console.log(chalk.red(`Post with slug "${postSlug}" not found.`));
          return;
        }

        const action = post.isArchived ? 'unarchive' : 'archive';
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to ${action} post "${post.title}"?`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Operation cancelled.'));
          return;
        }

        try {
          const [updatedPost] = await db
            .update(posts)
            .set({ isArchived: !post.isArchived })
            .where(eq(posts.id, post.id))
            .returning();

          console.log(chalk.green(`\n✅ Post ${action}d successfully!`));
          console.log(chalk.blue(`Title: ${updatedPost.title}`));
          console.log(chalk.blue(`Archived: ${updatedPost.isArchived}`));
        } catch (error) {
          console.error(chalk.red(`❌ Error ${action}ing post:`), error);
        }
      })
  )
  .addCommand(
    new Command('delete')
      .description('Delete a post')
      .argument('[slug]', 'Post slug')
      .action(async (slug) => {
        const { db } = getDatabase();

        let postSlug = slug;
        if (!postSlug) {
          const allPosts = await db
            .select({
              slug: posts.slug,
              title: posts.title,
              boardName: boards.name,
            })
            .from(posts)
            .leftJoin(boards, eq(posts.boardId, boards.id))
            .orderBy(desc(posts.createdAt));

          if (allPosts.length === 0) {
            console.log(chalk.yellow('No posts found.'));
            return;
          }

          const { selectedSlug } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedSlug',
              message: 'Select a post to delete:',
              choices: allPosts.map((p) => ({
                name: `${p.title} (${p.boardName})`,
                value: p.slug,
              })),
            },
          ]);
          postSlug = selectedSlug;
        }

        const [post] = await db
          .select({
            id: posts.id,
            title: posts.title,
          })
          .from(posts)
          .where(eq(posts.slug, postSlug))
          .limit(1);

        if (!post) {
          console.log(chalk.red(`Post with slug "${postSlug}" not found.`));
          return;
        }

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete post "${post.title}"? This action cannot be undone.`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Deletion cancelled.'));
          return;
        }

        try {
          await db.delete(posts).where(eq(posts.id, post.id));
          console.log(chalk.green('\n✅ Post deleted successfully!'));
        } catch (error) {
          console.error(chalk.red('❌ Error deleting post:'), error);
        }
      })
  );
