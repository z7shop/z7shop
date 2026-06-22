import { NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const closedSessions = await dbAll(
    "SELECT * FROM chat_sessions WHERE user_id = ? AND status = 'closed' ORDER BY updated_at DESC LIMIT 20", userId
  );

  const result = [];
  for (const s of closedSessions) {
    const messages = await dbAll(
      'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', (s as any).id
    );
    result.push({ ...s, messages });
  }

  return NextResponse.json(result);
}
