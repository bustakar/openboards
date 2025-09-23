import { db } from '@/db';
import { organization } from '@/db/auth-schema';
import {
  DEFAULT_ORG_SETTINGS,
  OrganizationMetadata,
} from '@/types/organization';
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
    columns: { id: true, name: true, slug: true, metadata: true },
  });
}

export async function getOrganizationByCustomDomain(domain: string) {
  return db.query.organization.findFirst({
    where: eq(organization.customDomain, domain),
    columns: { id: true, name: true, slug: true, metadata: true },
  });
}

export async function getOrganizationSettingsBySlug(
  slug: string
): Promise<OrganizationMetadata> {
  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
    columns: { metadata: true },
  });
  if (!org?.metadata) return DEFAULT_ORG_SETTINGS;
  try {
    return JSON.parse(org.metadata) as OrganizationMetadata;
  } catch {
    return DEFAULT_ORG_SETTINGS;
  }
}

export async function getOrganizationPublicSettingsBySlug(
  slug: string
): Promise<OrganizationMetadata['public']> {
  const full = await getOrganizationSettingsBySlug(slug);
  return full.public;
}
