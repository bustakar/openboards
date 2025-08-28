import { updateComment } from '@/server/repos/comments/comments';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
    // Extract commentId from URL path
    const pathSegments = request.nextUrl.pathname.split('/');
    const commentId = pathSegments[pathSegments.length - 1];

    const body = await request.json();
    const { isArchived } = body;

    if (typeof isArchived !== 'boolean') {
      return NextResponse.json(
        { error: 'isArchived_required' },
        { status: 400 }
      );
    }

    const updatedComment = await updateComment(commentId, { isArchived }, userId);

    if (!updatedComment) {
      return NextResponse.json({ error: 'comment_not_found' }, { status: 404 });
    }

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
