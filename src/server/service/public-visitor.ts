'use server';

import { cookies } from 'next/headers';

const COOKIE = 'ob_visitor_id';

export async function getVisitorId() {
  const c = await cookies();
  return c.get(COOKIE)?.value || null;
}

export async function getOrSetVisitorId() {
  const c = await cookies();
  let id = c.get(COOKIE)?.value;
  if (!id) {
    id = crypto.randomUUID();
    c.set(COOKIE, id, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 5,
    });
  }
  return id;
}
