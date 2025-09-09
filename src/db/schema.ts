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
