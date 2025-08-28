import { posts } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { updatePost } from '@/server/repos/posts/posts';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = decodeURIComponent(request.nextUrl.pathname.split('/')[3] ?? '');
  const { db } = getDatabase();
  const row = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (row.length === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const userId = session.user.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  try {
    // Extract post ID from URL path
    const id = decodeURIComponent(request.nextUrl.pathname.split('/')[3] ?? '');

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'status_required' }, { status: 400 });
    }

    const updatedPost = await updatePost(id, { status }, userId);

    if (!updatedPost) {
      return NextResponse.json({ error: 'post_not_found' }, { status: 404 });
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
