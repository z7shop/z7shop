'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineX } from 'react-icons/hi';

const STORAGE_KEY = 'z7shop-announcement-closed';

export default function AnnouncementBar() {
  const { locale } = useLocale();
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val !== 'true') setClosed(false);
  }, []);

  const close = () => {
    setClosed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (closed) return null;

  const text =
    locale === 'fa'
      ? 'ارسال رایگان بالای ۵۰۰ هزار تومان  ✦  کد تخفیف: WELCOME10  ✦  ۳۰٪ تخفیف تابستانه  ✦  ضمانت بازگشت ۷ روزه'
      : 'Free shipping over 500K  ✦  Coupon: WELCOME10  ✦  30% Summer Sale  ✦  7-Day Return Guarantee';

  return (
    <div className="relative bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white text-xs font-medium overflow-hidden z-50">
      <div className="flex items-center h-9">
        <div className="animate-marquee whitespace-nowrap flex gap-16 px-4">
          <span>{text}</span>
          <span>{text}</span>
        </div>
      </div>
      <button
        onClick={close}
        className="absolute end-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <HiOutlineX className="w-3.5 h-3.5" />
      </button>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        [dir='rtl'] .animate-marquee {
          animation: marquee-rtl 30s linear infinite;
        }
        @keyframes marquee-rtl {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
      `}</style>
    </div>
  );
}
