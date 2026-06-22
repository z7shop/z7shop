import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { endpoint, keys } = await req.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const existing = await dbGet(
    'SELECT id FROM push_subscriptions WHERE user_id = ? AND endpoint = ?', userId, endpoint
  );

  if (existing) {
    return NextResponse.json({ success: true, message: 'Already subscribed' });
  }

  await dbRun(
    'INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?, ?)',
    uuidv4(), userId, endpoint, keys.p256dh, keys.auth
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { endpoint } = await req.json();
  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
  }

  const userId = (session.user as any).id;

  await dbRun('DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?', userId, endpoint);

  return NextResponse.json({ success: true });
}
