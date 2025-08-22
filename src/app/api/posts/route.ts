import { authOptions } from '@/server/auth/options';
import { checkAndRecordLimit } from '@/lib/rateLimit';
import { createPost, listPosts } from '@/server/repos/posts';
import {
  createPostSchema,
  sanitizeBody,
  sanitizeTitle,
} from '@/server/validation';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Get user ID from session
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const boardIdParam = searchParams.get('boardId');
  const boardId = boardIdParam || undefined;
  const projectId = searchParams.get('project');
  const sort = searchParams.get('sort') || 'trending';
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id_required' }, { status: 400 });
  }

  try {
    const data = await listPosts({
      boardId,
      projectId,
      sort: sort as 'trending' | 'new' | 'top',
      limit,
    });

    // Transform the data to include board name
    const postsWithBoardName = data.items.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      boardName: post.board?.name || 'Unknown Board',
    }));

    return NextResponse.json({
      items: postsWithBoardName,
      total: data.total,
      hasMore: data.hasMore,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip =
    (
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      ''
    ).split(',')[0] || 'unknown';

  const cookies = request.headers.get('cookie') || '';
  const visitorId = parseCookie(cookies, 'visitorId') || ip;

  const burst = checkAndRecordLimit(`post:${visitorId}`, 5, 60_000);
  const sustained = checkAndRecordLimit(
    `post-hour:${visitorId}`,
    20,
    60 * 60_000
  );
  if (!burst.allowed || !sustained.allowed)
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  try {
    const body = await request.json();
    const validated = createPostSchema.parse(body);

    // Honeypot check
    if (validated._hpt) {
      return NextResponse.json({ error: 'spam_detected' }, { status: 400 });
    }

    const sanitizedTitle = sanitizeTitle(validated.title);
    const sanitizedBody = validated.body ? sanitizeBody(validated.body) : null;

    const post = await createPost({
      boardId: validated.boardId,
      title: sanitizedTitle,
      body: sanitizedBody || undefined,
      slug: sanitizedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80),
    });

    return NextResponse.json({ slug: post.slug });
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: 'validation_error' }, { status: 400 });
    }
    console.error('post creation failed', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

function parseCookie(header: string, name: string) {
  const m = header.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
