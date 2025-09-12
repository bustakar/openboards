import { NextResponse, type NextRequest } from 'next/server';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

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

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const org = getOrgFromHost(req.headers.get('host'));

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
