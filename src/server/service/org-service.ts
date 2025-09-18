'use server';

import { db } from '@/db';
import { organization } from '@/db/auth-schema';
import { auth } from '@/server/auth';
import { OrganizationMetadata } from '@/types/organization';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

type Role = 'owner' | 'admin' | 'member';

function hasMinRole(role: Role | undefined, min: Role) {
  const rank: Record<Role, number> = { member: 1, admin: 2, owner: 3 };
  return !!role && rank[role] >= rank[min];
}

async function requireOwner(orgSlug: string) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error('Not authenticated');

  const fullOrg = await auth.api.getFullOrganization({
    query: { organizationSlug: orgSlug },
    headers: h,
  });
  if (!fullOrg) throw new Error('Organization not found');

  const me = fullOrg.members.find((m) => m.userId === session.user.id);
  if (!hasMinRole(me?.role as Role | undefined, 'member')) {
    throw new Error('Insufficient permissions');
  }
  return fullOrg.slug!;
}

export async function saveOrganizationSettingsAction(
  orgSlug: string,
  metadata: OrganizationMetadata
) {
  const slug = await requireOwner(orgSlug);

  const row = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
    columns: { id: true, metadata: true },
  });
  if (!row) throw new Error('Organization not found');

  await db
    .update(organization)
    .set({ metadata: JSON.stringify(metadata) })
    .where(eq(organization.id, row.id));

  revalidatePath(`/dashboard/${slug}/settings`);
}
