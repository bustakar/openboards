import { NextResponse, type NextRequest } from 'next/server';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
const CUSTOM_DOMAINS = process.env.NEXT_PUBLIC_CUSTOM_DOMAINS || 'off';

function getOrgFromHost(host: string | null): string | null {
  if (!host || !ROOT) return null;

  const [hostname] = host.split(':');
  const [rootHostname] = ROOT.split(':');

  if (!hostname.endsWith(rootHostname)) return null;
  const sub = hostname.slice(0, -(rootHostname.length + 1));
  if (!sub || sub === 'www') return null;
  const org = sub.split('.')[0];
  return org;
}

async function getOrgFromCustomDomain(
  req: NextRequest
): Promise<string | null> {
  if (CUSTOM_DOMAINS !== 'vercel') return null;
  const host = req.headers.get('host');
  if (!host) return null;
  const hostname = host.split(':')[0];

  if (ROOT && (hostname === ROOT || hostname.endsWith('.' + ROOT))) {
    return null;
  }

  try {
    const url = req.nextUrl.clone();
    url.pathname = '/api/resolve-host';
    url.search = `?host=${encodeURIComponent(hostname)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { found: boolean; orgSlug?: string };
    if (data.found && data.orgSlug) return data.orgSlug;
  } catch {}
  return null;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const orgSub = getOrgFromHost(req.headers.get('host'));
  const org = orgSub || (await getOrgFromCustomDomain(req));

  if (!org) {
    return NextResponse.next();
  }

  const pathname = url.pathname;

  if (pathname === '/feedback') {
    url.pathname = `/${org}/feedback`;
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith('/dashboard/organization')) {
    return NextResponse.next();
  }

  if (pathname === '/dashboard') {
    url.pathname = `/dashboard/${org}/feedback`;
    return NextResponse.rewrite(url);
  }

  if (pathname === '/dashboard/feedback') {
    url.pathname = `/dashboard/${org}/feedback`;
    return NextResponse.rewrite(url);
  }

  if (pathname === '/dashboard/settings') {
    url.pathname = `/dashboard/${org}/settings`;
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith('/dashboard/')) {
    const rest = pathname.replace('/dashboard/', '');
    if (!rest.startsWith(`${org}/`)) {
      url.pathname = `/dashboard/${org}/${rest}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|static/|favicon.ico|robots.txt|sitemap.xml|api/).*)'],
};
