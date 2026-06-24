import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '@/lib/mailer';
import { rateLimit, getRateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed } = rateLimit(ip, 5);
  if (!allowed) return getRateLimitResponse();

  const body = await req.json();

  if (body.action === 'send') {
    const { name, email, password, phone } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'INVALID_NAME' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'INVALID_PASSWORD' }, { status: 400 });
    }
    if (phone && !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'INVALID_PHONE' }, { status: 400 });
    }

    const existing = await dbGet('SELECT id FROM users WHERE email = ?', email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 400 });
    }

    await dbRun('DELETE FROM verification_codes WHERE email = ?', email.trim().toLowerCase());

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashedPassword = bcrypt.hashSync(password, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    const id = uuidv4();

    await dbRun(
      'INSERT INTO verification_codes (id, email, code, name, password, phone, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      id, email.trim().toLowerCase(), code, name.trim(), hashedPassword, phone || '', expiresAt
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

    const userId = uuidv4();
    await dbRun('INSERT INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
      userId, record.name, record.email, record.password, record.phone
    );

    await dbRun('DELETE FROM verification_codes WHERE email = ?', record.email);

    const points = 10;
    await dbRun(
      'INSERT INTO loyalty_points (id, user_id, points, type, description_fa, description_en) VALUES (?, ?, ?, ?, ?, ?)',
      uuidv4(), userId, points, 'earn', 'امتیاز خوش‌آمدگویی', 'Welcome Points'
    );

    return NextResponse.json({ success: true, userId });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
