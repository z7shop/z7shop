import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json();

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

  const existing = await dbGet('SELECT id FROM users WHERE email = ?', email);
  if (existing) {
    return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 400 });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = uuidv4();

  await dbRun('INSERT INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
    id, name.trim(), email.trim().toLowerCase(), hashedPassword, phone || ''
  );

  return NextResponse.json({ id }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;

  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json({ error: 'INVALID_NAME' }, { status: 400 });
  }

  if (body.phone && !/^09\d{9}$/.test(body.phone)) {
    return NextResponse.json({ error: 'INVALID_PHONE' }, { status: 400 });
  }

  if (body.password) {
    if (body.password.length < 4) {
      return NextResponse.json({ error: 'INVALID_PASSWORD' }, { status: 400 });
    }
    const hashedPassword = bcrypt.hashSync(body.password, 10);
    await dbRun('UPDATE users SET name=?, phone=?, password=? WHERE id=?', body.name.trim(), body.phone || '', hashedPassword, userId);
  } else {
    await dbRun('UPDATE users SET name=?, phone=? WHERE id=?', body.name.trim(), body.phone || '', userId);
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await dbGet('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', userId);

  return NextResponse.json(user);
}
