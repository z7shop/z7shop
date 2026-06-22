'use client';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineHome, HiOutlineSearch } from 'react-icons/hi';

export default function NotFound() {
  const { locale, dict } = useLocale();

  return (
    <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(201, 168, 76, 0.06), transparent)'
      }} />

      <div className="text-center relative z-10 animate-fade-in">
        <h1 className="text-[150px] md:text-[200px] font-black text-gradient leading-none select-none">
          {locale === 'fa' ? '۴۰۴' : '404'}
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          {locale === 'fa' ? 'صفحه مورد نظر پیدا نشد' : 'Page Not Found'}
        </h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          {locale === 'fa'
            ? 'متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا حذف شده است.'
            : 'The page you are looking for does not exist or has been removed.'}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
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
