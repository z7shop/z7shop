'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/i18n';
import { HiOutlineShoppingCart } from 'react-icons/hi';

interface Props {
  price: number;
  discountPrice?: number | null;
  onAddToCart: () => void;
  disabled?: boolean;
}

export default function StickyMobileBar({ price, discountPrice, onAddToCart, disabled }: Props) {
  const { locale, dict } = useLocale();
  const [visible, setVisible] = useState(false);
  const finalPrice = discountPrice && discountPrice < price ? discountPrice : price;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice!) / price) * 100) : 0;

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`fixed bottom-0 inset-x-0 z-40 md:hidden glass border-t border-gray-700/30 px-4 py-3 transition-transform duration-300 ${
      visible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-gold">
              {formatPrice(finalPrice, locale)}
            </span>
            <span className="text-xs text-gray-500">{dict.common.currency}</span>
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-gray-500 line-through">
                {formatPrice(price, locale)}
              </span>
              <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded-full">
                {discountPercent}%
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onAddToCart}
          disabled={disabled}
          className="btn-gold py-3 px-6 text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <HiOutlineShoppingCart className="w-5 h-5" />
          {dict.product.addToCart}
        </button>
      </div>
    </div>
  );
}
