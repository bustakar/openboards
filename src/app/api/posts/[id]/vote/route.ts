import { checkAndRecordLimit } from '@/lib/rateLimit';
import { toggleVote } from '@/server/repos/votes';
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

  const burst = checkAndRecordLimit(`vote:${visitorId}`, 10, 60_000);
  const sustained = checkAndRecordLimit(
    `vote-hour:${visitorId}`,
    100,
    60 * 60_000
  );
  if (!burst.allowed || !sustained.allowed)
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const id = decodeURIComponent(request.nextUrl.pathname.split('/')[3] ?? '');
  try {
    const result = await toggleVote(id, visitorId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('vote toggle failed', message);
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
