'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, formatPercent } from '@/i18n';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlineShoppingCart, HiOutlineExternalLink } from 'react-icons/hi';

export default function QuickView() {
  const { data: session } = useSession();
  const { quickView, setQuickView, setCartCount } = useStore();
  const { locale, dict } = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quickView) {
      setLoading(true);
      fetch(`/api/products/${quickView}`)
        .then((r) => r.json())
        .then((data) => {
          setProduct(data.product);
          const sizes = JSON.parse(data.product.sizes || '[]');
          const colors = JSON.parse(data.product.colors || '[]');
          if (sizes.length) setSelectedSize(sizes[0]);
          if (colors.length) setSelectedColor(colors[0]);
          setLoading(false);
        });
    } else {
      setProduct(null);
    }
  }, [quickView]);

  const addToCart = async () => {
    if (!session) {
      toast.error(locale === 'fa' ? 'ابتدا وارد شوید' : 'Please login first');
      return;
    }
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: quickView, quantity: 1, size: selectedSize, color: selectedColor }),
    });
    if (res.ok) {
      const data = await res.json();
      setCartCount(data.cartCount);
      toast.success(dict.product.addedToCart);
      setQuickView(null);
    }
  };

  if (!quickView) return null;

  const name = product ? (locale === 'fa' ? product.name_fa : product.name_en) : '';
  const desc = product ? (locale === 'fa' ? product.description_fa : product.description_en) : '';
  const sizes: string[] = product ? JSON.parse(product.sizes || '[]') : [];
  const colors: string[] = product ? JSON.parse(product.colors || '[]') : [];
  const hasDiscount = product?.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((product!.price - product!.discount_price!) / product!.price) * 100) : 0;

  return (
    <>
      <div className="overlay" onClick={() => setQuickView(null)} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl z-50 shadow-2xl overflow-y-auto animate-fade-in">
        <button onClick={() => setQuickView(null)} className="absolute top-4 end-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
          <HiOutlineX className="w-5 h-5" />
        </button>

        {loading || !product ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ) : (
          <div className="md:flex">
            <div className="md:w-1/2 aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden">
              {(() => {
                const imgs: string[] = (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })();
                return imgs[0] ? <img src={imgs[0]} alt={name} className="w-full h-full object-cover" /> : <span className="text-7xl opacity-30">👔</span>;
              })()}
            </div>
            <div className="md:w-1/2 p-6 space-y-4">
              <h2 className="text-xl font-bold">{name}</h2>

              <div>
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gold">{formatPrice(product.discount_price!, locale)} {dict.common.currency}</span>
                    <span className="text-sm text-gray-400 line-through">{formatPrice(product.price, locale)}</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-lg">{formatPercent(discountPercent, locale)}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">{formatPrice(product.price, locale)} {dict.common.currency}</span>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 leading-6 line-clamp-2">{desc}</p>

              {sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">{dict.product.size}</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button key={s} onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedSize === s ? 'border-gold bg-gold/10 text-gold' : 'border-gray-200 dark:border-gray-700'}`}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">{dict.product.color}</p>
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button key={c} onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'border-gold scale-110 ring-2 ring-gold/30' : 'border-gray-300 dark:border-gray-600'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={addToCart} disabled={product.stock === 0} className="btn-gold flex-1 py-3 disabled:opacity-50">
                  <HiOutlineShoppingCart className="w-5 h-5" />
                  {dict.product.addToCart}
                </button>
              </div>

              <Link href={`/products/${product.id}`} onClick={() => setQuickView(null)} className="btn-ghost w-full text-sm justify-center">
                <HiOutlineExternalLink className="w-4 h-4" />
                {locale === 'fa' ? 'مشاهده جزئیات' : 'View Details'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
