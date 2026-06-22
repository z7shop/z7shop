import { NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await dbAll('SELECT * FROM categories');
  return NextResponse.json(categories);
}
