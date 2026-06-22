import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bundle_id } = await req.json();
  const userId = (session.user as any).id;

  const bundle = await dbGet('SELECT * FROM bundles WHERE id = ? AND is_active = 1', bundle_id);
  if (!bundle) {
    return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
  }

  const products = await dbAll(`
    SELECT p.* FROM products p
    JOIN bundle_items bi ON bi.product_id = p.id
    WHERE bi.bundle_id = ?
  `, bundle_id);

  for (const product of products) {
    if (Number(product.stock) <= 0) continue;

    const sizes: string[] = (() => { try { return JSON.parse(product.sizes as string || '[]'); } catch { return []; } })();
    const colors: string[] = (() => { try { return JSON.parse(product.colors as string || '[]'); } catch { return []; } })();
    const size = sizes[0] || '';
    const color = colors[0] || '';

    const existing = await dbGet(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?',
      userId, product.id, size, color
    );

    if (existing) {
      await dbRun('UPDATE cart SET quantity = quantity + 1 WHERE id = ?', existing.id);
    } else {
      await dbRun('INSERT INTO cart (id, user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?, ?)',
        uuidv4(), userId, product.id, 1, size, color
      );
    }
  }

  const count = await dbGet('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', userId);

  return NextResponse.json({ success: true, cartCount: count?.total || 0 });
}
