'use server';

import { db } from '@/db';
import { organization } from '@/db/auth-schema';
import { getCustomDomainAdapter } from '@/server/custom-domain/custom-domain-provider';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireOrgAndRole } from './auth-service';

function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '');
  d = d.replace(/\/.*$/, '');
  d = d.replace(/\.$/, '');
  return d;
}

export async function saveCustomDomainAction(input: {
  orgSlug: string;
  domain: string;
}) {
  const { org } = await requireOrgAndRole(input.orgSlug, 'owner');
  const domain = normalizeDomain(input.domain);
  if (!domain) throw new Error('Enter a valid domain');

  const adapter = getCustomDomainAdapter();
  await adapter.add(domain);

  await db
    .update(organization)
    .set({ customDomain: domain })
    .where(eq(organization.id, org.id));

  revalidatePath(`/dashboard/${input.orgSlug}/settings`);
  return { domain };
}

export async function verifyCustomDomainAction(input: {
  orgSlug: string;
  domain: string;
}) {
  await requireOrgAndRole(input.orgSlug, 'owner');
  const domain = normalizeDomain(input.domain);
  if (!domain) throw new Error('Enter a valid domain');

  const adapter = getCustomDomainAdapter();
  return await adapter.verify(domain);
}

export async function removeCustomDomainAction(input: { orgSlug: string }) {
  const { org } = await requireOrgAndRole(input.orgSlug, 'owner');

  const row = await db.query.organization.findFirst({
    where: eq(organization.id, org.id),
    columns: { customDomain: true },
  });
  const domain = row?.customDomain || null;

  await db
    .update(organization)
    .set({ customDomain: null })
    .where(eq(organization.id, org.id));

  if (domain) {
    const adapter = getCustomDomainAdapter();
    await adapter.remove(domain);
  }

  revalidatePath(`/dashboard/${input.orgSlug}/settings`);
}
