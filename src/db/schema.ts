import {
  POST_STATUSES,
  type PostStatus as CorePostStatus,
} from '@/types/status';
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

export const postStatusEnum = pgEnum('post_status', [...POST_STATUSES]);
export type PostStatus = CorePostStatus;

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
    createdByUserId: text('created_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdByVisitorId: text('created_by_visitor_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => ({
    orgIdx: index('post_org_idx').on(t.organizationId),
    boardIdx: index('post_board_idx').on(t.boardId),
    statusIdx: index('post_status_idx').on(t.status),
    visitorIdx: index('post_visitor_idx').on(t.createdByVisitorId),
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
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    anonymousId: text('anonymous_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqUser: unique('vote_post_user_unique').on(t.postId, t.userId),
    uniqAnon: unique('vote_post_anon_unique').on(t.postId, t.anonymousId),
    orgIdx: index('vote_org_idx').on(t.organizationId),
    postIdx: index('vote_post_idx').on(t.postId),
    userIdx: index('vote_user_idx').on(t.userId),
    anonIdx: index('vote_anon_idx').on(t.anonymousId),
  })
);

export type Vote = typeof vote.$inferSelect;
