import { users } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { hash } from '@/server/security/password';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';

export const usersCommand = new Command('users')
  .description('Manage users')
  .addCommand(
    new Command('list').description('List all users').action(async () => {
      const { db } = getDatabase();
      try {
        const rows = await db
          .select({
            id: users.id,
            email: users.email,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .orderBy(users.createdAt);

        if (rows.length === 0) {
          console.log(chalk.yellow('No users found'));
          return;
        }

        console.log(chalk.blue(`\n📋 Found ${rows.length} user(s):\n`));
        rows.forEach((user, index) => {
          console.log(chalk.white(`${index + 1}. ${user.email}`));
          console.log(chalk.gray(`   ID: ${user.id}`));
          console.log(
            chalk.gray(`   Created: ${user.createdAt.toLocaleDateString()}`)
          );
          console.log(
            chalk.gray(`   Updated: ${user.updatedAt.toLocaleDateString()}`)
          );
          console.log('');
        });
      } catch (e) {
        console.error(chalk.red('❌ Failed to list users'), e);
      }
    })
  )
  .addCommand(
    new Command('create').description('Create a user').action(async () => {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email:',
          validate: (v) =>
            /.+@.+\..+/.test(String(v)) || 'Valid email required',
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          mask: '*',
          validate: (v) => String(v).length >= 8 || 'Min 8 chars',
        },
      ]);
      const { db } = getDatabase();
      try {
        const passwordHash = await hash(String(answers.password));
        const [row] = await db
          .insert(users)
          .values({ email: String(answers.email).toLowerCase(), passwordHash })
          .returning();
        console.log(chalk.green('\n✅ User created'));
        console.log(chalk.blue(`Email: ${row.email}`));
      } catch (e) {
        console.error(chalk.red('❌ Failed to create user'), e);
      }
    })
  );
