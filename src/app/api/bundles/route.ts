import { NextRequest, NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('product_id');

  let bundles: any[];

  if (productId) {
    bundles = await dbAll(`
      SELECT DISTINCT b.* FROM bundles b
      JOIN bundle_items bi ON bi.bundle_id = b.id
      WHERE b.is_active = 1 AND bi.product_id = ?
      ORDER BY b.created_at DESC
    `, productId);
  } else {
    bundles = await dbAll(
      'SELECT * FROM bundles WHERE is_active = 1 ORDER BY created_at DESC'
    );
  }

  for (const bundle of bundles) {
    bundle.products = await dbAll(`
      SELECT p.* FROM products p
      JOIN bundle_items bi ON bi.product_id = p.id
      WHERE bi.bundle_id = ?
    `, bundle.id);
  }

  return NextResponse.json(bundles);
}
