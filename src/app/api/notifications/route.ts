import { NextResponse } from 'next/server';
import { dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const notifications = await dbAll(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', userId
  );

  return NextResponse.json(notifications);
}

export async function PUT() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  await dbRun('UPDATE notifications SET is_read = 1 WHERE user_id = ?', userId);

  return NextResponse.json({ success: true });
}
