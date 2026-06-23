'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, formatNumber, formatDate } from '@/i18n';
import { HiOutlineCube, HiOutlineClipboardList, HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineExclamation, HiOutlineCheckCircle, HiOutlinePencil } from 'react-icons/hi';
import Link from 'next/link';

const MONTH_NAMES_FA: Record<string, string> = {
  '01': 'فروردین', '02': 'اردیبهشت', '03': 'خرداد', '04': 'تیر',
  '05': 'مرداد', '06': 'شهریور', '07': 'مهر', '08': 'آبان',
  '09': 'آذر', '10': 'دی', '11': 'بهمن', '12': 'اسفند',
};

const MONTH_NAMES_EN: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

const CAT_COLORS = ['#C9A84C', '#3B82F6', '#10B981', '#EF4444'];

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

export default function AdminDashboard() {
  const { locale, dict } = useLocale();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    setError('');
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error');
        setLoading(false);
      });
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500 text-sm">{dict.common.loading}</p>
      </div>
    </AdminLayout>
  );

  if (error || !stats) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 text-sm mb-4">{error === 'Unauthorized' ? (locale === 'fa' ? 'دسترسی ندارید. لطفاً دوباره وارد شوید.' : 'Unauthorized. Please login again.') : (locale === 'fa' ? 'خطا در بارگذاری داده‌ها' : 'Error loading data')}</p>
        <button onClick={fetchStats} className="btn-gold text-sm px-6 py-2">{locale === 'fa' ? 'تلاش مجدد' : 'Retry'}</button>
      </div>
    </AdminLayout>
  );

  const cards = [
    { label: dict.adminPanel.totalSales, value: formatPrice(stats.totalSales, locale) + ' ' + dict.common.currency, icon: HiOutlineCurrencyDollar, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
    { label: dict.adminPanel.totalOrders, value: formatNumber(stats.totalOrders, locale), icon: HiOutlineClipboardList, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { label: dict.adminPanel.totalUsers, value: formatNumber(stats.totalUsers, locale), icon: HiOutlineUsers, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    { label: dict.adminPanel.totalProducts, value: formatNumber(stats.totalProducts, locale), icon: HiOutlineCube, color: 'text-gold bg-gold/10' },
  ];

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = { pending: 'badge-pending', processing: 'badge-processing', shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled' };
    return cls[status] || 'badge-pending';
  };

  const monthlySales: { month: string; total: number }[] = stats.monthlySales || [];
  const saleValues = monthlySales.map((m: any) => m.total);
  const maxSale = saleValues.length > 0 ? Math.max(...saleValues, 1) : 1;

  const categorySales: { name_fa: string; name_en: string; total: number }[] = stats.categorySales || [];
  const catTotal = categorySales.reduce((s: number, c: any) => s + c.total, 0) || 1;

  const topProducts: { name_fa: string; name_en: string; count: number }[] = stats.topProducts || [];

  const ordersByStatus: { status: string; count: number }[] = stats.ordersByStatus || [];
  const lowStockProducts: { id: string; name_fa: string; name_en: string; stock: number }[] = stats.lowStockProducts || [];
  const totalStatusOrders = ordersByStatus.reduce((s: number, o: any) => s + o.count, 0) || 1;

  const getMonthLabel = (month: string) => {
    const parts = month.split('-');
    const m = parts[1];
    return locale === 'fa' ? (MONTH_NAMES_FA[m] || m) : (MONTH_NAMES_EN[m] || m);
  };

  let donutOffset = 0;
  const donutSegments = categorySales.map((c, i) => {
    const pct = (c.total / catTotal) * 100;
    const seg = { offset: donutOffset, pct, color: CAT_COLORS[i % CAT_COLORS.length] };
    donutOffset += pct;
    return seg;
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{dict.adminPanel.dashboard}</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="card-hover p-4 md:p-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-black animate-count">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Sales Bar Chart */}
      <div className="card p-4 md:p-6 mb-8 animate-fade-in">
        <h2 className="font-bold mb-6">{locale === 'fa' ? 'نمودار فروش ماهانه' : 'Monthly Sales Chart'}</h2>
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 600 280" className="w-full min-w-[400px]" style={{ height: 250 }}>
            {monthlySales.map((m, i) => {
              const barW = 60;
              const gap = (600 - monthlySales.length * barW) / (monthlySales.length + 1);
              const x = gap + i * (barW + gap);
              const barMaxH = 200;
              const barH = maxSale > 0 ? (m.total / maxSale) * barMaxH : 0;
              const y = 240 - barH;

              return (
                <g key={m.month}>
                  <rect x={x} y={240} width={barW} height={0} rx={6} fill="#C9A84C" opacity={0.85}>
                    <animate attributeName="height" from="0" to={barH} dur="0.7s" fill="freeze" begin={`${i * 0.1}s`} />
                    <animate attributeName="y" from="240" to={y} dur="0.7s" fill="freeze" begin={`${i * 0.1}s`} />
                  </rect>
                  <text x={x + barW / 2} y={y - 8} textAnchor="middle" className="fill-gray-400" fontSize="10" opacity="0">
                    {m.total > 0 ? (m.total >= 1000000 ? `${(m.total / 1000000).toFixed(1)}M` : formatPrice(m.total, locale)) : '0'}
                    <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin={`${i * 0.1 + 0.5}s`} />
                  </text>
                  <text x={x + barW / 2} y={265} textAnchor="middle" className="fill-gray-500" fontSize="11">
                    {getMonthLabel(m.month)}
                  </text>
                </g>
              );
            })}
            <line x1="0" y1="240" x2="600" y2="240" stroke="currentColor" strokeOpacity="0.1" />
          </svg>
        </div>
      </div>

      {/* Two-column: Category Donut + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Distribution Donut */}
        <div className="card p-4 md:p-6 animate-fade-in">
          <h2 className="font-bold mb-4">{locale === 'fa' ? 'فروش به تفکیک دسته‌بندی' : 'Sales by Category'}</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <svg viewBox="0 0 120 120" width="160" height="160" className="flex-shrink-0">
              {donutSegments.map((seg, i) => {
                const r = 50;
                const circ = 2 * Math.PI * r;
                const dashLen = (seg.pct / 100) * circ;
                const dashOff = -(seg.offset / 100) * circ;
                return (
                  <circle
                    key={i}
                    cx="60" cy="60" r={r}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${dashLen} ${circ - dashLen}`}
                    strokeDashoffset={dashOff}
                    transform="rotate(-90 60 60)"
                    opacity={0.85}
                  >
                    <animate attributeName="stroke-dasharray" from={`0 ${circ}`} to={`${dashLen} ${circ - dashLen}`} dur="0.8s" fill="freeze" begin={`${i * 0.15}s`} />
                  </circle>
                );
              })}
              <circle cx="60" cy="60" r="35" className="fill-white dark:fill-gray-900" />
              <text x="60" y="57" textAnchor="middle" className="fill-gray-400" fontSize="8">{locale === 'fa' ? 'مجموع' : 'Total'}</text>
              <text x="60" y="70" textAnchor="middle" className="fill-current font-bold" fontSize="13">{catTotal}</text>
            </svg>
            <div className="space-y-3 flex-1">
              {categorySales.map((c, i) => {
                const pct = catTotal > 0 ? Math.round((c.total / catTotal) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                    <span className="text-sm flex-1">{locale === 'fa' ? c.name_fa : c.name_en}</span>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-4 md:p-6 animate-fade-in">
          <h2 className="font-bold mb-4">{locale === 'fa' ? 'محصولات پرفروش' : 'Top Products'}</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">{locale === 'fa' ? 'داده‌ای موجود نیست' : 'No data available'}</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-gold/20 text-gold' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{locale === 'fa' ? p.name_fa : p.name_en}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {p.count} {locale === 'fa' ? 'فروش' : 'sold'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="card p-4 md:p-6 mb-8 animate-fade-in">
        <h2 className="font-bold mb-4">{locale === 'fa' ? 'وضعیت سفارش‌ها' : 'Order Status'}</h2>
        {ordersByStatus.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">{locale === 'fa' ? 'سفارشی ثبت نشده' : 'No orders yet'}</p>
        ) : (
          <div className="space-y-4">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
              const entry = ordersByStatus.find((o: any) => o.status === status);
              const count = entry ? entry.count : 0;
              const pct = totalStatusOrders > 0 ? Math.round((count / totalStatusOrders) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                      <span className="text-sm">{(dict.panel.orderStatus as any)[status]}</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      <div className="card p-4 md:p-6 mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineExclamation className={`w-5 h-5 ${lowStockProducts.length > 0 ? 'text-orange-500' : 'text-green-500'}`} />
          <h2 className="font-bold">{locale === 'fa' ? 'وضعیت موجودی' : 'Stock Status'}</h2>
          {lowStockProducts.length > 0 && (
            <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-medium">
              {lowStockProducts.length} {locale === 'fa' ? 'هشدار' : 'alerts'}
            </span>
          )}
        </div>
        {lowStockProducts.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
            <HiOutlineCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-400">{locale === 'fa' ? 'همه محصولات موجودی کافی دارند.' : 'All products are well stocked.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${p.stock === 0 ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                    {p.stock}
                  </div>
                  <span className="text-sm font-medium">{locale === 'fa' ? p.name_fa : p.name_en}</span>
                </div>
                <Link href={`/admin/products/${p.id}`} className="text-gold hover:underline text-xs flex items-center gap-1">
                  <HiOutlinePencil className="w-3.5 h-3.5" />
                  {locale === 'fa' ? 'ویرایش' : 'Edit'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold">{locale === 'fa' ? 'سفارش‌های اخیر' : 'Recent Orders'}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'شماره' : 'ID'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'مشتری' : 'Customer'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'مبلغ' : 'Total'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'تاریخ' : 'Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">{order.user_name}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total, locale)} {dict.common.currency}</td>
                  <td className="px-4 py-3"><span className={statusBadge(order.status)}>{(dict.panel.orderStatus as any)[order.status]}</span></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at, locale)}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{dict.panel.noOrders}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
