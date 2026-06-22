'use client';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';
import CartDrawer from '@/components/ui/CartDrawer';
import QuickView from '@/components/ui/QuickView';
import BackToTop from '@/components/ui/BackToTop';
import AnnouncementBar from '@/components/ui/AnnouncementBar';
import ProgressBar from '@/components/ui/ProgressBar';
import CompareDrawer from '@/components/ui/CompareDrawer';
import SupportButton from '@/components/ui/SupportButton';
import PWAInstall from '@/components/ui/PWAInstall';
import PushNotificationPrompt from '@/components/ui/PushNotificationPrompt';
import SplashScreen from '@/components/ui/SplashScreen';
import CustomCursor from '@/components/ui/CustomCursor';

export default function Providers({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.theme);
  const locale = useStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [theme, locale]);

  return (
    <SessionProvider>
      <SplashScreen />
      <CustomCursor />
      <ProgressBar />
      <AnnouncementBar />
      {children}
      <CartDrawer />
      <QuickView />
      <CompareDrawer />
      <BackToTop />
      <SupportButton />
      <PWAInstall />
      <PushNotificationPrompt />
      <Toaster
        position={locale === 'fa' ? 'top-left' : 'top-right'}
        toastOptions={{
          className: `font-vazir !rounded-xl !shadow-lg ${theme === 'dark' ? '!bg-gray-800 !text-gray-100' : ''}`,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#fff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            border: theme === 'dark' ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(229, 231, 235, 0.5)',
          },
          duration: 3000,
        }}
      />
    </SessionProvider>
  );
}
