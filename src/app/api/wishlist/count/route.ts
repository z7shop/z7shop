import { NextResponse } from 'next/server';
import { dbGet } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const userId = (session.user as any).id;

  const result = await dbGet('SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?', userId);

  return NextResponse.json({ count: Number(result.count) });
}
