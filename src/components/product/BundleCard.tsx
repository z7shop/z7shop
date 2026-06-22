'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/hooks/useLocale';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/i18n';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlineShoppingCart } from 'react-icons/hi';

interface BundleWithProducts {
  id: string;
  name_fa: string;
  name_en: string;
  description_fa: string;
  description_en: string;
  discount_percent: number;
  image: string;
  products: Product[];
}

export default function BundleCard({ bundle }: { bundle: BundleWithProducts }) {
  const { locale, dict } = useLocale();
  const { data: session } = useSession();
  const setCartCount = useStore(s => s.setCartCount);
  const [adding, setAdding] = useState(false);

  const name = locale === 'fa' ? bundle.name_fa : bundle.name_en;
  const desc = locale === 'fa' ? bundle.description_fa : bundle.description_en;

  const originalTotal = bundle.products.reduce((sum, p) => {
    return sum + (p.discount_price || p.price);
  }, 0);
  const bundlePrice = Math.round(originalTotal * (1 - bundle.discount_percent / 100));
  const savings = originalTotal - bundlePrice;

  const addBundleToCart = async () => {
    if (!session) {
      toast.error(locale === 'fa' ? 'لطفاً ابتدا وارد شوید' : 'Please login first');
      return;
    }
    setAdding(true);
    const res = await fetch('/api/cart/bundle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bundle_id: bundle.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setCartCount(data.cartCount);
      toast.success(locale === 'fa' ? 'پکیج به سبد خرید اضافه شد' : 'Bundle added to cart');
    } else {
      toast.error(locale === 'fa' ? 'خطا' : 'Error');
    }
    setAdding(false);
  };

  return (
    <div className="group card relative overflow-hidden rounded-2xl border border-gold/20 hover:border-gold/50 transition-all duration-500 bg-gray-900/50 backdrop-blur-sm">
      {/* Discount Badge */}
      <div className="absolute top-3 end-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
        {bundle.discount_percent}% {locale === 'fa' ? 'تخفیف' : 'OFF'}
      </div>

      {/* Product Thumbnails Grid */}
      <div className="grid grid-cols-2 gap-1 p-2">
        {bundle.products.slice(0, 4).map((product) => {
          const imgs: string[] = (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })();
          return (
            <Link key={product.id} href={`/products/${product.id}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
              {imgs[0] && (
                <img
                  src={imgs[0]}
                  alt={locale === 'fa' ? product.name_fa : product.name_en}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-1 start-1 end-1 text-[10px] text-white truncate px-1">
                {locale === 'fa' ? product.name_fa : product.name_en}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Info */}
      <div className="p-4 pt-2">
        <h3 className="font-bold text-sm mb-1 text-gold">{name}</h3>
        {desc && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{desc}</p>}

        {/* Prices */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg font-black text-gold">
            {formatPrice(bundlePrice, locale)} <span className="text-xs font-normal">{dict.common.currency}</span>
          </span>
          <span className="text-sm text-gray-500 line-through">
            {formatPrice(originalTotal, locale)}
          </span>
        </div>

        {/* Savings */}
        <div className="text-xs text-green-400 mb-3">
          {locale === 'fa' ? dict.bundles.savings : dict.bundles.savings}: {formatPrice(savings, locale)} {dict.common.currency}
        </div>

        {/* Add to Cart */}
        <button
          onClick={addBundleToCart}
          disabled={adding}
          className="w-full btn-gold py-2.5 text-sm disabled:opacity-50"
        >
          <HiOutlineShoppingCart className="w-4 h-4" />
          {adding ? '...' : (locale === 'fa' ? dict.bundles.addToCart : dict.bundles.addToCart)}
        </button>
      </div>
    </div>
  );
}
