'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PostStatus } from '@/db/schema';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ALL_POST_STATUSES, POST_STATUS_LABELS } from './post-status-badge';

const STATUS_DOT: Record<PostStatus, string> = {
  open: 'bg-blue-500',
  backlog: 'bg-gray-400 dark:bg-gray-500',
  planned: 'bg-amber-500',
  in_progress: 'bg-violet-500',
  done: 'bg-emerald-500',
  closed: 'bg-rose-500',
};

export function PostsListFilterButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = useMemo(() => {
    const raw = searchParams.get('statuses') || '';
    const list = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as PostStatus[];
    return new Set(list);
  }, [searchParams]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<PostStatus>>(initial);

  const toggleStatus = (value: PostStatus) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selected.size === 0) params.delete('statuses');
    else params.set('statuses', Array.from(selected).join(','));
    router.replace(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const clear = () => {
    setSelected(new Set());
  };
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-10 h-9 p-0">
          <Filter className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {ALL_POST_STATUSES.map((s) => (
          <DropdownMenuCheckboxItem
            key={s}
            checked={selected.has(s)}
            onCheckedChange={() => toggleStatus(s)}
            // Keep dropdown open when toggling items
            onSelect={(e) => e.preventDefault()}
          >
            <span className="inline-flex items-center gap-2">
              <span
                className={cn(
                  'inline-block size-2 rounded-full',
                  STATUS_DOT[s]
                )}
              />
              {POST_STATUS_LABELS[s]}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
        <div className="border-t mt-1 pt-1 flex items-center justify-between gap-2 px-1">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
