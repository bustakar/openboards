import { checkAndRecordLimit } from '@/lib/rateLimit';
import { createComment } from '@/server/repos/comments/comments';
import { createCommentSchema } from '@/server/repos/comments/validation';
import { sanitizeBody } from '@/server/repos/posts/validation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ip =
    (
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      ''
    ).split(',')[0] || 'unknown';
  const cookies = request.headers.get('cookie') || '';
  const visitorId = parseCookie(cookies, 'visitorId') || ip;

  const burst = checkAndRecordLimit(`comment:${visitorId}`, 3, 60_000);
  const sustained = checkAndRecordLimit(
    `comment-hour:${visitorId}`,
    30,
    60 * 60_000
  );
  if (!burst.allowed || !sustained.allowed)
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const input = await request.json().catch(() => ({}));
  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  if (parsed.data._hpt) return NextResponse.json({ ok: true }, { status: 204 });

  const body = sanitizeBody(parsed.data.body);
  const id = decodeURIComponent(request.nextUrl.pathname.split('/')[3] ?? '');
  try {
    const created = await createComment({
      postId: id,
      visitorId,
      authorName: parsed.data.authorName,
      body,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('create comment failed', message);
    return NextResponse.json(
      { error: 'internal_error', message },
      { status: 500 }
    );
  }
}

function parseCookie(header: string, name: string) {
  const m = header.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
