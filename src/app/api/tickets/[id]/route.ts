import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sanitize } from '@/lib/sanitize';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';

  const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', params.id);
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!isAdmin && ticket.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await dbAll(`
    SELECT tm.*, u.name as user_name
    FROM ticket_messages tm
    LEFT JOIN users u ON tm.user_id = u.id
    WHERE tm.ticket_id = ?
    ORDER BY tm.created_at ASC
  `, params.id);

  return NextResponse.json({ ticket, messages });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';

  const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', params.id);
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!isAdmin && ticket.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const safeMessage = sanitize(message);

  await dbRun(
    'INSERT INTO ticket_messages (id, ticket_id, user_id, message, is_admin) VALUES (?, ?, ?, ?, ?)',
    uuidv4(), params.id, userId, safeMessage, isAdmin ? 1 : 0
  );

  const newStatus = isAdmin ? 'answered' : 'open';
  await dbRun("UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?", newStatus, params.id);

  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';

  const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', params.id);
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!isAdmin && ticket.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { status } = await req.json();
  if (status) {
    await dbRun("UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?", status, params.id);
  }

  return NextResponse.json({ success: true });
}
