import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isValidEmail } from '@/lib/sanitize';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { product_id, email } = body;

  if (!product_id || !email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email or product_id' }, { status: 400 });
  }

  const product = await dbGet('SELECT id, stock FROM products WHERE id = ?', product_id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (Number(product.stock) > 0) {
    return NextResponse.json({ error: 'Product is already in stock' }, { status: 400 });
  }

  const existing = await dbGet(
    'SELECT id FROM stock_alerts WHERE product_id = ? AND email = ? AND notified = 0',
    product_id, email
  );

  if (existing) {
    return NextResponse.json({ error: 'already_subscribed' }, { status: 409 });
  }

  let userId: string | null = null;
  const session = await getServerSession(authOptions);
  if (session?.user) {
    userId = (session.user as any).id;
  }

  await dbRun(
    'INSERT INTO stock_alerts (id, product_id, email, user_id) VALUES (?, ?, ?, ?)',
    uuidv4(), product_id, email, userId
  );

  return NextResponse.json({ success: true });
}
