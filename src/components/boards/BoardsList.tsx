import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import * as React from 'react';

export type BoardItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  posts?: number;
};

export function BoardsList({ boards, selectedSlug }: { boards: BoardItem[]; selectedSlug?: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Boards</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[70vh]">
          <ul className="space-y-2">
            {boards.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/b/${b.slug}`}
                  aria-current={selectedSlug === b.slug ? "page" : undefined}
                  className={
                    `block rounded-md border p-3 transition-colors ` +
                    (selectedSlug === b.slug ? "bg-muted/70 border-foreground/30" : "hover:bg-muted/60")
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{b.name}</div>
                      {b.description ? (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {b.description}
                        </div>
                      ) : null}
                    </div>
                    {typeof b.posts === 'number' ? (
                      <div className="text-xs text-muted-foreground">
                        {b.posts} posts
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
