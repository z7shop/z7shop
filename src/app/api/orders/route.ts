import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const orders = await dbAll('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', userId);

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;

  const cartItems = await dbAll(`
    SELECT c.*, p.price, p.discount_price, p.name_fa, p.name_en
    FROM cart c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, userId);

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  let subtotal = 0;
  const items = cartItems.map((item: any) => {
    const price = item.discount_price || item.price;
    subtotal += price * item.quantity;
    return {
      product_id: item.product_id,
      name_fa: item.name_fa,
      name_en: item.name_en,
      price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    };
  });

  let discountAmount = 0;
  if (body.coupon_code) {
    const coupon = await dbGet('SELECT * FROM coupons WHERE code = ? AND is_active = 1', body.coupon_code);
    if (coupon && subtotal >= coupon.min_order) {
      discountAmount = Math.min(
        Math.floor(subtotal * coupon.discount_percent / 100),
        coupon.max_discount
      );
    }
  }

  let shippingCost = 0;
  if (body.shipping_method === 'standard') shippingCost = 25000;
  else if (body.shipping_method === 'express') shippingCost = 45000;

  const total = subtotal - discountAmount + shippingCost;
  const orderId = uuidv4();

  await dbRun(`
    INSERT INTO orders (id, user_id, items, total, address_id, shipping_method, coupon_code, discount_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    orderId, userId, JSON.stringify(items), total,
    body.address_id || '', body.shipping_method || 'standard',
    body.coupon_code || null, discountAmount
  );

  await dbRun('DELETE FROM cart WHERE user_id = ?', userId);

  return NextResponse.json({ id: orderId, total }, { status: 201 });
}
