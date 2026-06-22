'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/i18n';
import { HiOutlineX } from 'react-icons/hi';

interface ProductInfo {
  id: string;
  name_fa: string;
  name_en: string;
  price: number;
  discount_price: number | null;
}

export default function CompareDrawer() {
  const { locale } = useLocale();
  const { compareIds, removeCompare, clearCompare } = useStore();
  const [products, setProducts] = useState<ProductInfo[]>([]);

  useEffect(() => {
    if (compareIds.length === 0) {
      setProducts([]);
      return;
    }
    Promise.all(
      compareIds.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => r.json())
          .then((d) => d.product as ProductInfo)
          .catch(() => null)
      )
    ).then((results) => setProducts(results.filter(Boolean) as ProductInfo[]));
  }, [compareIds]);

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 glass border-t border-gray-700/30 px-4 py-3 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {products.map((p) => {
            const name = locale === 'fa' ? p.name_fa : p.name_en;
            const price = p.discount_price || p.price;
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-2 flex-shrink-0 border border-gray-700/30"
              >
                <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center text-sm">
                  👔
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate max-w-[100px]">{name}</p>
                  <p className="text-[10px] text-gold font-bold">
                    {formatPrice(price, locale)}
                  </p>
                </div>
                <button
                  onClick={() => removeCompare(p.id)}
                  className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400"
                >
                  <HiOutlineX className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 hidden sm:inline">
            {locale === 'fa'
              ? `${compareIds.length} محصول`
              : `${compareIds.length} items`}
          </span>
          {compareIds.length >= 2 && (
            <Link
              href={`/products?compare=${compareIds.join(',')}`}
              className="btn-gold py-2 px-4 text-xs"
            >
              {locale === 'fa' ? 'مقایسه' : 'Compare'}
            </Link>
          )}
          <button
            onClick={clearCompare}
            className="text-xs text-gray-500 hover:text-red-400 px-2 py-1"
          >
            {locale === 'fa' ? 'حذف همه' : 'Clear'}
          </button>
        </div>
      </div>
    </div>
  );
}
