import { authOptions } from '@/server/auth/options';
import { listProjectsByUser, createProject } from '@/server/repos/projects';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Get user ID from session
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  const projects = await listProjectsByUser(userId);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Get user ID from session
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, subdomain, description } = body;

    if (!name || !subdomain) {
      return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 });
    }

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return NextResponse.json({ error: 'invalid_subdomain' }, { status: 400 });
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
