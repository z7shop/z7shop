'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { toPersianNumber } from '@/i18n';

interface Props {
  endDate: string;
}

export default function CountdownTimer({ endDate }: Props) {
  const { locale } = useLocale();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!mounted) return null;

  const fmt = (n: number) => {
    const s = String(n).padStart(2, '0');
    return locale === 'fa' ? toPersianNumber(s) : s;
  };

  const units = [
    { value: timeLeft.days, label: locale === 'fa' ? 'روز' : 'Days' },
    { value: timeLeft.hours, label: locale === 'fa' ? 'ساعت' : 'Hrs' },
    { value: timeLeft.minutes, label: locale === 'fa' ? 'دقیقه' : 'Min' },
    { value: timeLeft.seconds, label: locale === 'fa' ? 'ثانیه' : 'Sec' },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-gold tracking-wide uppercase">
        {locale === 'fa' ? 'پایان تخفیف' : 'Sale Ends'}
      </span>
      <div className="flex gap-2">
        {units.map((u, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gray-900 dark:bg-gray-800/80 border border-gray-700/50 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <span className="text-xl font-black text-gold font-vazir">{fmt(u.value)}</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-gray-700/30" />
            </div>
            <span className="text-[10px] text-gray-500 mt-1">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
