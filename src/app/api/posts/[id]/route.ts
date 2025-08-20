import { posts } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Path: /api/posts/[id] -> ['', 'api', 'posts', '[id]']
  const id = decodeURIComponent(request.nextUrl.pathname.split('/')[3] ?? '');
  const { db } = getDatabase();
  const [row] = await db
    .select({
      id: posts.id,
      boardId: posts.boardId,
      title: posts.title,
      slug: posts.slug,
      body: posts.body,
      status: posts.status,
      voteCount: posts.voteCount,
      commentCount: posts.commentCount,
      pinned: posts.pinned,
      isArchived: posts.isArchived,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      lastActivityAt: posts.lastActivityAt,
    })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}
