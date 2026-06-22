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

  const bundles = await dbAll('SELECT * FROM bundles ORDER BY created_at DESC') as any[];

  for (const bundle of bundles) {
    bundle.products = await dbAll(`
      SELECT p.* FROM products p
      JOIN bundle_items bi ON bi.product_id = p.id
      WHERE bi.bundle_id = ?
    `, bundle.id);
  }

  return NextResponse.json(bundles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const id = uuidv4();

  await dbRun(
    'INSERT INTO bundles (id, name_fa, name_en, description_fa, description_en, discount_percent, image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id, body.name_fa, body.name_en, body.description_fa || '', body.description_en || '', body.discount_percent, body.image || '', body.is_active ? 1 : 0
  );

  for (const pid of (body.product_ids || [])) {
    await dbRun('INSERT INTO bundle_items (id, bundle_id, product_id) VALUES (?, ?, ?)', uuidv4(), id, pid);
  }

  return NextResponse.json({ id }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  await dbRun(
    'UPDATE bundles SET name_fa=?, name_en=?, description_fa=?, description_en=?, discount_percent=?, image=?, is_active=? WHERE id=?',
    body.name_fa, body.name_en, body.description_fa || '', body.description_en || '', body.discount_percent, body.image || '', body.is_active ? 1 : 0, body.id
  );

  await dbRun('DELETE FROM bundle_items WHERE bundle_id = ?', body.id);
  for (const pid of (body.product_ids || [])) {
    await dbRun('INSERT INTO bundle_items (id, bundle_id, product_id) VALUES (?, ?, ?)', uuidv4(), body.id, pid);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  await dbRun('DELETE FROM bundle_items WHERE bundle_id = ?', id);
  await dbRun('DELETE FROM bundles WHERE id = ?', id);

  return NextResponse.json({ success: true });
}
