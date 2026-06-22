import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbAll, dbRun } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sanitize } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';

  let tickets;
  if (isAdmin) {
    tickets = await dbAll(`
      SELECT t.*, u.name as user_name,
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.updated_at DESC
    `);
  } else {
    tickets = await dbAll(`
      SELECT t.*,
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count
      FROM tickets t
      WHERE t.user_id = ?
      ORDER BY t.updated_at DESC
    `, userId);
  }

  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subject, department, priority, message } = await req.json();
  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message required' }, { status: 400 });
  }

  const safeSubject = sanitize(subject);
  const safeMessage = sanitize(message);

  const userId = (session.user as any).id;
  const ticketId = uuidv4();

  await dbRun(
    'INSERT INTO tickets (id, user_id, subject, department, priority) VALUES (?, ?, ?, ?, ?)',
    ticketId, userId, safeSubject, department || 'support', priority || 'normal'
  );

  await dbRun(
    'INSERT INTO ticket_messages (id, ticket_id, user_id, message, is_admin) VALUES (?, ?, ?, ?, 0)',
    uuidv4(), ticketId, userId, safeMessage
  );

  return NextResponse.json({ id: ticketId }, { status: 201 });
}
