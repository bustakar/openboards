import { authOptions } from '@/server/auth/options';
import { listBoardsWithStats } from '@/server/repos/boards';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const data = await listBoardsWithStats();
  return NextResponse.json(data);
}
