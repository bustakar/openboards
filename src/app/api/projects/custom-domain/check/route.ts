import { projects } from '@/db/schema';
import { auth } from '@/lib/auth';
import { checkDomainCNAME } from '@/lib/dns';
import { addDomainToVercelProject, getVercelProjectDomain } from '@/lib/vercel';
import { getDatabase } from '@/server/db';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const userId = (session.user.id as string) || '';
  const body = await request.json();
  const { projectId } = body ?? {};
  if (!projectId)
    return NextResponse.json({ error: 'project_id_required' }, { status: 400 });

  const { db } = getDatabase();
  const [proj] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!proj) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!proj.customDomain)
    return NextResponse.json({ error: 'no_custom_domain' }, { status: 400 });

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'openboards.co';
  const expected = `${proj.subdomain}.${root}`; // Expect CNAME to the project's subdomain

  // Try Vercel API first (if configured)
  await addDomainToVercelProject(proj.customDomain);
  const vercel = await getVercelProjectDomain(proj.customDomain);
  let valid = false;
  if (vercel && typeof vercel === 'object') {
    // If Vercel returns a config or ownership, treat as valid
    valid = true;
  } else {
    // Fallback DNS CNAME check
    const check = await checkDomainCNAME(proj.customDomain, expected);
    valid = check.valid;
  }

  const [updated] = await db
    .update(projects)
    .set({
      customDomainVerified: valid,
      customDomainCheckedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, proj.id))
    .returning();

  return NextResponse.json({
    customDomain: updated.customDomain,
    customDomainVerified: updated.customDomainVerified,
    customDomainCheckedAt: updated.customDomainCheckedAt,
  });
}
