import { auth } from '@/lib/auth';
import { createProject, listProjectsByUser } from '@/server/repos/projects/projects';
import { getAccess } from '@/server/security/access';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const userId = session.user.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }
  const projects = await listProjectsByUser(userId);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const userId = session.user.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
    }
    const body = await request.json();
    const { name, subdomain, description } = body;

    if (!name || !subdomain) {
      return NextResponse.json(
        { error: 'missing_required_fields' },
        { status: 400 }
      );
    }

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return NextResponse.json({ error: 'invalid_subdomain' }, { status: 400 });
    }

    // Access control & limits
    const accessInfo = await getAccess();
    if (!accessInfo || accessInfo.userId !== userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (!accessInfo.access.canWrite) {
      return NextResponse.json({ error: 'read_only' }, { status: 402 });
    }
    if (process.env.ENABLE_STRIPE_BILLING === 'true') {
      const existing = await listProjectsByUser(userId);
      if (existing.length >= accessInfo.access.maxProjects) {
        return NextResponse.json({ error: 'project_limit_reached' }, { status: 402 });
      }
    }

    const project = await createProject({
      name,
      subdomain,
      description,
      userId,
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
