import { NextRequest, NextResponse } from 'next/server';
import { dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbRun('DELETE FROM addresses WHERE id = ? AND user_id = ?', params.id, (session.user as any).id);

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;

  if (body.is_default) {
    await dbRun('UPDATE addresses SET is_default = 0 WHERE user_id = ?', userId);
  }

  await dbRun(`
    UPDATE addresses SET title=?, full_name=?, phone=?, province=?, city=?, address=?, postal_code=?, is_default=?, lat=?, lng=?
    WHERE id=? AND user_id=?
  `, body.title, body.full_name, body.phone, body.province, body.city, body.address, body.postal_code, body.is_default ? 1 : 0, body.lat || null, body.lng || null, params.id, userId);

  return NextResponse.json({ success: true });
}
