import { db } from '@/db';
import { organization } from '@/db/auth-schema';
import { eq } from 'drizzle-orm';

export async function getOrganizationById(id: string) {
  return db.query.organization.findFirst({
    where: eq(organization.id, id),
    columns: { id: true, name: true, slug: true },
  });
}

export async function getOrganizationBySlug(slug: string) {
  console.log('getOrganizationBySlug', slug);
  return db.query.organization.findFirst({
    where: eq(organization.slug, slug),
    columns: { id: true, name: true, slug: true },
  });
}
