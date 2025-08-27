import { getProjectBySubdomain } from '@/server/repos/projects/projects';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json({ error: 'subdomain_required' }, { status: 400 });
  }

  try {
    const project = await getProjectBySubdomain(subdomain);
    if (!project) {
      return NextResponse.json({ error: 'project_not_found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
