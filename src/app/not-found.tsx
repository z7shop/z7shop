'use client';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineHome, HiOutlineSearch } from 'react-icons/hi';

export default function NotFound() {
  const { locale, dict } = useLocale();
  const fa = locale === 'fa';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0c0f] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(201, 168, 76, 0.06), transparent)'
      }} />

      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full bg-gold/30 animate-float" style={{
          top: `${15 + i * 14}%`,
          left: `${10 + i * 15}%`,
          animationDelay: `${i * 0.8}s`,
          animationDuration: `${3 + i * 0.5}s`,
        }} />
      ))}

      <div className="text-center relative z-10">
        <div className="relative inline-block mb-6">
          <span className="text-[140px] md:text-[200px] font-black leading-none select-none text-transparent" style={{
            WebkitTextStroke: '2px rgba(201,168,76,0.15)',
          }}>
            {fa ? '۴۰۴' : '404'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[140px] md:text-[200px] font-black leading-none select-none text-gradient">
            {fa ? '۴۰۴' : '404'}
          </span>
        </div>

        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />

        <h2 className="text-xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          {fa ? 'صفحه مورد نظر پیدا نشد' : 'Page Not Found'}
        </h2>
        <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto leading-relaxed">
          {fa
            ? 'متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا حذف شده است.'
            : 'The page you are looking for does not exist or has been removed.'}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-gold px-8 py-3">
            <HiOutlineHome className="w-5 h-5" />
            {dict.common.home}
          </Link>
          <Link href="/products" className="btn-outline px-8 py-3">
            <HiOutlineSearch className="w-5 h-5" />
            {dict.common.products}
          </Link>
        </div>
      </div>
    </div>
  );
}
