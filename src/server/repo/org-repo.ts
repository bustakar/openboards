import { db } from '@/db';
import { organization } from '@/db/auth-schema';
import { eq } from 'drizzle-orm';

export async function getOrganizationById(id: string) {
  return db.query.organization.findFirst({
    where: eq(organization.id, id),
    columns: { id: true, name: true, slug: true, customDomain: true },
  });
}

export async function getOrganizationBySlug(slug: string) {
  return db.query.organization.findFirst({
    where: eq(organization.slug, slug),
    columns: { id: true, name: true, slug: true, customDomain: true },
  });
}

export async function getOrganizationByCustomDomain(domain: string) {
  return db.query.organization.findFirst({
    where: eq(organization.customDomain, domain),
    columns: { id: true, name: true, slug: true, customDomain: true },
  });
}
