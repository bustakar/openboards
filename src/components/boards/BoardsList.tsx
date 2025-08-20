import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import * as React from 'react';

export type BoardItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  posts?: number;
};

export function BoardsList({
  boards,
  selectedSlug,
}: {
  boards: BoardItem[];
  selectedSlug?: string;
}) {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Boards
        </h3>
      </div>
      <ScrollArea className="max-h-[70vh]">
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              aria-current={selectedSlug ? undefined : 'page'}
              className={
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ` +
                (!selectedSlug
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50')
              }
            >
              <span className="text-lg">📋</span>
              <span className="font-medium">View all posts</span>
            </Link>
          </li>
          {boards.map((b) => (
            <li key={b.id}>
              <Link
                href={`/b/${b.slug}`}
                aria-current={selectedSlug === b.slug ? 'page' : undefined}
                className={
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ` +
                  (selectedSlug === b.slug
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50')
                }
              >
                <span className="text-lg">{b.icon || '📄'}</span>
                <span className="font-medium">{b.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
