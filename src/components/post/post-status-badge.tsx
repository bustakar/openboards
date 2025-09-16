import type { PostStatus } from '@/db/schema';
import { cn } from '@/lib/utils';

const LABELS: Record<PostStatus, string> = {
  open: 'Open',
  backlog: 'Backlog',
  planned: 'Planned',
  in_progress: 'In progress',
  done: 'Done',
  closed: 'Closed',
};

const STYLES: Record<PostStatus, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  backlog: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  planned:
    'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200',
  in_progress:
    'bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-200',
  done: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200',
  closed: 'bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200',
};

export function PostStatusBadge({
  status,
  className,
}: {
  status: PostStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium w-fit',
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}

export const ALL_POST_STATUSES = Object.keys(LABELS) as PostStatus[];
export const POST_STATUS_LABELS = LABELS;
