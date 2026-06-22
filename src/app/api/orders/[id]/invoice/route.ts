import { NextRequest, NextResponse } from 'next/server';
import { dbGet } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';

  const order = await dbGet('SELECT * FROM orders WHERE id = ?', params.id);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (order.user_id !== userId && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const user = await dbGet('SELECT name, email, phone FROM users WHERE id = ?', order.user_id);
  const address = order.address_id ? await dbGet('SELECT * FROM addresses WHERE id = ?', order.address_id) : null;
  const items = JSON.parse(order.items) as { name_fa: string; name_en: string; price: number; quantity: number; size?: string; color?: string }[];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = order.shipping_method === 'express' ? 45000 : order.shipping_method === 'standard' ? 25000 : 0;
  const shortId = order.id.slice(0, 8).toUpperCase();
  const date = new Date(order.created_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

  const fmt = (n: number) => n.toLocaleString('fa-IR');

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>فاکتور ${shortId} - Z7shop</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Tahoma, Arial, sans-serif; color: #1a1a1a; font-size: 13px; padding: 30px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #C9A84C; padding-bottom: 20px; margin-bottom: 24px; }
  .brand { font-size: 28px; font-weight: 900; color: #C9A84C; }
  .brand-sub { font-size: 11px; color: #888; margin-top: 2px; }
  .invoice-info { text-align: left; }
  .invoice-info h2 { font-size: 20px; color: #333; }
  .invoice-info p { font-size: 11px; color: #666; margin-top: 4px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 13px; font-weight: bold; color: #C9A84C; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #eee; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
  .info-grid p { font-size: 12px; color: #444; }
  .info-grid .label { color: #888; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f8f8f8; padding: 10px 12px; text-align: right; font-size: 11px; color: #666; border: 1px solid #e5e5e5; }
  td { padding: 10px 12px; border: 1px solid #e5e5e5; font-size: 12px; }
  .text-left { text-align: left; }
  .totals { width: 280px; margin-right: auto; }
  .totals tr td { border: none; padding: 5px 12px; font-size: 12px; }
  .totals .total-row td { font-weight: bold; font-size: 14px; color: #C9A84C; border-top: 2px solid #C9A84C; padding-top: 10px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 10px; }
  @media print { body { padding: 10px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Z7shop</div>
      <div class="brand-sub">فروشگاه پوشاک مردانه</div>
    </div>
    <div class="invoice-info">
      <h2>فاکتور فروش</h2>
      <p>شماره: ${shortId}</p>
      <p>تاریخ: ${date}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">اطلاعات خریدار</div>
    <div class="info-grid">
      <p><span class="label">نام:</span> ${user?.name || '-'}</p>
      <p><span class="label">ایمیل:</span> ${user?.email || '-'}</p>
      <p><span class="label">تلفن:</span> ${user?.phone || address?.phone || '-'}</p>
      ${address ? `<p><span class="label">آدرس:</span> ${address.province}، ${address.city}، ${address.address}</p>` : ''}
      ${address ? `<p><span class="label">کد پستی:</span> ${address.postal_code}</p>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">اقلام سفارش</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>محصول</th>
          <th>سایز</th>
          <th>تعداد</th>
          <th>قیمت واحد (تومان)</th>
          <th>جمع (تومان)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name_fa}</td>
          <td>${item.size || '-'}</td>
          <td>${item.quantity}</td>
          <td class="text-left">${fmt(item.price)}</td>
          <td class="text-left">${fmt(item.price * item.quantity)}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <table class="totals">
      <tr><td>جمع اقلام:</td><td class="text-left">${fmt(subtotal)} تومان</td></tr>
      ${order.discount_amount > 0 ? `<tr><td>تخفیف${order.coupon_code ? ` (${order.coupon_code})` : ''}:</td><td class="text-left" style="color:green">-${fmt(order.discount_amount)} تومان</td></tr>` : ''}
      <tr><td>هزینه ارسال:</td><td class="text-left">${shippingCost === 0 ? 'رایگان' : fmt(shippingCost) + ' تومان'}</td></tr>
      <tr class="total-row"><td>مبلغ نهایی:</td><td class="text-left">${fmt(order.total)} تومان</td></tr>
    </table>
  </div>

  <div class="footer">
    <p>Z7shop | فروشگاه آنلاین پوشاک مردانه</p>
    <p>Z7shop.ir@gmail.com | 021-12345678 | تهران، خیابان ولیعصر</p>
    <p style="margin-top:8px">این فاکتور به صورت الکترونیکی صادر شده و معتبر است.</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="invoice-${shortId}.html"`,
    },
  });
}
