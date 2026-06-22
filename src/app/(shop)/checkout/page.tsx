'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/i18n';
import toast from 'react-hot-toast';
import { HiCheck, HiOutlineLocationMarker, HiOutlineTruck, HiOutlineCreditCard } from 'react-icons/hi';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CheckoutContent />
    </Suspense>
  );
}

interface Address {
  id: string;
  title: string;
  full_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  is_default: number;
}

function CheckoutContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, dict } = useLocale();
  const setCartCount = useStore(s => s.setCartCount);

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState(searchParams.get('shipping') || 'standard');
  const [couponCode] = useState(searchParams.get('coupon') || '');
  const [processing, setProcessing] = useState(false);

  const [newAddress, setNewAddress] = useState({
    title: '', full_name: '', phone: '', province: '', city: '', address: '', postal_code: '', is_default: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (session) {
      fetch('/api/addresses').then(r => r.json()).then(data => {
        if (Array.isArray(data)) {
          setAddresses(data);
          const def = data.find((a: Address) => a.is_default);
          if (def) setSelectedAddress(def.id);
        }
      });
    }
  }, [session]);

  const saveAddress = async () => {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAddress),
    });
    if (res.ok) {
      const data = await res.json();
      const addr = { ...newAddress, id: data.id, is_default: newAddress.is_default ? 1 : 0 } as Address;
      setAddresses([...addresses, addr]);
      setSelectedAddress(data.id);
      setShowAddForm(false);
      toast.success(locale === 'fa' ? 'آدرس ذخیره شد' : 'Address saved');
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error(locale === 'fa' ? 'آدرس را انتخاب کنید' : 'Select an address');
      return;
    }

    setProcessing(true);

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address_id: selectedAddress,
        shipping_method: shippingMethod,
        coupon_code: couponCode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setCartCount(0);
      router.push(`/payment?order_id=${data.id}&amount=${data.total}`);
    } else {
      toast.error(locale === 'fa' ? 'خطا در ثبت سفارش' : 'Error placing order');
      setProcessing(false);
    }
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  const steps = [
    { num: 1, label: dict.checkout.address, icon: HiOutlineLocationMarker },
    { num: 2, label: dict.checkout.shipping, icon: HiOutlineTruck },
    { num: 3, label: dict.checkout.payment, icon: HiOutlineCreditCard },
  ];

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{dict.checkout.title}</h1>

        {/* Steps */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${step >= s.num ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                {step > s.num ? <HiCheck className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 md:w-16 h-0.5 mx-1 ${step > s.num ? 'bg-gold' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">{dict.checkout.selectAddress}</h2>

            {addresses.length > 0 && (
              <div className="space-y-3 mb-6">
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-gold bg-gold/5' : 'border-gray-200 dark:border-gray-700 hover:border-gold/50'}`}
                  >
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="hidden" />
                    <div className="flex justify-between">
                      <span className="font-medium">{addr.title}</span>
                      {addr.is_default === 1 && <span className="text-xs text-gold">{locale === 'fa' ? 'پیش‌فرض' : 'Default'}</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{addr.full_name} - {addr.phone}</p>
                    <p className="text-sm text-gray-500">{addr.province}، {addr.city}، {addr.address}</p>
                  </label>
                ))}
              </div>
            )}

            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-outline w-full mb-4">
              {dict.checkout.addNewAddress}
            </button>

            {showAddForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <input className="input-field" placeholder={locale === 'fa' ? 'عنوان (مثلاً خانه)' : 'Title (e.g. Home)'} value={newAddress.title} onChange={e => setNewAddress({ ...newAddress, title: e.target.value })} />
                <input className="input-field" placeholder={dict.auth.name} value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                <input className="input-field" placeholder={dict.auth.phone} value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} dir="ltr" />
                <input className="input-field" placeholder={locale === 'fa' ? 'استان' : 'Province'} value={newAddress.province} onChange={e => setNewAddress({ ...newAddress, province: e.target.value })} />
                <input className="input-field" placeholder={locale === 'fa' ? 'شهر' : 'City'} value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                <input className="input-field" placeholder={locale === 'fa' ? 'کد پستی' : 'Postal Code'} value={newAddress.postal_code} onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })} dir="ltr" />
                <textarea className="input-field sm:col-span-2" rows={2} placeholder={locale === 'fa' ? 'آدرس کامل' : 'Full Address'} value={newAddress.address} onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} />
                <button onClick={saveAddress} className="btn-gold sm:col-span-2">{dict.common.save}</button>
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!selectedAddress} className="btn-gold w-full py-3 disabled:opacity-50">
              {dict.common.next}
            </button>
          </div>
        )}

        {/* Step 2: Shipping */}
        {step === 2 && (
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">{dict.checkout.shipping}</h2>
            <div className="space-y-3 mb-6">
              {[
                { key: 'free', cost: 0 },
                { key: 'standard', cost: 25000 },
                { key: 'express', cost: 45000 },
              ].map(method => (
                <label
                  key={method.key}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${shippingMethod === method.key ? 'border-gold bg-gold/5' : 'border-gray-200 dark:border-gray-700 hover:border-gold/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" value={method.key} checked={shippingMethod === method.key} onChange={() => setShippingMethod(method.key)} className="accent-gold" />
                    <span>{(dict.checkout.shippingMethods as any)[method.key]}</span>
                  </div>
                  <span className="font-medium">
                    {method.cost === 0 ? dict.cart.freeShipping : `${formatPrice(method.cost, locale)} ${dict.common.currency}`}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">{dict.common.previous}</button>
              <button onClick={() => setStep(3)} className="btn-gold flex-1">{dict.common.next}</button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">{dict.checkout.payment}</h2>
            <div className="p-4 rounded-xl border-2 border-gold bg-gold/5 mb-6">
              <div className="flex items-center gap-3">
                <HiOutlineCreditCard className="w-6 h-6 text-gold" />
                <span className="font-medium">{dict.checkout.onlinePayment}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {locale === 'fa' ? 'پس از کلیک بر روی ثبت سفارش، به درگاه پرداخت منتقل خواهید شد.' : 'You will be redirected to the payment gateway after placing the order.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">{dict.common.previous}</button>
              <button onClick={placeOrder} disabled={processing} className="btn-gold flex-1 py-3">
                {processing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {locale === 'fa' ? 'در حال پردازش...' : 'Processing...'}
                  </span>
                ) : dict.checkout.placeOrder}
              </button>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
