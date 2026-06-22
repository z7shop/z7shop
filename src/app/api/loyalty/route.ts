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

  const earnedRow = await dbGet('SELECT COALESCE(SUM(points), 0) as total FROM loyalty_points WHERE user_id = ? AND type = ?', userId, 'earn');
  const spentRow = await dbGet('SELECT COALESCE(SUM(points), 0) as total FROM loyalty_points WHERE user_id = ? AND type = ?', userId, 'spend');
  const earned = Number(earnedRow?.total || 0);
  const spent = Number(spentRow?.total || 0);
  const totalPoints = earned - spent;

  const history = await dbAll('SELECT * FROM loyalty_points WHERE user_id = ? ORDER BY created_at DESC', userId);

  return NextResponse.json({ totalPoints, history });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const pointsToSpend = body.points;

  if (!pointsToSpend || pointsToSpend < 100) {
    return NextResponse.json({ error: 'Minimum 100 points required' }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const earnedRow = await dbGet('SELECT COALESCE(SUM(points), 0) as total FROM loyalty_points WHERE user_id = ? AND type = ?', userId, 'earn');
  const spentRow = await dbGet('SELECT COALESCE(SUM(points), 0) as total FROM loyalty_points WHERE user_id = ? AND type = ?', userId, 'spend');
  const currentPoints = Number(earnedRow?.total || 0) - Number(spentRow?.total || 0);

  if (currentPoints < pointsToSpend) {
    return NextResponse.json({ error: 'Not enough points' }, { status: 400 });
  }

  const discountAmount = Math.floor(pointsToSpend / 100) * 10000;
  const actualPointsSpent = Math.floor(pointsToSpend / 100) * 100;

  await dbRun(
    'INSERT INTO loyalty_points (id, user_id, points, type, description_fa, description_en) VALUES (?, ?, ?, ?, ?, ?)',
    uuidv4(), userId, actualPointsSpent, 'spend', `تخفیف ${discountAmount.toLocaleString()} تومانی`, `${discountAmount.toLocaleString()}T discount`
  );

  const code = 'LP' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const discountPercent = 100;
  await dbRun(
    'INSERT INTO coupons (id, code, discount_percent, max_discount, min_order, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    uuidv4(), code, discountPercent, discountAmount, 0, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
  );

  const newTotal = currentPoints - actualPointsSpent;

  return NextResponse.json({ totalPoints: newTotal, couponCode: code, discountAmount });
}
