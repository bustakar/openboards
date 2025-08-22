import { projects } from '@/db/schema';
import { extractSubdomain } from '@/lib/utils';
import { getDatabase } from '@/server/db';
import { and, eq } from 'drizzle-orm';

export async function listProjectsByUser(userId: string) {
  const { db } = getDatabase();
  return await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(projects.createdAt);
}

export async function getProjectBySubdomain(subdomain: string) {
  const { db } = getDatabase();
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.subdomain, subdomain))
    .limit(1);
  return row ?? null;
}

export async function createProject(data: {
  name: string;
  subdomain: string;
  description?: string;
  userId: string;
}) {
  const { db } = getDatabase();

  // Validate subdomain format (lowercase letters and hyphens only)
  if (!/^[a-z0-9-]+$/.test(data.subdomain)) {
    throw new Error(
      'Subdomain must contain only lowercase letters, numbers, and hyphens'
    );
  }

  // Check if subdomain already exists
  const [existingProject] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.subdomain, data.subdomain))
    .limit(1);

  if (existingProject) {
    throw new Error('Subdomain already exists');
  }

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
  userId: string,
  data: Partial<{
    name: string;
    subdomain: string;
    description: string;
  }>
) {
  const { db } = getDatabase();

  // Check if project exists and user owns it
  const [existingProject] = await db
    .select({ id: projects.id, subdomain: projects.subdomain })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);

  if (!existingProject) {
    throw new Error('Project not found or access denied');
  }

  // If subdomain is being updated, validate format and uniqueness
  if (data.subdomain && data.subdomain !== existingProject.subdomain) {
    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(data.subdomain)) {
      throw new Error(
        'Subdomain must contain only lowercase letters, numbers, and hyphens'
      );
    }

    // Check if new subdomain already exists
    const [duplicateProject] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.subdomain, data.subdomain))
      .limit(1);

    if (duplicateProject) {
      throw new Error('Subdomain already exists');
    }
  }

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

export async function deleteProject(id: string, userId: string) {
  const { db } = getDatabase();

  // Check if project exists and user owns it
  const [existingProject] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);

  if (!existingProject) {
    throw new Error('Project not found or access denied');
  }

  // TODO: Add cascade deletion for boards, posts, comments, votes
  // For now, just delete the project
  const [row] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning();
  return row;
}

export async function getCurrentProjectFromHeaders(headers: Headers) {
  const host = headers.get('host');
  if (!host) return null;

  const subdomain = extractSubdomain(host);
  if (!subdomain) return null;

  return await getProjectBySubdomain(subdomain);
}
