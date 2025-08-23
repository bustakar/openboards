import { listBoardsForProject } from '@/server/repos/boards/boards';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id_required' }, { status: 400 });
  }

  try {
    const data = await listBoardsForProject(projectId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
