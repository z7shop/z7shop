import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { sendStockAlertEmail } from '@/lib/mailer';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await dbGet('SELECT * FROM products WHERE id = ?', params.id);

  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const related = await dbAll(
    'SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT 4',
    product.category_id, params.id
  );

  const reviewStats = await dbGet(`
    SELECT COUNT(*) as reviewCount, COALESCE(AVG(rating), 0) as averageRating
    FROM reviews WHERE product_id = ?
  `, params.id) as { reviewCount: number; averageRating: number };

  const ordersWithProduct = await dbAll(
    "SELECT items FROM orders WHERE items LIKE '%' || ? || '%'",
    params.id
  ) as { items: string }[];

  const coOccurrence: Record<string, number> = {};
  for (const order of ordersWithProduct) {
    try {
      const items = JSON.parse(order.items as string) as { product_id: string }[];
      for (const item of items) {
        if (item.product_id !== params.id) {
          coOccurrence[item.product_id] = (coOccurrence[item.product_id] || 0) + 1;
        }
      }
    } catch {}
  }

  const topCoIds = Object.entries(coOccurrence)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4)
    .map(([id]) => id);

  let alsoBought: any[] = [];
  if (topCoIds.length > 0) {
    const placeholders = topCoIds.map(() => '?').join(',');
    alsoBought = await dbAll(`SELECT * FROM products WHERE id IN (${placeholders})`, ...topCoIds);
  }

  return NextResponse.json({
    product,
    related,
    alsoBought,
    averageRating: Math.round(Number(reviewStats.averageRating) * 10) / 10,
    reviewCount: reviewStats.reviewCount,
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const oldProduct = await dbGet('SELECT stock, name_fa, name_en FROM products WHERE id = ?', params.id);

  await dbRun(`
    UPDATE products SET name_fa=?, name_en=?, description_fa=?, description_en=?,
    price=?, discount_price=?, category_id=?, sizes=?, colors=?, images=?,
    stock=?, is_featured=?, is_new=?, updated_at=datetime('now')
    WHERE id=?
  `,
    body.name_fa, body.name_en, body.description_fa || '', body.description_en || '',
    body.price, body.discount_price || null, body.category_id,
    JSON.stringify(body.sizes || []), JSON.stringify(body.colors || []),
    JSON.stringify(body.images || []), body.stock || 0,
    body.is_featured ? 1 : 0, body.is_new ? 1 : 0,
    params.id
  );

  const newStock = body.stock || 0;
  if (oldProduct && Number(oldProduct.stock) === 0 && newStock > 0) {
    const alerts = await dbAll(
      'SELECT * FROM stock_alerts WHERE product_id = ? AND notified = 0',
      params.id
    );

    for (const alert of alerts) {
      await sendStockAlertEmail(alert.email as string, oldProduct.name_fa as string, oldProduct.name_en as string, params.id);
      if (alert.user_id) {
        await createNotification(alert.user_id as string, 'stock',
          'محصول موجود شد!', 'Back in Stock!',
          `${oldProduct.name_fa} موجود شد. همین الان سفارش بدید!`,
          `${oldProduct.name_en} is back in stock. Order now!`,
          `/products/${params.id}`
        );
      }
    }

    await dbRun('UPDATE stock_alerts SET notified = 1 WHERE product_id = ? AND notified = 0', params.id);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbRun('DELETE FROM products WHERE id = ?', params.id);

  return NextResponse.json({ success: true });
}
