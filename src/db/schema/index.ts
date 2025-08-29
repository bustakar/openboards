import {
  boolean,
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { account, session, user, verification } from '../../../auth-schema';
export { account, session, user, verification };

export const postStatusEnum = pgEnum('post_status', [
  'backlog',
  'planned',
  'in_progress',
  'completed',
  'closed',
]);

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  subdomain: text('subdomain').notNull().unique(),
  description: text('description'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const boards = pgTable(
  'boards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    icon: text('icon'),
    position: integer('position').notNull().default(0),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    boardsProjectSlugUq: uniqueIndex('boards_project_slug_uq').on(
      t.projectId,
      t.slug
    ),
  })
);

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body'),
    slug: text('slug').notNull(),
    status: postStatusEnum('status').notNull().default('backlog'),
    isArchived: boolean('is_archived').notNull().default(false),
    pinned: boolean('pinned').notNull().default(false),
    voteCount: integer('vote_count').notNull().default(0),
    commentCount: integer('comment_count').notNull().default(0),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    // tsvector for FTS; managed by DB trigger
    searchVector: customType<{ data: unknown }>({
      dataType() {
        return 'tsvector';
      },
    })('search_vector'),
  },
  (t) => ({
    postsBoardStatusIdx: index('posts_board_status_idx').on(
      t.boardId,
      t.status,
      t.pinned,
      t.lastActivityAt
    ),
    postsBoardSlugUq: uniqueIndex('posts_board_slug_uq').on(t.boardId, t.slug),
  })
);

export const votes = pgTable(
  'votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    visitorId: text('visitor_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    votesPostVisitorUq: uniqueIndex('votes_post_visitor_uq').on(
      t.postId,
      t.visitorId
    ),
  })
);

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    authorName: text('author_name'),
    visitorId: text('visitor_id').notNull(),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    commentsPostCreatedIdx: index('comments_post_created_idx').on(
      t.postId,
      t.createdAt
    ),
  })
);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({ usersEmailUq: uniqueIndex('users_email_uq').on(t.email) })
);
