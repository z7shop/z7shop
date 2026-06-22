'use client';
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
  const finalPrice = discountPrice && discountPrice < price ? discountPrice : price;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden glass border-t border-gray-700/30 px-4 py-3 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-lg font-black text-gold">
            {formatPrice(finalPrice, locale)}
          </span>
          <span className="text-xs text-gray-500 ms-1">{dict.common.currency}</span>
          {discountPrice && discountPrice < price && (
            <span className="text-xs text-gray-500 line-through ms-2">
              {formatPrice(price, locale)}
            </span>
          )}
        </div>
        <button
          onClick={onAddToCart}
          disabled={disabled}
          className="btn-gold py-2.5 px-5 text-sm disabled:opacity-50"
        >
          <HiOutlineShoppingCart className="w-4 h-4" />
          {dict.product.addToCart}
        </button>
      </div>
    </div>
  );
}
