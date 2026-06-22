import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { sendPushToUser } from '@/lib/pushNotification';

export const dynamic = 'force-dynamic';

const STATUS_FA: Record<string, string> = {
  pending: 'در انتظار تأیید',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

const STATUS_EN: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await dbAll(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `);

  return NextResponse.json(orders);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, status } = await req.json();

  const order = await dbGet('SELECT user_id FROM orders WHERE id = ?', id);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await dbRun("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?", status, id);

  const shortId = id.slice(0, 8).toUpperCase();
  await dbRun(
    'INSERT INTO notifications (id, user_id, type, title_fa, title_en, message_fa, message_en, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    uuidv4(), order.user_id, 'order',
    'تغییر وضعیت سفارش',
    'Order Status Updated',
    `وضعیت سفارش ${shortId} به "${STATUS_FA[status] || status}" تغییر کرد.`,
    `Order ${shortId} status changed to "${STATUS_EN[status] || status}".`,
    '/panel/orders'
  );

  sendPushToUser(
    order.user_id,
    'تغییر وضعیت سفارش',
    `وضعیت سفارش ${shortId} به "${STATUS_FA[status] || status}" تغییر کرد.`,
    '/panel/orders'
  ).catch(() => {});

  return NextResponse.json({ success: true });
}
