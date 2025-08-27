import { posts } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);
  if (!project) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 });
  }

  const { db } = getDatabase();

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      voteCount: posts.voteCount,
      commentCount: posts.commentCount,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(eq(posts.projectId, project.id))
    .orderBy(desc(posts.voteCount), desc(posts.createdAt));

  return NextResponse.json(rows);
}
