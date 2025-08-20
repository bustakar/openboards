import { checkAndRecordLimit } from '@/server/rateLimit';
import { createPost } from '@/server/repos/posts';
import { createPostSchema, sanitizeBody, sanitizeTitle } from '@/server/validation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ip = (
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
      body: sanitizedBody,
    });

    return NextResponse.json({ slug: post.slug });
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: 'validation_error' }, { status: 400 });
    }
    console.error('post creation failed', error);
    return NextResponse.json(
      { error: 'internal_error' },
      { status: 500 }
    );
  }
}

function parseCookie(header: string, name: string) {
  const m = header.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
