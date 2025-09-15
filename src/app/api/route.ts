import { getOrganizationByCustomDomain } from '@/server/repo/org-repo';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if ((process.env.NEXT_PUBLIC_CUSTOM_DOMAINS || 'off') !== 'vercel') {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  const url = new URL(req.url);
  const hostParam = url.searchParams.get('host');
  const raw =
    hostParam || req.headers.get('x-host') || req.headers.get('host') || '';
  const hostname = raw.split(':')[0].toLowerCase();

  // ignore root domain hosts here; middleware handles subdomains separately
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || '';
  if (root && (hostname === root || hostname.endsWith('.' + root))) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  const org = await getOrganizationByCustomDomain(hostname);
  if (!org?.slug) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  return NextResponse.json({ found: true, orgSlug: org.slug });
}
