'use server';

import { auth } from '@/server/auth';
import { Role } from '@/types/role';
import { headers } from 'next/headers';

const ROLE_RANK: Record<Role, number> = { member: 1, admin: 2, owner: 3 };

export async function hasMinRole(role: Role | undefined, min: Role) {
  return !!role && ROLE_RANK[role] >= ROLE_RANK[min];
}

export async function getSessionOrThrow() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error('Not authenticated');
  return { session, headers: h };
}

export async function requireOrg(orgSlug: string) {
  const { session, headers: h } = await getSessionOrThrow();
  const org = await auth.api.getFullOrganization({
    query: { organizationSlug: orgSlug },
    headers: h,
  });
  if (!org) throw new Error('Organization not found');
  return { headers: h, session, org };
}

export async function requireOrgAndRole(orgSlug: string, min: Role) {
  const ctx = await requireOrg(orgSlug);
  const me = ctx.org.members.find((m) => m.userId === ctx.session.user.id);
  const role = (me?.role as Role | undefined) || undefined;
  if (!hasMinRole(role, min)) throw new Error('Insufficient permissions');
  return { ...ctx, me, role };
}

export async function requireOrgOwner(orgSlug: string) {
  return requireOrgAndRole(orgSlug, 'owner');
}
