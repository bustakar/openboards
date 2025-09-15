'use server';

import { db } from '@/db';
import { organization } from '@/db/auth-schema';
import { auth } from '@/server/auth';
import { getCustomDomainAdapter } from '@/server/custom-domain/custom-domain-provider';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

type Role = 'owner' | 'admin' | 'member';

function hasMinRole(role: Role | undefined, min: Role) {
  const rank: Record<Role, number> = { member: 1, admin: 2, owner: 3 };
  return !!role && rank[role] >= rank[min];
}

async function requireOrgAndRole(orgSlug: string, min: Role) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error('Not authenticated');

  const fullOrg = await auth.api.getFullOrganization({
    query: { organizationSlug: orgSlug },
    headers: h,
  });
  if (!fullOrg) throw new Error('Organization not found');

  const me = fullOrg.members.find((m) => m.userId === session.user.id);
  const role = me?.role as Role | undefined;
  if (!hasMinRole(role, min)) throw new Error('Insufficient permissions');

  return { h, org: fullOrg };
}

function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '');
  d = d.replace(/\/.*$/, '');
  d = d.replace(/\.$/, '');
  return d;
}

export async function checkCustomDomainAction(input: { domain: string }) {
  const domain = normalizeDomain(input.domain);
  if (!domain) throw new Error('Enter a domain');
  const adapter = getCustomDomainAdapter();
  await adapter.add(domain);
  const cfg = await adapter.getConfig(domain);

  const recommended = cfg.recommendations || cfg.records || [];
  const apexA =
    recommended.find?.((r) => r.type === 'A')?.value || '76.76.21.21';

  return {
    domain,
    configuredBy: cfg.configuredBy || 'unknown',
    misconfigured: !!cfg.misconfigured,
    recommendations: recommended,
    tips: {
      subdomain: 'Use CNAME to cname.vercel-dns.com',
      apex: `Use ALIAS/ANAME to cname.vercel-dns.com or A to ${apexA}`,
    },
  };
}

export async function saveCustomDomainAction(input: {
  orgSlug: string;
  domain: string;
}) {
  const { org } = await requireOrgAndRole(input.orgSlug, 'owner');
  const domain = normalizeDomain(input.domain);
  if (!domain) throw new Error('Enter a domain');

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
  if (!domain) throw new Error('Enter a domain');

  const adapter = getCustomDomainAdapter();
  const res = await adapter.verify(domain);
  return { domain, verified: !!res.verified, provider: res.raw };
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
