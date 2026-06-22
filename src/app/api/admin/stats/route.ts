import { NextResponse } from 'next/server';
import { dbGet, dbAll } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totalProducts = Number((await dbGet('SELECT COUNT(*) as c FROM products')).c);
  const totalUsers = Number((await dbGet('SELECT COUNT(*) as c FROM users')).c);
  const totalOrders = Number((await dbGet('SELECT COUNT(*) as c FROM orders')).c);
  const totalSales = Number((await dbGet("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status != 'cancelled'")).s);

  const recentOrders = await dbAll(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC LIMIT 10
  `);

  const ordersByStatus = await dbAll(`
    SELECT status, COUNT(*) as count FROM orders GROUP BY status
  `);

  const monthlySalesRaw = await dbAll(`
    SELECT strftime('%Y-%m', created_at) as month, COALESCE(SUM(total), 0) as total
    FROM orders WHERE status != 'cancelled'
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY month DESC LIMIT 6
  `) as { month: string; total: number }[];

  const monthMap = new Map(monthlySalesRaw.map(r => [r.month, Number(r.total)]));
  const monthlySales: { month: string; total: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlySales.push({ month: key, total: monthMap.get(key) || 0 });
  }

  const allOrders = await dbAll(`SELECT items FROM orders WHERE status != 'cancelled'`) as { items: string }[];
  const catTotals: Record<string, number> = {};
  const prodCounts: Record<string, number> = {};

  for (const row of allOrders) {
    try {
      const items = JSON.parse(row.items as string) as { product_id: string; price: number; quantity: number }[];
      for (const item of items) {
        prodCounts[item.product_id] = (prodCounts[item.product_id] || 0) + item.quantity;
      }
    } catch {}
  }

  const products = await dbAll(`SELECT id, name_fa, name_en, category_id FROM products`) as { id: string; name_fa: string; name_en: string; category_id: string }[];
  const prodMap = new Map(products.map(p => [p.id, p]));
  const categories = await dbAll(`SELECT id, name_fa, name_en FROM categories`) as { id: string; name_fa: string; name_en: string }[];
  for (const [prodId, count] of Object.entries(prodCounts)) {
    const prod = prodMap.get(prodId);
    if (prod) {
      const catId = prod.category_id;
      catTotals[catId] = (catTotals[catId] || 0) + count;
    }
  }

  const categorySales = categories.map(c => ({
    name_fa: c.name_fa,
    name_en: c.name_en,
    total: catTotals[c.id] || 0,
  }));

  const topProducts = Object.entries(prodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pid, count]) => {
      const p = prodMap.get(pid);
      return { name_fa: p?.name_fa || '', name_en: p?.name_en || '', count };
    });

  const lowStockProducts = await dbAll('SELECT id, name_fa, name_en, stock, category_id FROM products WHERE stock <= 5 ORDER BY stock ASC');

  return NextResponse.json({
    totalProducts,
    totalUsers,
    totalOrders,
    totalSales,
    recentOrders,
    ordersByStatus,
    monthlySales,
    categorySales,
    topProducts,
    lowStockProducts,
  });
}
