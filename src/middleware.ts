import { NextResponse, type NextRequest } from 'next/server';

function generateId(length = 24) {
  // Simple URL-safe random id
  const alphabet =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
  let id = '';
  const random = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) id += alphabet[random[i] % alphabet.length];
  return id;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Skip static files and Next internals
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets')
  ) {
    return response;
  }

  const cookieName = 'visitorId';
  const existing = request.cookies.get(cookieName)?.value;
  if (!existing) {
    const id = generateId();
    response.cookies.set(cookieName, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
      path: '/',
    });
  }

  // Subdomain detection and routing
  const host = request.headers.get('host') || '';
  const withoutPort = host.split(':')[0] ?? host;
  const root = process.env.ROOT_DOMAIN || 'openboards.co';
  const isApex = withoutPort === root || withoutPort === `www.${root}`;
  const isLocal =
    withoutPort === 'localhost' || withoutPort.endsWith('.localhost');

  // Extract subdomain
  let subdomain: string | null = null;
  if (!isApex && !isLocal && withoutPort.endsWith(`.${root}`)) {
    subdomain = withoutPort.replace(`.${root}`, '');
  } else if (isLocal && withoutPort.includes('.')) {
    subdomain = withoutPort.split('.')[0];
  }

  // Handle apex domain redirect to app subdomain
  if (isApex || (isLocal && !subdomain)) {
    const appUrl = new URL(request.url);
    if (isLocal) {
      appUrl.hostname = `app.localhost`;
    } else {
      appUrl.hostname = `app.${root}`;
    }
    return NextResponse.redirect(appUrl);
  }

  // Handle app subdomain routing (allow through; route guards handled in layouts/routes)

  // Handle project subdomain routing (rewrite to public route group)
  if (subdomain && subdomain !== 'app') {
    response.headers.set('x-openboards-subdomain', subdomain);

    // Rewrite URLs to the public route group
    // For project subdomains, we want to serve the public pages
    const publicUrl = new URL(request.url);
    if (pathname === '/') {
      // Root path should go to the public homepage
      publicUrl.pathname = '/';
    } else {
      // Other paths should go to the public route group
      publicUrl.pathname = pathname;
    }
    return NextResponse.rewrite(publicUrl);
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
