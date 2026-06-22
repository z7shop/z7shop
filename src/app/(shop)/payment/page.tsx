'use client';
import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/i18n';
import ConfettiEffect from '@/components/ui/ConfettiEffect';
import { HiCheck, HiX, HiOutlineCreditCard, HiOutlineShieldCheck, HiOutlineLockClosed } from 'react-icons/hi';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0d]" />}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, dict } = useLocale();

  const orderId = searchParams.get('order_id') || '';
  const amount = Number(searchParams.get('amount') || 0);

  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expMonth, setExpMonth] = useState('01');
  const [expYear, setExpYear] = useState('1405');
  const [captchaInput, setCaptchaInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<'success' | 'failed' | null>(null);
  const [refNumber, setRefNumber] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);

  const captchaCode = useMemo(() => String(Math.floor(1000 + Math.random() * 9000)), []);

  useEffect(() => {
    if (!session) router.push('/login');
    if (!orderId || !amount) router.push('/');
  }, [session, orderId, amount, router]);

  const formatCardInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const parts = digits.match(/.{1,4}/g);
    return parts ? parts.join('-') : '';
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardInput(e.target.value));
  };

  const handlePay = async () => {
    if (cardNumber.replace(/-/g, '').length !== 16) return;
    if (cvv.length < 3) return;
    if (captchaInput !== captchaCode) return;

    setProcessing(true);

    const payRes = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, amount }),
    });

    if (!payRes.ok) {
      setResult('failed');
      setProcessing(false);
      return;
    }

    const { id: paymentId } = await payRes.json();

    await new Promise(r => setTimeout(r, 2000));

    const verifyRes = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_id: paymentId,
        status: 'success',
        card_number: cardNumber.replace(/-/g, ''),
      }),
    });

    if (verifyRes.ok) {
      const data = await verifyRes.json();
      setRefNumber(data.ref_number || '');
      setPointsEarned(data.points_earned || 0);
      setResult('success');
    } else {
      setResult('failed');
    }

    setProcessing(false);
  };

  const handleCancel = async () => {
    setProcessing(true);

    const payRes = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, amount }),
    });

    if (payRes.ok) {
      const { id: paymentId } = await payRes.json();
      await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, status: 'failed' }),
      });
    }

    setResult('failed');
    setProcessing(false);
  };

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = locale === 'fa'
    ? ['1405', '1406', '1407', '1408', '1409']
    : ['2026', '2027', '2028', '2029', '2030'];

  if (result === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-4">
        <ConfettiEffect active={true} />
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiCheck className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{dict.payment.success}</h2>
          <p className="text-gray-400 mb-6">{dict.payment.successMsg}</p>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{dict.payment.refNumber}</span>
              <span className="font-mono text-gold font-bold">{refNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{dict.payment.amount}</span>
              <span className="text-white font-bold">{formatPrice(amount, locale)} {dict.common.currency}</span>
            </div>
            {pointsEarned > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{dict.loyalty.points}</span>
                <span className="text-gold font-bold">+{pointsEarned}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/panel/orders')} className="btn-gold flex-1 py-3">
              {dict.panel.orders}
            </button>
            <button onClick={() => router.push('/')} className="btn-outline flex-1 py-3">
              {dict.payment.backToShop}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result === 'failed') {
    return (
      <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center animate-slide-up">
          <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiX className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{dict.payment.failed}</h2>
          <p className="text-gray-400 mb-6">{dict.payment.failedMsg}</p>
          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setCaptchaInput(''); }} className="btn-gold flex-1 py-3">
              {dict.payment.retry}
            </button>
            <button onClick={() => router.push('/')} className="btn-outline flex-1 py-3">
              {dict.payment.backToShop}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <HiOutlineLockClosed className="w-5 h-5 text-gold" />
            <span className="text-sm text-gray-400">{locale === 'fa' ? 'اتصال امن' : 'Secure Connection'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient">{dict.payment.title}</h1>
        </div>

        {/* Payment Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Bank header */}
          <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-b border-gold/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiOutlineCreditCard className="w-6 h-6 text-gold" />
                <span className="font-bold text-gold text-lg">Z7 Pay</span>
              </div>
              <HiOutlineShieldCheck className="w-6 h-6 text-gold/60" />
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Amount */}
            <div className="bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{dict.payment.amount}</p>
              <p className="text-2xl font-black text-gold">
                {formatPrice(amount, locale)} <span className="text-sm">{dict.common.currency}</span>
              </p>
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{dict.payment.cardNumber}</label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardChange}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                maxLength={19}
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/80 border border-gray-700/50 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-white text-center font-mono text-lg tracking-wider placeholder-gray-600 transition-all"
              />
            </div>

            {/* CVV + Expiry */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CVV2</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="***"
                  maxLength={4}
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/80 border border-gray-700/50 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-white text-center font-mono tracking-wider placeholder-gray-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{locale === 'fa' ? 'ماه' : 'Month'}</label>
                <select
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-gray-800/80 border border-gray-700/50 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-white text-center transition-all"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{locale === 'fa' ? 'سال' : 'Year'}</label>
                <select
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-gray-800/80 border border-gray-700/50 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-white text-center transition-all"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* CAPTCHA */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{locale === 'fa' ? 'کد امنیتی' : 'Security Code'}</label>
              <div className="flex gap-3 items-center">
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl px-6 py-3 select-none flex-shrink-0 border border-gray-600/50">
                  <span className="font-mono text-2xl tracking-[0.3em] text-gold font-bold" style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    fontStyle: 'italic',
                    letterSpacing: '0.15em',
                  }}>{captchaCode}</span>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder={locale === 'fa' ? 'کد بالا را وارد کنید' : 'Enter code'}
                  maxLength={4}
                  dir="ltr"
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-800/80 border border-gray-700/50 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-white text-center font-mono tracking-wider placeholder-gray-600 transition-all"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePay}
                disabled={processing || cardNumber.replace(/-/g, '').length !== 16 || cvv.length < 3 || captchaInput !== captchaCode}
                className="btn-gold flex-1 py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {dict.payment.processing}
                  </span>
                ) : dict.payment.pay}
              </button>
              <button
                onClick={handleCancel}
                disabled={processing}
                className="btn-outline flex-1 py-3.5 text-base text-red-400 border-red-500/30 hover:bg-red-500/10 disabled:opacity-40"
              >
                {dict.payment.cancel}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 px-6 py-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <HiOutlineLockClosed className="w-3.5 h-3.5" />
            <span>{locale === 'fa' ? 'پرداخت امن با رمزنگاری SSL' : 'Secured by SSL encryption'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
