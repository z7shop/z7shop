'use client';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineRefresh, HiOutlineHome, HiOutlineExclamation } from 'react-icons/hi';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { locale } = useLocale();
  const fa = locale === 'fa';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0c0f] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(239, 68, 68, 0.04), transparent)'
      }} />

      <div className="text-center max-w-md relative z-10">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto animate-pulse">
            <HiOutlineExclamation className="w-10 h-10 text-red-400" />
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full border border-red-500/10 mx-auto animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          {fa ? 'خطایی رخ داد' : 'Something went wrong'}
        </h1>
        <p className="text-gray-500 mb-4 text-sm leading-relaxed">
          {fa
            ? 'متأسفانه مشکلی پیش آمده. لطفاً دوباره تلاش کنید.'
            : 'An unexpected error occurred. Please try again.'}
        </p>

        {error?.message && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 mb-8 text-xs text-red-400/70 font-mono text-start overflow-hidden">
            <p className="truncate">{error.message}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-gold px-6 py-3">
            <HiOutlineRefresh className="w-5 h-5" />
            {fa ? 'تلاش مجدد' : 'Try Again'}
          </button>
          <Link href="/" className="btn-outline px-6 py-3">
            <HiOutlineHome className="w-5 h-5" />
            {fa ? 'صفحه اصلی' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
