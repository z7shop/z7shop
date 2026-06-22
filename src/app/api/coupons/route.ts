import { NextRequest, NextResponse } from 'next/server';
import { dbGet } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const coupon = await dbGet(
    "SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND expires_at > datetime('now')",
    code
  );

  if (!coupon) {
    return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 });
  }

  return NextResponse.json(coupon);
}
