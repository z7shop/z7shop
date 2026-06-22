import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

function generateCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z؀-ۿ]/g, '').slice(0, 4).toUpperCase() || 'Z7';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix + suffix;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await dbGet('SELECT name, referral_code FROM users WHERE id = ?', userId);

  let code = user.referral_code;
  if (!code) {
    code = generateCode(user.name);
    await dbRun('UPDATE users SET referral_code = ? WHERE id = ?', code, userId);
  }

  const referredRow = await dbGet('SELECT COUNT(*) as c FROM referrals WHERE referrer_id = ?', userId);
  const pointsRow = await dbGet("SELECT COALESCE(SUM(points), 0) as p FROM loyalty_points WHERE user_id = ? AND type = 'earn' AND description_fa LIKE '%دعوت%'", userId);

  return NextResponse.json({ code, referredCount: Number(referredRow?.c || 0), pointsEarned: Number(pointsRow?.p || 0) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: 'MISSING_CODE' }, { status: 400 });

  const userId = (session.user as any).id;

  const referrer = await dbGet('SELECT id, name FROM users WHERE referral_code = ?', code.toUpperCase());
  if (!referrer) return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 });
  if (referrer.id === userId) return NextResponse.json({ error: 'SELF_REFERRAL' }, { status: 400 });

  const existing = await dbGet('SELECT id FROM referrals WHERE referred_id = ?', userId);
  if (existing) return NextResponse.json({ error: 'ALREADY_REFERRED' }, { status: 400 });

  await dbRun('INSERT INTO referrals (id, referrer_id, referred_id, referrer_rewarded, referred_rewarded) VALUES (?, ?, ?, 1, 1)', uuidv4(), referrer.id, userId);

  await dbRun("INSERT INTO loyalty_points (id, user_id, points, type, description_fa, description_en) VALUES (?, ?, 20, 'earn', ?, ?)",
    uuidv4(), referrer.id, 'امتیاز دعوت دوست', 'Referral reward'
  );
  await dbRun("INSERT INTO loyalty_points (id, user_id, points, type, description_fa, description_en) VALUES (?, ?, 10, 'earn', ?, ?)",
    uuidv4(), userId, 'امتیاز دعوت (معرفی‌شده)', 'Referred bonus'
  );

  await dbRun('INSERT INTO notifications (id, user_id, type, title_fa, title_en, message_fa, message_en, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    uuidv4(), referrer.id, 'points', 'دعوت موفق!', 'Referral Success!',
    'یک دوست با کد دعوت شما ثبت‌نام کرد. ۲۰ امتیاز دریافت کردید!', 'A friend signed up with your code. You earned 20 points!',
    '/panel/referral'
  );
  await dbRun('INSERT INTO notifications (id, user_id, type, title_fa, title_en, message_fa, message_en, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    uuidv4(), userId, 'points', 'خوش آمدید!', 'Welcome!',
    'با استفاده از کد دعوت ۱۰ امتیاز دریافت کردید!', 'You earned 10 points from the referral code!',
    '/panel/loyalty'
  );

  return NextResponse.json({ success: true, referrerPoints: 20, referredPoints: 10 });
}
