import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export type BoardItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  posts?: number;
};

export function BoardsList({ boards }: { boards: BoardItem[] }) {
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
                  className="block rounded-md border p-3 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{b.name}</div>
                      {b.description ? (
                        <div className="text-xs text-muted-foreground line-clamp-2">{b.description}</div>
                      ) : null}
                    </div>
                    {typeof b.posts === "number" ? (
                      <div className="text-xs text-muted-foreground">{b.posts} posts</div>
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


