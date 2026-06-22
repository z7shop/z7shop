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

  const banners = await dbAll('SELECT * FROM banners ORDER BY sort_order ASC');
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const id = uuidv4();

  await dbRun(
    `INSERT INTO banners (id, badge_fa, badge_en, title_fa, title_en, subtitle_fa, subtitle_en, cta_fa, cta_en, cta_link, gradient, accent_color, image, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, body.badge_fa || '', body.badge_en || '', body.title_fa, body.title_en,
    body.subtitle_fa || '', body.subtitle_en || '', body.cta_fa || '', body.cta_en || '',
    body.cta_link || '/products', body.gradient || '', body.accent_color || 'gold',
    body.image || '', body.sort_order || 0, body.is_active ? 1 : 0
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
    `UPDATE banners SET badge_fa = ?, badge_en = ?, title_fa = ?, title_en = ?, subtitle_fa = ?, subtitle_en = ?,
     cta_fa = ?, cta_en = ?, cta_link = ?, gradient = ?, accent_color = ?, image = ?, sort_order = ?, is_active = ?
     WHERE id = ?`,
    body.badge_fa || '', body.badge_en || '', body.title_fa, body.title_en,
    body.subtitle_fa || '', body.subtitle_en || '', body.cta_fa || '', body.cta_en || '',
    body.cta_link || '/products', body.gradient || '', body.accent_color || 'gold',
    body.image || '', body.sort_order || 0, body.is_active ? 1 : 0, body.id
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  await dbRun('DELETE FROM banners WHERE id = ?', id);

  return NextResponse.json({ success: true });
}
