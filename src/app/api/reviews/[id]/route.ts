import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const review = await dbGet('SELECT * FROM reviews WHERE id = ?', params.id);
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (review.user_id !== userId && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbRun('DELETE FROM reviews WHERE id = ?', params.id);
  return NextResponse.json({ success: true });
}
