import { projects, users } from '@/db/schema';
import { getDatabase } from '@/server/db';
import chalk from 'chalk';
import { Command } from 'commander';
import { asc, desc, eq } from 'drizzle-orm';
import inquirer from 'inquirer';

export const projectsCommand = new Command('projects')
  .description('Manage projects')
  .addHelpText(
    'after',
    `

Examples:
  $ npm run cli projects list                    List all projects
  $ npm run cli projects create                  Create a new project
  $ npm run cli projects update demo             Update a project by subdomain
  $ npm run cli projects delete demo             Delete a project by subdomain
  `
  )
  .addCommand(
    new Command('list').description('List all projects').action(async () => {
      const { db } = getDatabase();
      const rows = await db
        .select({
          id: projects.id,
          name: projects.name,
          subdomain: projects.subdomain,
          description: projects.description,
          userId: projects.userId,
          createdAt: projects.createdAt,
        })
        .from(projects)
        .orderBy(asc(projects.subdomain), desc(projects.createdAt));

      if (rows.length === 0) {
        console.log(chalk.yellow('No projects found.'));
        return;
      }

      console.log(chalk.blue('\n🏷️  Projects:'));
      console.log('─'.repeat(80));
      for (const [index, p] of rows.entries()) {
        console.log(`${chalk.cyan(`${index + 1}.`)} ${chalk.bold(p.name)} (${chalk.gray(p.subdomain)})`);
        if (p.description) console.log(`   ${chalk.gray(p.description)}`);
        console.log(`   User ID: ${chalk.gray(p.userId)}`);
        console.log(`   Created: ${chalk.gray(p.createdAt.toLocaleDateString())}`);
        console.log('');
      }
    })
  )
  .addCommand(
    new Command('create').description('Create a new project').action(async () => {
      const { db } = getDatabase();
      
      // Get available users
      const availableUsers = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .orderBy(users.createdAt);

      if (availableUsers.length === 0) {
        console.log(chalk.red('❌ No users found. Please create a user first.'));
        return;
      }

      const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Project name:', validate: (v) => v.trim().length > 0 || 'Name is required' },
        { type: 'input', name: 'subdomain', message: 'Subdomain (e.g. demo):', filter: (v) => String(v).toLowerCase().trim(), validate: (v) => /^[a-z0-9-]{2,50}$/.test(v) || 'Use lowercase letters, digits, dashes' },
        { type: 'input', name: 'description', message: 'Description (optional):' },
        {
          type: 'list',
          name: 'userId',
          message: 'Select user:',
          choices: availableUsers.map(u => ({ name: u.email, value: u.id })),
        },
      ]);

      try {
        const [row] = await db
          .insert(projects)
          .values({ 
            name: answers.name.trim(), 
            subdomain: answers.subdomain.trim(), 
            description: answers.description?.trim() || null,
            userId: answers.userId,
          })
          .returning();
        console.log(chalk.green('\n✅ Project created successfully!'));
        console.log(chalk.blue(`Name: ${row.name}`));
        console.log(chalk.blue(`Subdomain: ${row.subdomain}`));
        const userEmail = availableUsers.find(u => u.id === answers.userId)?.email;
        console.log(chalk.blue(`User: ${userEmail}`));
      } catch (error) {
        console.error(chalk.red('❌ Error creating project:'), error);
      }
    })
  )
  .addCommand(
    new Command('update')
      .description('Update a project')
      .argument('[subdomain]', 'Project subdomain')
      .action(async (sub) => {
        const { db } = getDatabase();
        let targetSub = sub as string | undefined;
        if (!targetSub) {
          const rows = await db.select({ name: projects.name, subdomain: projects.subdomain }).from(projects).orderBy(asc(projects.subdomain));
          if (rows.length === 0) {
            console.log(chalk.yellow('No projects found.'));
            return;
          }
          const ans = await inquirer.prompt([
            { type: 'list', name: 'sub', message: 'Select a project to update:', choices: rows.map((r) => ({ name: `${r.name} (${r.subdomain})`, value: r.subdomain })) },
          ]);
          targetSub = ans.sub as string;
        }
        const [proj] = await db.select().from(projects).where(eq(projects.subdomain, targetSub!)).limit(1);
        if (!proj) {
          console.log(chalk.red(`Project with subdomain "${targetSub}" not found.`));
          return;
        }
        const answers = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Project name:', default: proj.name },
          { type: 'input', name: 'subdomain', message: 'Subdomain:', default: proj.subdomain, filter: (v) => String(v).toLowerCase().trim(), validate: (v) => /^[a-z0-9-]{2,50}$/.test(v) || 'Use lowercase letters, digits, dashes' },
          { type: 'input', name: 'description', message: 'Description:', default: proj.description || '' },
        ]);
        try {
          const [updated] = await db
            .update(projects)
            .set({ name: answers.name.trim(), subdomain: answers.subdomain.trim(), description: answers.description?.trim() || null })
            .where(eq(projects.id, proj.id))
            .returning();
          console.log(chalk.green('\n✅ Project updated successfully!'));
          console.log(chalk.blue(`Name: ${updated.name}`));
          console.log(chalk.blue(`Subdomain: ${updated.subdomain}`));
        } catch (error) {
          console.error(chalk.red('❌ Error updating project:'), error);
        }
      })
  )
  .addCommand(
    new Command('delete')
      .description('Delete a project')
      .argument('[subdomain]', 'Project subdomain')
      .action(async (sub) => {
        const { db } = getDatabase();
        let targetSub = sub as string | undefined;
        if (!targetSub) {
          const rows = await db.select({ name: projects.name, subdomain: projects.subdomain }).from(projects).orderBy(asc(projects.subdomain));
          if (rows.length === 0) {
            console.log(chalk.yellow('No projects found.'));
            return;
          }
          const ans = await inquirer.prompt([
            { type: 'list', name: 'sub', message: 'Select a project to delete:', choices: rows.map((r) => ({ name: `${r.name} (${r.subdomain})`, value: r.subdomain })) },
          ]);
          targetSub = ans.sub as string;
        }
        const [proj] = await db.select().from(projects).where(eq(projects.subdomain, targetSub!)).limit(1);
        if (!proj) {
          console.log(chalk.red(`Project with subdomain "${targetSub}" not found.`));
          return;
        }
        const { confirm } = await inquirer.prompt([
          { type: 'confirm', name: 'confirm', message: `Are you sure you want to delete project "${proj.name}" (${proj.subdomain})? This will cascade delete boards/posts/comments.`, default: false },
        ]);
        if (!confirm) {
          console.log(chalk.yellow('Deletion cancelled.'));
          return;
        }
        try {
          await db.delete(projects).where(eq(projects.id, proj.id));
          console.log(chalk.green('\n✅ Project deleted successfully!'));
        } catch (error) {
          console.error(chalk.red('❌ Error deleting project:'), error);
        }
      })
  );


