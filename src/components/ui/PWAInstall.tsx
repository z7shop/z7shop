'use client';
import { useEffect, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineDownload, HiOutlineX } from 'react-icons/hi';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const { dict } = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('pwa-dismissed');
      if (!dismissed) setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 start-4 end-4 md:start-auto md:end-4 md:w-80 z-50 animate-slide-up">
      <div className="glass rounded-2xl p-4 border border-gold/20 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
            <HiOutlineDownload className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{(dict.pwa as any).install}</p>
            <p className="text-xs text-gray-400 mt-0.5">{(dict.pwa as any).installDesc}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleInstall} className="btn-gold text-xs px-4 py-1.5">
                {(dict.pwa as any).installButton}
              </button>
              <button onClick={handleDismiss} className="btn-ghost text-xs px-3 py-1.5">
                {(dict.pwa as any).dismiss}
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-500 hover:text-white">
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
