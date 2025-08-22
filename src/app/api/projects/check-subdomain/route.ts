import { isSubdomainAvailable } from '@/server/repos/projects/projects';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json({ error: 'subdomain_required' }, { status: 400 });
  }

  try {
    const available = await isSubdomainAvailable(subdomain);
    return NextResponse.json({ available });
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
