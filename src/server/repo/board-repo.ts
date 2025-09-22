import { db } from '@/db';
import { board } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOrganizationBySlug } from './org-repo';

export async function getBoardById(id: string) {
  return db.query.board.findFirst({
    where: eq(board.id, id),
  });
}

export async function getBoardByOrgSlug(slug: string) {
  const org = await getOrganizationBySlug(slug);
  if (!org) return null;
  return db.query.board.findFirst({
    where: eq(board.organizationId, org.id),
  });
}

export async function getBoardsByOrgId(orgId: string) {
  return db.query.board.findMany({
    where: eq(board.organizationId, orgId),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
}

export async function getBoardsByOrgSlug(slug: string) {
  const org = await getOrganizationBySlug(slug);
  if (!org) return [];
  return db.query.board.findMany({
    where: eq(board.organizationId, org.id),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
}
