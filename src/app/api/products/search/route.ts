import { NextRequest, NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 1) {
    return NextResponse.json([]);
  }

  const results = await dbAll(`
    SELECT id, name_fa, name_en, price, discount_price, images
    FROM products
    WHERE name_fa LIKE ? OR name_en LIKE ?
    LIMIT 8
  `, `%${q}%`, `%${q}%`);

  return NextResponse.json(results);
}
