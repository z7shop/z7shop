import { NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const banners = await dbAll('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC');
  return NextResponse.json(banners);
}
