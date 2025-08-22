import { eq } from 'drizzle-orm';
import { getDatabase } from '@/server/db';
import { projects } from '@/db/schema';
import { and } from 'drizzle-orm';

export async function listProjects() {
  const { db } = getDatabase();
  return await db.select().from(projects).orderBy(projects.createdAt);
}

export async function listProjectsByUser(userId: string) {
  const { db } = getDatabase();
  return await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(projects.createdAt);
}

export async function getProjectById(id: string) {
  const { db } = getDatabase();
  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  return row;
}

export async function getProjectBySubdomain(subdomain: string) {
  const { db } = getDatabase();
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.subdomain, subdomain));
  return row;
}

export async function getProjectBySubdomainAndUser(subdomain: string, userId: string) {
  const { db } = getDatabase();
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.subdomain, subdomain), eq(projects.userId, userId)));
  return row;
}

export async function createProject(data: {
  name: string;
  subdomain: string;
  description?: string;
  userId: string;
}) {
  const { db } = getDatabase();
  const [row] = await db
    .insert(projects)
    .values({
      name: data.name,
      subdomain: data.subdomain,
      description: data.description,
      userId: data.userId,
    })
    .returning();
  return row;
}

export async function updateProject(
  id: string,
  data: Partial<{
    name: string;
    subdomain: string;
    description: string;
  }>
) {
  const { db } = getDatabase();
  const [row] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();
  return row;
}

export async function deleteProject(id: string) {
  const { db } = getDatabase();
  const [row] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning();
  return row;
}

export function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');
  if (parts.length < 2) return null;
  
  // Handle localhost development
  if (hostname.includes('localhost')) {
    if (parts.length === 2) return null; // localhost:3000
    if (parts.length === 3) return parts[0]; // demo.localhost:3000
  }
  
  // Handle production domains
  if (parts.length === 3) return parts[0]; // demo.openboards.co
  return null;
}

export async function getCurrentProjectFromHeaders(headers: Headers) {
  const host = headers.get('host');
  if (!host) return null;
  
  const subdomain = extractSubdomain(host);
  if (!subdomain) return null;
  
  return await getProjectBySubdomain(subdomain);
}
