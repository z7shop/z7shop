'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PanelLayout from '@/components/layout/PanelLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, formatDate } from '@/i18n';
import { HiOutlineClipboardList, HiOutlineEye } from 'react-icons/hi';

export default function OrdersPage() {
  const { locale, dict } = useLocale();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setOrders(data);
      setLoading(false);
    });
  }, []);

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      pending: 'badge-pending',
      processing: 'badge-processing',
      shipped: 'badge-shipped',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled',
    };
    return cls[status] || 'badge-pending';
  };

  return (
    <PanelLayout>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">{dict.common.loading}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineClipboardList className="w-16 h-16 mx-auto text-gray-700 dark:text-gray-300 mb-4" />
            <p className="text-gray-500">{dict.panel.noOrders}</p>
          </div>
        ) : (
          orders.map(order => {
            const items = JSON.parse(order.items);
            return (
              <div key={order.id} className="card p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">{locale === 'fa' ? 'شماره سفارش' : 'Order'}: </span>
                    <span className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <span className={statusBadge(order.status)}>
                    {(dict.panel.orderStatus as any)[order.status]}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{locale === 'fa' ? item.name_fa : item.name_en} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity, locale)} {dict.common.currency}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                  <span className="text-sm text-gray-500">{formatDate(order.created_at, locale)}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gold">{formatPrice(order.total, locale)} {dict.common.currency}</span>
                    <Link href={`/panel/orders/${order.id}`} className="btn-ghost text-xs py-1 px-2 text-gold">
                      <HiOutlineEye className="w-4 h-4" />
                      {locale === 'fa' ? 'جزئیات' : 'View'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PanelLayout>
  );
}
