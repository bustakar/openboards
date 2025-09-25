import { rootDomain } from '@/lib/utils';
import { type NextRequest, NextResponse } from 'next/server';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  const rootDomainFormatted = rootDomain.split(':')[0];

  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

async function getOrgSlugFromCustomDomain(domain: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/resolve-host?host=${domain}`
  );
  const data = await response.json();
  return data.orgSlug;
}

export async function middleware(request: NextRequest) {
  const { host, pathname, searchParams } = request.nextUrl;
  let subdomain = null;
  if (!host.endsWith(process.env.NEXT_PUBLIC_ROOT_DOMAIN as string)) {
    subdomain = await getOrgSlugFromCustomDomain(host);
  } else {
    subdomain = extractSubdomain(request);
  }

  if (subdomain && pathname === '/feedback') {
    const rewriteUrl = new URL(
      `/${subdomain}${pathname}?${searchParams.toString()}`,
      request.url
    );
    return NextResponse.rewrite(rewriteUrl);
  } else if (subdomain) {
    const redirectUrl = new URL(
      `/feedback?${searchParams.toString()}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  // On the root domain, allow normal access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)',
  ],
};
