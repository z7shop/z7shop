'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PanelLayout from '@/components/layout/PanelLayout';
import OrderTimeline from '@/components/ui/OrderTimeline';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, formatDate } from '@/i18n';
import { HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineDownload } from 'react-icons/hi';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { locale, dict } = useLocale();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const BackArrow = locale === 'fa' ? HiOutlineArrowRight : HiOutlineArrowLeft;

  useEffect(() => {
    if (!session) return;
    fetch(`/api/orders/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, session]);

  if (!session) return null;

  if (loading) return (
    <PanelLayout>
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    </PanelLayout>
  );

  if (!order) return (
    <PanelLayout>
      <div className="text-center py-20 text-gray-500">
        {locale === 'fa' ? 'سفارش یافت نشد' : 'Order not found'}
      </div>
    </PanelLayout>
  );

  const items = JSON.parse(order.items);
  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const shippingCost = order.shipping_method === 'express' ? 45000 : order.shipping_method === 'standard' ? 25000 : 0;

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = { pending: 'badge-pending', processing: 'badge-processing', shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled' };
    return cls[status] || 'badge-pending';
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button onClick={() => router.push('/panel/orders')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <BackArrow className="w-4 h-4" />
            {locale === 'fa' ? 'بازگشت به سفارش‌ها' : 'Back to Orders'}
          </button>
          <a href={`/api/orders/${id}/invoice`} target="_blank" className="btn-outline text-xs py-2 px-4">
            <HiOutlineDownload className="w-4 h-4" />
            {locale === 'fa' ? 'دانلود فاکتور' : 'Download Invoice'}
          </a>
        </div>

        {/* Order Info + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4">{locale === 'fa' ? 'وضعیت سفارش' : 'Order Status'}</h3>
            <OrderTimeline status={order.status} createdAt={order.created_at} updatedAt={order.updated_at} />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">{locale === 'fa' ? 'شماره سفارش' : 'Order ID'}</p>
                  <p className="font-mono font-bold text-gold">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <span className={statusBadge(order.status)}>{(dict.panel.orderStatus as any)[order.status]}</span>
              </div>
              <p className="text-xs text-gray-500">{locale === 'fa' ? 'تاریخ ثبت' : 'Date'}: {formatDate(order.created_at, locale)}</p>
            </div>

            {/* Items */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm">{locale === 'fa' ? 'اقلام سفارش' : 'Order Items'}</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{locale === 'fa' ? item.name_fa : item.name_en}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.size && <span>{locale === 'fa' ? 'سایز' : 'Size'}: {item.size}</span>}
                        {item.size && item.color && <span className="mx-1.5">|</span>}
                        {item.color && (
                          <span className="inline-flex items-center gap-1">
                            {locale === 'fa' ? 'رنگ' : 'Color'}: <span className="w-3 h-3 rounded-full inline-block border border-gray-600" style={{ backgroundColor: item.color }} />
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-medium">{formatPrice(item.price * item.quantity, locale)} {dict.common.currency}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{dict.cart.subtotal}</span>
                  <span>{formatPrice(subtotal, locale)} {dict.common.currency}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>{dict.cart.discount}</span>
                    <span>-{formatPrice(order.discount_amount, locale)} {dict.common.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{dict.cart.shipping}</span>
                  <span>{shippingCost === 0 ? dict.cart.freeShipping : `${formatPrice(shippingCost, locale)} ${dict.common.currency}`}</span>
                </div>
                <div className="flex justify-between font-bold text-gold pt-2 border-t border-gray-700/30">
                  <span>{dict.cart.total}</span>
                  <span>{formatPrice(order.total, locale)} {dict.common.currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
