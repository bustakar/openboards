import { authOptions } from '@/server/auth/options';
import { listBoardsWithStats } from '@/server/repos/boards';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project');

  const data = await listBoardsWithStats(userId, projectId);
  return NextResponse.json(data);
}
