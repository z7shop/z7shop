import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { sanitize } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json({ error: 'product_id required' }, { status: 400 });
  }

  const reviews = await dbAll(`
    SELECT r.*, u.name as user_name
    FROM reviews r JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `, productId);

  const stats = await dbGet(`
    SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as average
    FROM reviews WHERE product_id = ?
  `, productId);

  const distribution = await dbAll(`
    SELECT rating, COUNT(*) as count
    FROM reviews WHERE product_id = ?
    GROUP BY rating ORDER BY rating DESC
  `, productId);

  return NextResponse.json({
    reviews,
    count: stats.count,
    average: Math.round(Number(stats.average) * 10) / 10,
    distribution,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id, rating, title, comment } = await req.json();

  if (!product_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const existing = await dbGet('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?', userId, product_id);

  const safeTitle = sanitize(title || '');
  const safeComment = sanitize(comment || '');

  if (existing) {
    await dbRun("UPDATE reviews SET rating=?, title=?, comment=?, created_at=datetime('now') WHERE id=?",
      rating, safeTitle, safeComment, existing.id
    );
    return NextResponse.json({ id: existing.id, action: 'updated' });
  }

  const id = uuidv4();
  await dbRun('INSERT INTO reviews (id, user_id, product_id, rating, title, comment) VALUES (?, ?, ?, ?, ?, ?)',
    id, userId, product_id, rating, safeTitle, safeComment
  );

  return NextResponse.json({ id, action: 'created' }, { status: 201 });
}
