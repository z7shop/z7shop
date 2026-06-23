'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineBell, HiOutlineX } from 'react-icons/hi';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { locale, dict } = useLocale();
  const t = (dict as any).pushNotification;

  useEffect(() => {
    if (!session) return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (localStorage.getItem('z7-push-dismissed')) return;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [session]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setShow(false);
        return;
      }

      const res = await fetch('/api/push/vapid-key');
      const { publicKey } = await res.json();
      if (!publicKey) { setShow(false); return; }

      const reg = await navigator.serviceWorker.register('/sw.js');
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<ServiceWorkerRegistration>((_, reject) =>
          setTimeout(() => reject(new Error('SW timeout')), 5000)
        ),
      ]) || reg;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const subJson = subscription.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      setShow(false);
      localStorage.setItem('z7-push-dismissed', '1');
    } catch {
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('z7-push-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 z-50 animate-in slide-in-from-bottom-4 duration-300"
      style={{ [locale === 'fa' ? 'left' : 'right']: '1.25rem' }}>
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 shadow-2xl max-w-xs">
        <button
          onClick={handleDismiss}
          className="absolute top-2 end-2 text-gray-500 hover:text-gray-300 transition-colors p-1"
        >
          <HiOutlineX className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
            <HiOutlineBell className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">{t?.promptTitle}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t?.promptMessage}</p>
            <button
              onClick={handleEnable}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-gold text-gray-900 text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {loading
                ? (locale === 'fa' ? 'در حال فعال‌سازی...' : 'Enabling...')
                : t?.enable}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
