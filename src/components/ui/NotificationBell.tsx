'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/hooks/useLocale';
import type { Notification } from '@/types';
import { HiOutlineBell, HiOutlineTruck, HiOutlineTag, HiOutlineCube, HiOutlineStar, HiOutlineCheck } from 'react-icons/hi';

const iconMap: Record<string, React.ElementType> = {
  order: HiOutlineTruck,
  discount: HiOutlineTag,
  stock: HiOutlineCube,
  points: HiOutlineStar,
};

function relativeTime(dateStr: string, locale: string): string {
  const now = Date.now();
  const then = new Date(dateStr + 'Z').getTime();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return locale === 'fa' ? 'لحظاتی پیش' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return locale === 'fa' ? `${diffMin} دقیقه پیش` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return locale === 'fa' ? `${diffHr} ساعت پیش` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return locale === 'fa' ? `${diffDay} روز پیش` : `${diffDay}d ago`;
  return locale === 'fa' ? `${Math.floor(diffDay / 7)} هفته پیش` : `${Math.floor(diffDay / 7)}w ago`;
}

export default function NotificationBell() {
  const { locale } = useLocale();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!session) return;
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});
  }, [session]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!session) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-gray-800/60 transition-colors relative"
      >
        <HiOutlineBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 bg-red-500 text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold px-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-full mt-2 w-80 glass rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in border border-gray-700/30">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/30">
              <h3 className="font-bold text-sm">
                {locale === 'fa' ? 'اعلان‌ها' : 'Notifications'}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <>
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                      {locale === 'fa' ? `${unreadCount} جدید` : `${unreadCount} new`}
                    </span>
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-gold hover:underline flex items-center gap-0.5"
                    >
                      <HiOutlineCheck className="w-3 h-3" />
                      {locale === 'fa' ? 'خواندن همه' : 'Mark all read'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  {locale === 'fa' ? 'اعلانی وجود ندارد' : 'No notifications'}
                </div>
              ) : (
                notifications.map(n => {
                  const Icon = iconMap[n.type] || HiOutlineBell;
                  const title = locale === 'fa' ? n.title_fa : n.title_en;
                  const message = locale === 'fa' ? n.message_fa : n.message_en;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-800/40 transition-colors border-b border-gray-800/30 last:border-0 ${
                        !n.is_read ? 'bg-gold/5' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!n.is_read ? 'bg-gold/10 text-gold' : 'bg-gray-800/50 text-gray-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{title}</p>
                          {!n.is_read && <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{message}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{relativeTime(n.created_at, locale)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
