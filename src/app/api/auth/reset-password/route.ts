import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '@/lib/mailer';
import { rateLimit, getRateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed } = rateLimit(`reset-${ip}`, 5);
  if (!allowed) return getRateLimitResponse();

  const body = await req.json();

  if (body.action === 'send') {
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });

    const user = await dbGet('SELECT id FROM users WHERE email = ?', email.trim().toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'EMAIL_NOT_FOUND' }, { status: 400 });
    }

    await dbRun('DELETE FROM verification_codes WHERE email = ?', email.trim().toLowerCase());

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    const id = uuidv4();

    await dbRun(
      'INSERT INTO verification_codes (id, email, code, name, password, phone, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      id, email.trim().toLowerCase(), code, '', '', '', expiresAt
    );

    const sent = await sendVerificationEmail(email.trim(), code);
    if (!sent) {
      await dbRun('DELETE FROM verification_codes WHERE id = ?', id);
      return NextResponse.json({ error: 'EMAIL_SEND_FAILED' }, { status: 500 });
    }
    return NextResponse.json({ sent: true });
  }

  if (body.action === 'verify') {
    const { email, code } = body;

    const record = await dbGet(
      "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now')",
      email.trim().toLowerCase(), code
    );

    if (!record) {
      return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 });
    }

    return NextResponse.json({ verified: true });
  }

  if (body.action === 'reset') {
    const { email, code, password } = body;

    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'INVALID_PASSWORD' }, { status: 400 });
    }

    const record = await dbGet(
      "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > datetime('now')",
      email.trim().toLowerCase(), code
    );

    if (!record) {
      return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await dbRun('UPDATE users SET password = ? WHERE email = ?', hashedPassword, email.trim().toLowerCase());
    await dbRun('DELETE FROM verification_codes WHERE email = ?', email.trim().toLowerCase());

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
