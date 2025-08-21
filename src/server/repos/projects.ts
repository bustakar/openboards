import { projects } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function listProjects() {
  const { db } = getDatabase();
  return db.select().from(projects).orderBy(projects.createdAt);
}

export async function getProjectById(id: string) {
  const { db } = getDatabase();
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return row ?? null;
}

export async function getProjectBySubdomain(sub: string) {
  const { db } = getDatabase();
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.subdomain, sub))
    .limit(1);
  return row ?? null;
}

export async function createProject(params: {
  name: string;
  subdomain: string;
  description?: string | null;
}) {
  const { db } = getDatabase();
  const [row] = await db
    .insert(projects)
    .values({
      name: params.name,
      subdomain: params.subdomain,
      description: params.description ?? null,
    })
    .returning();
  return row;
}

export async function updateProject(
  id: string,
  params: { name?: string; subdomain?: string; description?: string | null }
) {
  const { db } = getDatabase();
  const [row] = await db
    .update(projects)
    .set(params)
    .where(eq(projects.id, id))
    .returning();
  return row ?? null;
}

export async function deleteProject(id: string) {
  const { db } = getDatabase();
  await db.delete(projects).where(eq(projects.id, id));
}

export function extractSubdomain(host: string): string | null {
  if (!host) return null;
  const withoutPort = host.split(':')[0] ?? host;
  // Local dev patterns: sub.localhost, sub.lvh.me
  if (withoutPort.endsWith('.localhost')) {
    const parts = withoutPort.split('.');
    if (parts.length >= 2) return parts[0];
    return null;
  }
  if (withoutPort.endsWith('.lvh.me')) {
    const parts = withoutPort.split('.');
    if (parts.length >= 3) return parts[0];
    return null;
  }
  const root = process.env.ROOT_DOMAIN || 'openboards.co';
  if (withoutPort === root || withoutPort === `www.${root}`) return null;
  if (withoutPort.endsWith(`.${root}`)) {
    const parts = withoutPort.split('.');
    if (parts.length >= 3) return parts[0];
  }
  return null;
}

export async function getCurrentProjectFromHeaders() {
  const h = await headers();
  const host = h.get?.('host') ?? '';
  const sub = extractSubdomain(host);
  if (!sub) return null;
  return getProjectBySubdomain(sub);
}
