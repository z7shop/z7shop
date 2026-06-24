import { NextRequest, NextResponse } from 'next/server';
import { dbGet } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';

  const order = isAdmin
    ? await dbGet('SELECT * FROM orders WHERE id = ?', params.id)
    : await dbGet('SELECT * FROM orders WHERE id = ? AND user_id = ?', params.id, userId);

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(order);
}
