import { NextResponse, type NextRequest } from 'next/server';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

export const getOrgFromHost = (host?: string | null) => {
  let subdomain: string | null = null;
  if (!host && typeof window !== 'undefined') {
    host = window.location.host;
  }
  if (host && host.includes('.')) {
    const candidate = host.split('.')[0];
    if (candidate && !candidate.includes('localhost')) {
      subdomain = candidate;
    }
  }
  return subdomain;
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const org = getOrgFromHost(req.headers.get('host'));

  if (!org) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith('/dashboard')) {
    url.pathname = `/dashboard/${org}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  url.pathname = `/${org}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/|static/|favicon.ico|robots.txt|sitemap.xml|api/).*)'],
};
