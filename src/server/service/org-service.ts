'use server';

import { db } from '@/db';
import { organization } from '@/db/auth-schema';
import { OrganizationMetadata } from '@/types/organization';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireOrgOwner } from '@/server/service/auth-service';

export async function saveOrganizationSettingsAction(
  orgSlug: string,
  metadata: OrganizationMetadata
) {
  const { org } = await requireOrgOwner(orgSlug);

  await db
    .update(organization)
    .set({ metadata: JSON.stringify(metadata) })
    .where(eq(organization.id, org.id));

  revalidatePath(`/dashboard/${org.slug}/settings`);
}
