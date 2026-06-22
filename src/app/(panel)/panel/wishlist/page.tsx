'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PanelLayout from '@/components/layout/PanelLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/i18n';
import toast from 'react-hot-toast';
import { HiOutlineHeart, HiOutlineTrash } from 'react-icons/hi';

export default function WishlistPage() {
  const { locale, dict } = useLocale();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wishlist').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setItems(data);
      setLoading(false);
    });
  }, []);

  const removeItem = async (productId: string) => {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    if (res.ok) {
      setItems(items.filter(i => i.product_id !== productId));
      toast.success(locale === 'fa' ? 'حذف شد' : 'Removed');
    }
  };

  return (
    <PanelLayout>
      {loading ? (
        <div className="text-center py-10 text-gray-500">{dict.common.loading}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineHeart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{locale === 'fa' ? 'لیست علاقه‌مندی‌ها خالی است' : 'Wishlist is empty'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => {
            const name = locale === 'fa' ? item.name_fa : item.name_en;
            const price = item.discount_price || item.price;
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link href={`/products/${item.product_id}`} className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl opacity-40">👔</span>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product_id}`} className="font-medium hover:text-gold transition-colors line-clamp-1 block">
                    {name}
                  </Link>
                  <span className="text-gold font-bold text-sm mt-1 block">
                    {formatPrice(price, locale)} {dict.common.currency}
                  </span>
                </div>
                <button onClick={() => removeItem(item.product_id)} className="text-gray-400 hover:text-red-500 transition-colors self-start">
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </PanelLayout>
  );
}
