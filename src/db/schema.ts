import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { organization, user } from './auth-schema';
export * from './auth-schema';

export const postStatusEnum = pgEnum('post_status', [
  'open',
  'backlog',
  'planned',
  'in_progress',
  'done',
  'closed',
]);
export type PostStatus = (typeof postStatusEnum)['enumValues'][number];

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
    status: postStatusEnum('status').default('open').notNull(),
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

export const vote = pgTable(
  'vote',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    postId: text('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniq: unique('vote_post_user_unique').on(t.postId, t.userId),
    orgIdx: index('vote_org_idx').on(t.organizationId),
    postIdx: index('vote_post_idx').on(t.postId),
    userIdx: index('vote_user_idx').on(t.userId),
  })
);

export type Vote = typeof vote.$inferSelect;
