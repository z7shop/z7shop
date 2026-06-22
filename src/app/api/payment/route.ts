import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { order_id, amount } = await req.json();
  if (!order_id || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const order = await dbGet('SELECT * FROM orders WHERE id = ? AND user_id = ?', order_id, userId);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const paymentId = uuidv4();
  await dbRun(
    'INSERT INTO payments (id, order_id, user_id, amount, status) VALUES (?, ?, ?, ?, ?)',
    paymentId, order_id, userId, amount, 'pending'
  );

  return NextResponse.json({ id: paymentId }, { status: 201 });
}
