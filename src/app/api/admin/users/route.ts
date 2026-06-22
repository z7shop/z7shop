import { NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await dbAll('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');

  return NextResponse.json(users);
}
