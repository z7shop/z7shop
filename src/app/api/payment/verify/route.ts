import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { payment_id, status, card_number } = await req.json();
  if (!payment_id || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const payment = await dbGet('SELECT * FROM payments WHERE id = ? AND user_id = ?', payment_id, userId);
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  if (status === 'success') {
    const refNumber = String(Math.floor(100000000000 + Math.random() * 900000000000));
    const maskedCard = card_number ? card_number.replace(/\d(?=\d{4})/g, '*') : '';

    await dbRun(
      'UPDATE payments SET status = ?, ref_number = ?, card_number = ? WHERE id = ?',
      'success', refNumber, maskedCard, payment_id
    );

    await dbRun(
      "UPDATE orders SET status = 'processing', updated_at = datetime('now') WHERE id = ?",
      payment.order_id
    );

    await dbRun(
      'INSERT INTO notifications (id, user_id, type, title_fa, title_en, message_fa, message_en, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      uuidv4(), userId, 'order',
      'پرداخت موفق', 'Payment Successful',
      `سفارش شما با شماره پیگیری ${refNumber} با موفقیت پرداخت شد.`,
      `Your order was paid successfully. Reference: ${refNumber}`,
      `/panel/orders`
    );

    const points = Math.floor(payment.amount / 10000);
    if (points > 0) {
      await dbRun(
        'INSERT INTO loyalty_points (id, user_id, points, type, description_fa, description_en, order_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        uuidv4(), userId, points, 'earn',
        `امتیاز خرید سفارش`,
        `Order purchase points`,
        payment.order_id
      );
    }

    const updated = await dbGet('SELECT * FROM payments WHERE id = ?', payment_id);
    return NextResponse.json({ ...updated, points_earned: points });
  } else {
    await dbRun('UPDATE payments SET status = ? WHERE id = ?', 'failed', payment_id);

    await dbRun(
      "UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?",
      payment.order_id
    );

    const updated = await dbGet('SELECT * FROM payments WHERE id = ?', payment_id);
    return NextResponse.json(updated);
  }
}
