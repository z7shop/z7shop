import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const addresses = await dbAll('SELECT * FROM addresses WHERE user_id = ?', userId);

  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;

  if (body.is_default) {
    await dbRun('UPDATE addresses SET is_default = 0 WHERE user_id = ?', userId);
  }

  const id = uuidv4();
  await dbRun(`
    INSERT INTO addresses (id, user_id, title, full_name, phone, province, city, address, postal_code, is_default, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, id, userId, body.title, body.full_name, body.phone, body.province, body.city, body.address, body.postal_code, body.is_default ? 1 : 0, body.lat || null, body.lng || null);

  return NextResponse.json({ id }, { status: 201 });
}
