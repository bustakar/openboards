import { NextResponse, type NextRequest } from "next/server";

function generateId(length = 24) {
  // Simple URL-safe random id
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
  let id = "";
  const random = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) id += alphabet[random[i] % alphabet.length];
  return id;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Skip static files and Next internals
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public")
  ) {
    return response;
  }

  const cookieName = "visitorId";
  const existing = request.cookies.get(cookieName)?.value;
  if (!existing) {
    const id = generateId();
    response.cookies.set(cookieName, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};


