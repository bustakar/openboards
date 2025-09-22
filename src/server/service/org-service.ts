'use server';

import { db } from '@/db';
import { organization } from '@/db/auth-schema';
import { requireOrgOwner } from '@/server/service/auth-service';
import { OrganizationMetadata } from '@/types/organization';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function saveOrganizationSettingsAction(
  orgSlug: string,
  metadata: OrganizationMetadata
) {
  const slugSchema = z.string().min(1);
  const metadataSchema = z.object({
    public: z.object({
      postBadgeVisibility: z.array(z.string()),
      defaultStatusVisible: z.array(z.string()),
    }),
  });
  const slugParsed = slugSchema.parse(orgSlug);
  const metadataParsed = metadataSchema.parse(metadata);
  const { org } = await requireOrgOwner(slugParsed);

  await db
    .update(organization)
    .set({ metadata: JSON.stringify(metadataParsed) })
    .where(eq(organization.id, org.id));

  revalidatePath(`/dashboard/${slugParsed}/settings`);
}
