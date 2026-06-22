import { NextRequest, NextResponse } from 'next/server';
import { dbGet } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ valid: false });

  const coupon = await dbGet(
    "SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND expires_at > datetime('now')",
    code
  );

  if (!coupon) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discount_percent: coupon.discount_percent,
    max_discount: coupon.max_discount,
    min_order: coupon.min_order,
    expires_at: coupon.expires_at,
  });
}
