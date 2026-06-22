import { NextRequest, NextResponse } from 'next/server';
import { dbRun } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sanitize, isValidEmail } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const safeEmail = sanitize(email || '');

  if (!safeEmail || !isValidEmail(safeEmail)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  try {
    await dbRun('INSERT INTO newsletter (id, email) VALUES (?, ?)', uuidv4(), safeEmail);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
  }
}
