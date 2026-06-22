'use client';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { useStore } from '@/store/useStore';
import { formatPrice, formatPercent, toPersianNumber } from '@/i18n';
import type { Product } from '@/types';
import { HiOutlineHeart, HiHeart, HiOutlineEye, HiOutlineShoppingCart, HiOutlineSwitchHorizontal } from 'react-icons/hi';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { locale, dict } = useLocale();
  const { data: session } = useSession();
  const { setQuickView, setCartCount, addCompare, compareIds, removeCompare } = useStore();
  const isCompared = compareIds.includes(product.id);
  const [liked, setLiked] = useState(false);

  const name = locale === 'fa' ? product.name_fa : product.name_en;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const colors: string[] = (() => {
    try { return JSON.parse(product.colors); }
    catch { return []; }
  })();

  const quickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      toast.error(locale === 'fa' ? 'ابتدا وارد شوید' : 'Please login first');
      return;
    }
    const sizes = (() => { try { return JSON.parse(product.sizes); } catch { return []; } })();
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        quantity: 1,
        size: sizes[0] || '',
        color: colors[0] || '',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setCartCount(data.cartCount);
      toast.success(dict.product.addedToCart);
    }
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      toast.error(locale === 'fa' ? 'ابتدا وارد شوید' : 'Please login first');
      return;
    }
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.action === 'added');
    }
  };

  const images: string[] = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
  const hasSecondImage = images.length > 1;

  return (
    <div className="group product-card-glow overflow-hidden rounded-xl md:rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] bg-white backdrop-blur-sm border border-white/[0.06] dark:border-white/[0.06] border-gray-100 hover:border-gold/30 transition-all duration-500">
      <Link href={`/products/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-800/60 to-gray-900/80 flex items-center justify-center relative overflow-hidden">
          {images.length > 0 ? (
            <>
              <img src={images[0]} alt={name} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${hasSecondImage ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-105'}`} />
              {hasSecondImage && (
                <img src={images[1]} alt={name} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-100 transition-all duration-700" />
              )}
            </>
          ) : (
            <span className="text-6xl opacity-20">👔</span>
          )}

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickView(product.id); }}
              className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-200 transform translate-y-4 group-hover:translate-y-0"
              title={locale === 'fa' ? 'نمایش سریع' : 'Quick View'}
            >
              <HiOutlineEye className="w-5 h-5" />
            </button>
            <button
              onClick={quickAdd}
              className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-200 transform translate-y-4 group-hover:translate-y-0 delay-75"
              title={dict.product.addToCart}
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={toggleLike}
              className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-200 transform translate-y-4 group-hover:translate-y-0 delay-100"
              title={dict.product.addToWishlist}
            >
              {liked ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5" />}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isCompared) removeCompare(product.id);
                else addCompare(product.id);
              }}
              className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 transform translate-y-4 group-hover:translate-y-0 delay-150 ${isCompared ? 'bg-gold text-white' : 'bg-white/90 dark:bg-gray-800/90 hover:bg-gold hover:text-white'}`}
              title={locale === 'fa' ? 'مقایسه' : 'Compare'}
            >
              <HiOutlineSwitchHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {hasDiscount && (
          <span className="absolute top-2 start-2 md:top-3 md:start-3 bg-red-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg shadow-lg font-vazir">
            {formatPercent(discountPercent, locale)}
          </span>
        )}

        {product.is_new && (
          <span className="absolute top-2 end-2 md:top-3 md:end-3 bg-gradient-to-r from-gold to-gold-light text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg shadow-lg">
            {locale === 'fa' ? 'جدید' : 'NEW'}
          </span>
        )}
      </Link>

      <div className="p-2.5 md:p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-xs md:text-sm mb-1.5 md:mb-2 line-clamp-1 group-hover:text-gold transition-colors">
            {name}
          </h3>
        </Link>

        {colors.length > 0 && (
          <div className="flex gap-1 md:gap-1.5 mb-2 md:mb-3">
            {colors.slice(0, 4).map((c, i) => (
              <span key={i} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full border border-gray-600/30 shadow-sm" style={{ backgroundColor: c }} />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] md:text-xs text-gray-500">+{colors.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            {hasDiscount ? (
              <div>
                <span className="text-[10px] md:text-xs text-gray-500 line-through block">
                  {formatPrice(product.price, locale)}
                </span>
                <span className="text-gold font-bold text-xs md:text-sm">
                  {formatPrice(product.discount_price!, locale)} {dict.common.currency}
                </span>
              </div>
            ) : (
              <span className="font-bold text-xs md:text-sm">
                {formatPrice(product.price, locale)} {dict.common.currency}
              </span>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[8px] md:text-[10px] text-orange-400 font-medium font-vazir">
              {locale === 'fa' ? `فقط ${toPersianNumber(product.stock)} عدد` : `Only ${product.stock} left`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
