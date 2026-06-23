'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/i18n';
import toast from 'react-hot-toast';
import { HiMinus, HiPlus, HiOutlineTrash, HiOutlineShoppingBag, HiOutlineTag } from 'react-icons/hi';

interface CartItemData {
  id: string;
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  name_fa: string;
  name_en: string;
  price: number;
  discount_price: number | null;
  images: string;
  stock: number;
}

export default function CartPage() {
  const { data: session } = useSession();
  const { locale, dict } = useLocale();
  const setCartCount = useStore(s => s.setCartCount);

  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState('standard');

  useEffect(() => {
    if (session) {
      fetch('/api/cart')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setItems(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session]);

  const updateQuantity = async (id: string, quantity: number) => {
    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    });
    if (res.ok) {
      const data = await res.json();
      setCartCount(data.cartCount);
      if (quantity <= 0) {
        setItems(items.filter(i => i.id !== id));
      } else {
        setItems(items.map(i => i.id === id ? { ...i, quantity } : i));
      }
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
      setItems(items.filter(i => i.id !== id));
      toast.success(locale === 'fa' ? 'حذف شد' : 'Removed');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode.toUpperCase() }),
    });
    if (res.ok) {
      const data = await res.json();
      setCoupon(data);
      toast.success(dict.cart.couponApplied);
    } else {
      toast.error(dict.cart.invalidCoupon);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.discount_price || item.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingCosts: Record<string, number> = { standard: 25000, express: 45000, free: 0 };
  const shipping = shippingCosts[shippingMethod];

  const discountAmount = coupon
    ? Math.min(Math.floor(subtotal * coupon.discount_percent / 100), coupon.max_discount)
    : 0;

  const total = subtotal - discountAmount + shipping;

  if (!session) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <HiOutlineShoppingBag className="w-16 h-16 mx-auto text-gray-700 dark:text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{locale === 'fa' ? 'برای مشاهده سبد خرید وارد شوید' : 'Please login to view your cart'}</p>
          <Link href="/login" className="btn-gold">{dict.common.login}</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{dict.cart.title}</h1>

        {items.length === 0 && !loading ? (
          <div className="text-center py-20">
            <HiOutlineShoppingBag className="w-20 h-20 mx-auto text-gray-700 dark:text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-6">{dict.cart.empty}</p>
            <Link href="/products" className="btn-gold">{dict.cart.continueShopping}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => {
                const price = item.discount_price || item.price;
                const name = locale === 'fa' ? item.name_fa : item.name_en;
                return (
                  <div key={item.id} className="card p-4 flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl opacity-40">👔</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product_id}`} className="font-medium hover:text-gold transition-colors line-clamp-1">
                        {name}
                      </Link>
                      <div className="flex gap-3 mt-1 text-sm text-gray-500">
                        {item.size && <span>{dict.product.size}: {item.size}</span>}
                        {item.color && (
                          <span className="flex items-center gap-1">
                            {dict.product.color}: <span className="w-4 h-4 rounded-full border inline-block" style={{ backgroundColor: item.color }} />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-s-lg">
                            <HiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-e-lg">
                            <HiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-gold">
                          {formatPrice(price * item.quantity, locale)} {dict.common.currency}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors self-start p-1">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="card p-6 h-fit sticky top-24">
              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">{dict.cart.coupon}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <HiOutlineTag className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="WELCOME10"
                      className="input-field ps-9 text-sm uppercase"
                      dir="ltr"
                    />
                  </div>
                  <button onClick={applyCoupon} className="btn-outline text-sm px-4">
                    {dict.cart.applyCoupon}
                  </button>
                </div>
                {coupon && (
                  <div className="mt-2 text-sm text-green-600 flex items-center justify-between">
                    <span>{coupon.discount_percent}% - {coupon.code}</span>
                    <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="text-red-500 text-xs">{dict.cart.removeCoupon}</button>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">{dict.cart.shippingCalc}</label>
                <select
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="free">{dict.checkout.shippingMethods.free}</option>
                  <option value="standard">{dict.checkout.shippingMethods.standard}</option>
                  <option value="express">{dict.checkout.shippingMethods.express}</option>
                </select>
              </div>

              <div className="space-y-3 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">{dict.cart.subtotal} ({items.length} {dict.cart.itemCount})</span>
                  <span>{formatPrice(subtotal, locale)} {dict.common.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{dict.cart.shipping}</span>
                  <span>{shipping === 0 ? dict.cart.freeShipping : `${formatPrice(shipping, locale)} ${dict.common.currency}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{dict.cart.discount}</span>
                    <span>-{formatPrice(discountAmount, locale)} {dict.common.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 dark:border-gray-700 pt-3">
                  <span>{dict.cart.total}</span>
                  <span className="text-gold">{formatPrice(total, locale)} {dict.common.currency}</span>
                </div>
              </div>

              <Link
                href={`/checkout?shipping=${shippingMethod}${coupon ? `&coupon=${coupon.code}` : ''}`}
                className="btn-gold w-full mt-6 py-3.5 text-base"
              >
                {dict.cart.checkout}
              </Link>
              <Link href="/products" className="btn-ghost w-full mt-2 text-sm">
                {dict.cart.continueShopping}
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
