export const POST_STATUSES = [
  'open',
  'planned',
  'in_progress',
  'done',
  'closed',
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];
