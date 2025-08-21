import { users } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { hash } from '@/server/security/password';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';

export const usersCommand = new Command('users')
  .description('Manage users')
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
