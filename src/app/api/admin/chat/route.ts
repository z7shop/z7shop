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

  const sessions = await dbAll(`
    SELECT cs.*, u.name as user_name, u.email as user_email,
    (SELECT message FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM chat_sessions cs JOIN users u ON cs.user_id = u.id
    WHERE cs.status IN ('waiting', 'active')
    ORDER BY CASE cs.status WHEN 'waiting' THEN 0 ELSE 1 END, cs.updated_at DESC
  `);

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  if (body.action === 'accept') {
    await dbRun("UPDATE chat_sessions SET status = 'active', updated_at = datetime('now') WHERE id = ?", body.session_id);

    const msgId = uuidv4();
    await dbRun('INSERT INTO chat_messages (id, session_id, sender, message) VALUES (?, ?, ?, ?)',
      msgId, body.session_id, 'system', 'پشتیبان به چت متصل شد.'
    );

    return NextResponse.json({ success: true });
  }

  if (body.action === 'send_message') {
    const msgId = uuidv4();
    await dbRun('INSERT INTO chat_messages (id, session_id, sender, message, image) VALUES (?, ?, ?, ?, ?)',
      msgId, body.session_id, 'admin', body.message || '', body.image || ''
    );
    await dbRun("UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?", body.session_id);

    return NextResponse.json({ id: msgId });
  }

  if (body.action === 'close') {
    await dbRun("UPDATE chat_sessions SET status = 'closed', updated_at = datetime('now') WHERE id = ?", body.session_id);

    const msgId = uuidv4();
    await dbRun('INSERT INTO chat_messages (id, session_id, sender, message) VALUES (?, ?, ?, ?)',
      msgId, body.session_id, 'system', 'چت توسط پشتیبان بسته شد.'
    );

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
