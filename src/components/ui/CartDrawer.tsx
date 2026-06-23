'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/i18n';
import { HiOutlineX, HiMinus, HiPlus, HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  name_fa: string;
  name_en: string;
  price: number;
  discount_price: number | null;
}

export default function CartDrawer() {
  const { data: session } = useSession();
  const { cartOpen, setCartOpen, setCartCount } = useStore();
  const { locale, dict, dir } = useLocale();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartOpen && session) {
      setLoading(true);
      fetch('/api/cart')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setItems(data);
          setLoading(false);
        });
    }
  }, [cartOpen, session]);

  const updateQty = async (id: string, quantity: number) => {
    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    });
    if (res.ok) {
      const data = await res.json();
      setCartCount(data.cartCount);
      if (quantity <= 0) setItems(items.filter((i) => i.id !== id));
      else setItems(items.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }
  };

  const removeItem = async (id: string) => {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const data = await res.json();
      setCartCount(data.cartCount);
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const subtotal = items.reduce((s, i) => s + (i.discount_price || i.price) * i.quantity, 0);

  if (!cartOpen) return null;

  return (
    <>
      <div className="overlay" onClick={() => setCartOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart.title}
        className={`slide-panel w-full max-w-md ${dir === 'rtl' ? 'start-0' : 'end-0'}`}
        style={{ transform: 'translateX(0)' }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HiOutlineShoppingBag className="w-5 h-5 text-gold" />
            {dict.cart.title}
          </h2>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label={locale === 'fa' ? 'بستن' : 'Close'}>
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!session ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{locale === 'fa' ? 'ابتدا وارد شوید' : 'Please login first'}</p>
              <Link href="/login" onClick={() => setCartOpen(false)} className="btn-gold">
                {dict.common.login}
              </Link>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineShoppingBag className="w-16 h-16 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500">{dict.cart.empty}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.discount_price || item.price;
                const name = locale === 'fa' ? item.name_fa : item.name_en;
                return (
                  <div key={item.id} className="flex gap-3 animate-fade-in">
                    <Link
                      href={`/products/${item.product_id}`}
                      onClick={() => setCartOpen(false)}
                      className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-2xl opacity-40">👔</span>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{name}</p>
                      <div className="flex gap-2 mt-0.5 text-xs text-gray-500">
                        {item.size && <span>{item.size}</span>}
                        {item.color && <span className="w-3 h-3 rounded-full border inline-block" style={{ backgroundColor: item.color }} />}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:text-gold">
                            <HiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:text-gold">
                            <HiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-gold">{formatPrice(price * item.quantity, locale)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 self-start p-1">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {session && items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>{dict.cart.subtotal}</span>
              <span className="text-gold">{formatPrice(subtotal, locale)} {dict.common.currency}</span>
            </div>
            <Link href="/cart" onClick={() => setCartOpen(false)} className="btn-outline w-full py-3">
              {dict.cart.title}
            </Link>
            <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-gold w-full py-3">
              {dict.cart.checkout}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
