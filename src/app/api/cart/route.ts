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
    SELECT c.*, p.name_fa, p.name_en, p.price, p.discount_price, p.images, p.stock, p.sizes as product_sizes, p.colors as product_colors
    FROM cart c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, userId);

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id, quantity = 1, size, color } = await req.json();
  const userId = (session.user as any).id;

  const existing = await dbGet(
    'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?',
    userId, product_id, size || '', color || ''
  );

  if (existing) {
    await dbRun('UPDATE cart SET quantity = quantity + ? WHERE id = ?', quantity, existing.id);
  } else {
    await dbRun('INSERT INTO cart (id, user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?, ?)',
      uuidv4(), userId, product_id, quantity, size || '', color || ''
    );
  }

  const count = await dbGet('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', userId);

  return NextResponse.json({ success: true, cartCount: count?.total || 0 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, quantity } = await req.json();

  if (quantity <= 0) {
    await dbRun('DELETE FROM cart WHERE id = ?', id);
  } else {
    await dbRun('UPDATE cart SET quantity = ? WHERE id = ?', quantity, id);
  }

  const userId = (session.user as any).id;
  const count = await dbGet('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', userId);

  return NextResponse.json({ success: true, cartCount: count?.total || 0 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await dbRun('DELETE FROM cart WHERE id = ?', id);

  const userId = (session.user as any).id;
  const count = await dbGet('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', userId);

  return NextResponse.json({ success: true, cartCount: count?.total || 0 });
}
