import { projects } from '@/db/schema';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/server/db';
import { updateProjectSchema } from '@/server/repos/projects/validation';
import { getAccess } from '@/server/security/access';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const userId = (session.user.id as string) || '';
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  if (!projectId)
    return NextResponse.json({ error: 'project_id_required' }, { status: 400 });

  const { db } = getDatabase();
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    customDomain: row.customDomain,
    customDomainVerified: row.customDomainVerified,
    customDomainCheckedAt: row.customDomainCheckedAt,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const userId = (session.user.id as string) || '';
  const body = await request.json();
  const { projectId, customDomain } = body ?? {};
  if (!projectId)
    return NextResponse.json({ error: 'project_id_required' }, { status: 400 });

  const accessInfo = await getAccess();
  if (!accessInfo || accessInfo.userId !== userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!accessInfo.access.canWrite) {
    return NextResponse.json({ error: 'read_only' }, { status: 402 });
  }

  // Validate format
  const parsed = updateProjectSchema
    .pick({ customDomain: true })
    .safeParse({ customDomain });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_custom_domain' },
      { status: 400 }
    );
  }

  const normalized = (customDomain as string | null)?.toLowerCase() ?? null;

  const { db } = getDatabase();

  // Ensure uniqueness (null allowed)
  if (normalized) {
    const [dupe] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.customDomain, normalized))
      .limit(1);
    if (dupe)
      return NextResponse.json({ error: 'domain_in_use' }, { status: 409 });
  }

  const [row] = await db
    .update(projects)
    .set({
      customDomain: normalized,
      customDomainVerified: false,
      customDomainCheckedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning();
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    customDomain: row.customDomain,
    customDomainVerified: row.customDomainVerified,
    customDomainCheckedAt: row.customDomainCheckedAt,
  });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const userId = (session.user.id as string) || '';
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  if (!projectId)
    return NextResponse.json({ error: 'project_id_required' }, { status: 400 });
  const { db } = getDatabase();
  const [row] = await db
    .update(projects)
    .set({
      customDomain: null,
      customDomainVerified: false,
      customDomainCheckedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning();
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
