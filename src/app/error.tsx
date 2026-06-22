'use client';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineRefresh, HiOutlineHome } from 'react-icons/hi';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { locale } = useLocale();
  const isFa = locale === 'fa';

  return (
    <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">!</span>
        </div>
        <h1 className="text-2xl font-bold mb-3 text-white">
          {isFa ? 'خطایی رخ داد' : 'Something went wrong'}
        </h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          {isFa
            ? 'متأسفانه مشکلی پیش آمده. لطفاً دوباره تلاش کنید.'
            : 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-gold px-6 py-3">
            <HiOutlineRefresh className="w-5 h-5" />
            {isFa ? 'تلاش مجدد' : 'Try Again'}
          </button>
          <Link href="/" className="btn-outline px-6 py-3">
            <HiOutlineHome className="w-5 h-5" />
            {isFa ? 'صفحه اصلی' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
