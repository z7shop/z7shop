import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const coupons = await dbAll('SELECT * FROM coupons ORDER BY expires_at DESC');
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const id = uuidv4();

  await dbRun(
    'INSERT INTO coupons (id, code, discount_percent, max_discount, min_order, is_active, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    id, body.code.toUpperCase(), body.discount_percent, body.max_discount, body.min_order || 0, body.is_active ? 1 : 0, body.expires_at
  );

  return NextResponse.json({ id }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  await dbRun(
    'UPDATE coupons SET code = ?, discount_percent = ?, max_discount = ?, min_order = ?, is_active = ?, expires_at = ? WHERE id = ?',
    body.code.toUpperCase(), body.discount_percent, body.max_discount, body.min_order || 0, body.is_active ? 1 : 0, body.expires_at, body.id
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  await dbRun('DELETE FROM coupons WHERE id = ?', id);

  return NextResponse.json({ success: true });
}
