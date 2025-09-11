import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization } from './auth-schema';

export * from './auth-schema';

export const board = pgTable(
  'board',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    icon: text('icon').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => ({
    orgIdx: index('board_org_idx').on(t.organizationId),
  })
);

export type Board = typeof board.$inferSelect;

export const post = pgTable(
  'post',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    boardId: text('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => ({
    orgIdx: index('post_org_idx').on(t.organizationId),
    boardIdx: index('post_board_idx').on(t.boardId),
  })
);

export type Post = typeof post.$inferSelect;
