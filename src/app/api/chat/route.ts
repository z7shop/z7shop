import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const FAQ: { q: string; q_en: string; a: string; a_en: string }[] = [
  { q: 'چطور سفارش بدم؟', q_en: 'How do I place an order?', a: 'محصول مورد نظر رو انتخاب کنید، سایز و رنگ رو مشخص کنید و دکمه افزودن به سبد رو بزنید. بعد از تکمیل سبد خرید، مراحل پرداخت رو طی کنید.', a_en: 'Select your product, choose size and color, click Add to Cart. Then complete the checkout process.' },
  { q: 'هزینه ارسال چقدره؟', q_en: 'What are shipping costs?', a: 'ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان. ارسال عادی ۲۵,۰۰۰ تومان (۳-۵ روز) و ارسال سریع ۴۵,۰۰۰ تومان (۱-۲ روز).', a_en: 'Free shipping on orders over 500K. Standard: 25,000T (3-5 days). Express: 45,000T (1-2 days).' },
  { q: 'چطور مرجوع کنم؟', q_en: 'How do I return an item?', a: 'تا ۷ روز پس از دریافت، به شرط عدم استفاده و داشتن برچسب، می‌تونید کالا رو مرجوع کنید. از بخش تیکت‌ها درخواست بدید.', a_en: 'Within 7 days of receipt, if unused with tags. Submit a return request via Support Tickets.' },
  { q: 'کد تخفیف چطور استفاده کنم؟', q_en: 'How to use a coupon?', a: 'در صفحه سبد خرید، کد تخفیف رو در قسمت مربوطه وارد کنید و دکمه اعمال رو بزنید. تخفیف روی مبلغ نهایی اعمال میشه.', a_en: 'Enter the coupon code in the cart page and click Apply. The discount will be applied to the total.' },
  { q: 'سفارشم کجاست؟', q_en: 'Where is my order?', a: 'از بخش پنل کاربری > سفارش‌ها می‌تونید وضعیت سفارشتون رو پیگیری کنید. بعد از ارسال، کد رهگیری برای شما ارسال میشه.', a_en: 'Check your order status in Dashboard > Orders. A tracking code will be sent after shipping.' },
  { q: 'روش‌های پرداخت چیه؟', q_en: 'What payment methods?', a: 'در حال حاضر پرداخت آنلاین از طریق درگاه بانکی امکان‌پذیره. تمام کارت‌های عضو شتاب پشتیبانی میشن.', a_en: 'Online payment via bank gateway. All Shetab member cards are supported.' },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ faq: FAQ });

  const chatSession = await dbGet('SELECT * FROM chat_sessions WHERE id = ?', sessionId);
  if (!chatSession) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = await dbAll('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', sessionId);
  return NextResponse.json({ session: chatSession, messages });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;

  if (body.action === 'create_session') {
    const id = uuidv4();
    await dbRun("INSERT INTO chat_sessions (id, user_id, status) VALUES (?, ?, 'bot')", id, userId);
    return NextResponse.json({ session_id: id });
  }

  if (body.action === 'send_message') {
    const { session_id, message, image, sender } = body;
    const chatSession = await dbGet('SELECT * FROM chat_sessions WHERE id = ?', session_id);
    if (!chatSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const msgSender = sender === 'bot' ? 'bot' : sender === 'system' ? 'system' : 'user';
    const msgId = uuidv4();
    await dbRun('INSERT INTO chat_messages (id, session_id, sender, message, image) VALUES (?, ?, ?, ?, ?)', msgId, session_id, msgSender, message || '', image || '');
    await dbRun("UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?", session_id);

    return NextResponse.json({ id: msgId });
  }

  if (body.action === 'close_session') {
    const { session_id } = body;
    await dbRun("UPDATE chat_sessions SET status = 'closed', updated_at = datetime('now') WHERE id = ?", session_id);
    return NextResponse.json({ success: true });
  }

  if (body.action === 'request_admin') {
    const { session_id } = body;
    await dbRun("UPDATE chat_sessions SET status = 'waiting', updated_at = datetime('now') WHERE id = ?", session_id);

    const msgId = uuidv4();
    await dbRun('INSERT INTO chat_messages (id, session_id, sender, message) VALUES (?, ?, ?, ?)',
      msgId, session_id, 'system', 'در انتظار اتصال به پشتیبانی...'
    );

    return NextResponse.json({ status: 'waiting' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
