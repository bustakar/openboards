import { auth } from '@/lib/auth';
import { listBoardsWithStats } from '@/server/repos/boards/boards';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id_required' }, { status: 400 });
  }

  const data = await listBoardsWithStats(projectId);
  return NextResponse.json(data);
}
