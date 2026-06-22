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

  const items = await dbAll(`
    SELECT w.*, p.name_fa, p.name_en, p.price, p.discount_price, p.images, p.category_id
    FROM wishlist w JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
  `, userId);

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id } = await req.json();
  const userId = (session.user as any).id;

  if (!product_id) return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });

  const product = await dbGet('SELECT id FROM products WHERE id = ?', product_id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const existing = await dbGet('SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?', userId, product_id);

  if (existing) {
    await dbRun('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', userId, product_id);
    return NextResponse.json({ action: 'removed' });
  }

  await dbRun('INSERT INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)', uuidv4(), userId, product_id);
  return NextResponse.json({ action: 'added' });
}
