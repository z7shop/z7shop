'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, formatDate } from '@/i18n';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const { locale, dict } = useLocale();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setOrders(data);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        toast.success(locale === 'fa' ? 'وضعیت به‌روزرسانی شد' : 'Status updated');
      } else {
        const data = await res.json();
        toast.error(data.error || (locale === 'fa' ? 'خطا در به‌روزرسانی' : 'Update failed'));
      }
    } catch {
      toast.error(locale === 'fa' ? 'خطا در ارتباط با سرور' : 'Network error');
    }
  };

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{dict.adminPanel.orders}</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'شماره' : 'ID'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'مشتری' : 'Customer'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'اقلام' : 'Items'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'مبلغ' : 'Total'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'تاریخ' : 'Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{dict.common.loading}</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{dict.panel.noOrders}</td></tr>
              ) : orders.map(order => {
                const items = JSON.parse(order.items);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user_name}</p>
                      <p className="text-xs text-gray-400">{order.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {items.map((i: any) => `${locale === 'fa' ? i.name_fa : i.name_en} x${i.quantity}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total, locale)} {dict.common.currency}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:border-gold"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{(dict.panel.orderStatus as any)[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(order.created_at, locale)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
