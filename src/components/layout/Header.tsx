'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import { useLocale } from '@/hooks/useLocale';
import { useState, useEffect, useRef } from 'react';
import SearchModal from '@/components/ui/SearchModal';
import MegaMenu from '@/components/ui/MegaMenu';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMoon, HiOutlineSun, HiOutlineMenu, HiOutlineX, HiOutlineHeart, HiOutlineSearch, HiOutlineLogout, HiOutlineClipboardList, HiOutlineCog, HiOutlineStar, HiOutlineChevronDown, HiOutlineBell, HiOutlineGlobeAlt } from 'react-icons/hi';
import { toPersianNumber } from '@/i18n';
import type { Notification } from '@/types';

export default function Header() {
  const { data: session } = useSession();
  const { dict, locale, toggleLocale } = useLocale();
  const { theme, toggleTheme, cartCount, setCartOpen, compareIds } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.role === 'admin';
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setUserMenuOpen(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (session) {
      fetch('/api/wishlist/count').then(r => r.json()).then(d => setWishlistCount(d.count || 0)).catch(() => {});
      fetch('/api/notifications').then(r => r.json()).then(data => { if (Array.isArray(data)) setNotifications(data); }).catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const fmtBadge = (n: number) => locale === 'fa' ? toPersianNumber(n) : String(n);

  function relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr + 'Z').getTime();
    const diffSec = Math.max(0, Math.floor((now - then) / 1000));
    if (diffSec < 60) return locale === 'fa' ? 'لحظاتی پیش' : 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return locale === 'fa' ? `${diffMin} دقیقه پیش` : `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return locale === 'fa' ? `${diffHr} ساعت پیش` : `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return locale === 'fa' ? `${diffDay} روز پیش` : `${diffDay}d ago`;
  }

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-[#0c0c0f]/80 backdrop-blur-2xl border-b border-gray-200 dark:border-gold/[0.08] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]' : 'bg-transparent border-b border-transparent'}`}>
        {/* Top micro-bar — desktop only */}
        <div className={`hidden md:block transition-all duration-300 overflow-hidden ${scrolled ? 'h-0 opacity-0' : 'h-8 opacity-100'}`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-8 text-[11px] text-gray-600 dark:text-gray-500">
            <div className="flex items-center gap-4">
              <span>{locale === 'fa' ? 'ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان' : 'Free shipping on orders over 500K'}</span>
              <span className="w-px h-3 bg-gray-300 dark:bg-gray-700/50" />
              <Link href="/blog" className="hover:text-gold transition-colors">{locale === 'fa' ? 'مجله' : 'Magazine'}</Link>
              <Link href="/contact" className="hover:text-gold transition-colors">{locale === 'fa' ? 'تماس' : 'Contact'}</Link>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleLocale} className="hover:text-gold transition-colors font-medium">
                {dict.common.language}
              </button>
              <span className="w-px h-3 bg-gray-300 dark:bg-gray-700/50" />
              <button onClick={toggleTheme} className="hover:text-gold transition-colors flex items-center gap-1">
                {theme === 'light' ? <HiOutlineMoon className="w-3.5 h-3.5" /> : <HiOutlineSun className="w-3.5 h-3.5" />}
                {theme === 'light' ? (locale === 'fa' ? 'تاریک' : 'Dark') : (locale === 'fa' ? 'روشن' : 'Light')}
              </button>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left: Menu + Brand */}
            <div className="flex items-center gap-3 md:gap-5">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden" aria-label={locale === 'fa' ? 'منو' : 'Menu'} aria-expanded={mobileOpen}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/[0.08] transition-colors">
                  {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
                </div>
              </button>

              <Link href="/" className="flex items-center gap-2" dir="ltr">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20">
                  <span className="text-white font-black text-sm md:text-base tracking-tighter">Z7</span>
                </div>
                <span className="hidden sm:block text-lg md:text-xl font-black text-gradient tracking-tight">shop</span>
              </Link>

              <MegaMenu />
            </div>

            {/* Center: Search — desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.06] hover:border-gold/30 hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all duration-200 group"
              >
                <HiOutlineSearch className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gold transition-colors" />
                <span className="text-sm text-gray-500 dark:text-gray-500 flex-1 text-start">{dict.common.search}</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-white/[0.06] text-[10px] text-gray-500 dark:text-gray-600 font-mono border border-gray-300 dark:border-white/[0.06]">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Right: Actions — only search, cart, user menu */}
            <div className="flex items-center gap-0.5 md:gap-1">
              {/* Mobile search */}
              <button onClick={() => setSearchOpen(true)} aria-label={locale === 'fa' ? 'جستجو' : 'Search'} className="md:hidden relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] active:scale-95 transition-all duration-200">
                <HiOutlineSearch className="w-[18px] h-[18px]" />
              </button>

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} aria-label={locale === 'fa' ? 'سبد خرید' : 'Cart'} className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] active:scale-95 transition-all duration-200">
                <HiOutlineShoppingBag className="w-[18px] h-[18px] md:w-5 md:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold px-0.5 text-[9px] text-white bg-gradient-to-r from-gold to-gold-light shadow-lg shadow-gold/30 pulse-gold">
                    {fmtBadge(cartCount)}
                  </span>
                )}
              </button>

              {/* Compare */}
              {compareIds.length > 0 && (
                <Link href="/products" className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-gold hover:bg-white/[0.08] transition-all duration-200" title={locale === 'fa' ? 'مقایسه' : 'Compare'}>
                  <svg className="w-[18px] h-[18px] md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                  <span className="absolute -top-0.5 -end-0.5 bg-blue-500 text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold px-0.5">
                    {fmtBadge(compareIds.length)}
                  </span>
                </Link>
              )}

              {/* Divider */}
              <div className="w-px h-6 bg-gray-700/40 mx-1 hidden md:block" />

              {/* User Menu (contains notifications, wishlist, theme, language) */}
              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 py-1.5 px-2 md:px-3 rounded-xl hover:bg-white/[0.08] transition-all duration-200 relative"
                  >
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/20 flex items-center justify-center relative">
                      <span className="text-gold text-xs md:text-sm font-bold">
                        {(session.user?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                      {/* Red dot for unread notifications */}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0c0c0f] animate-pulse" />
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-300 max-w-[80px] truncate">
                      {session.user?.name?.split(' ')[0]}
                    </span>
                    <HiOutlineChevronDown className={`hidden md:block w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute end-0 top-full mt-2 w-72 z-50 animate-fade-in">
                        <div className="bg-[#141418]/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/40 border border-white/[0.06] overflow-hidden">
                          {/* User info */}
                          <div className="px-4 py-3 bg-gradient-to-r from-gold/[0.06] to-transparent border-b border-white/[0.06]">
                            <p className="text-sm font-semibold text-white truncate">{session.user?.name}</p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{session.user?.email}</p>
                          </div>

                          {/* Notifications section */}
                          {notifications.length > 0 && (
                            <div className="border-b border-white/[0.06]">
                              <div className="flex items-center justify-between px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <HiOutlineBell className="w-3.5 h-3.5 text-gray-500" />
                                  <span className="text-[11px] text-gray-500 font-medium">{locale === 'fa' ? 'اعلان‌ها' : 'Notifications'}</span>
                                  {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[9px] min-w-[14px] h-3.5 flex items-center justify-center rounded-full font-bold px-1">
                                      {unreadCount}
                                    </span>
                                  )}
                                </div>
                                {unreadCount > 0 && (
                                  <button onClick={markAllRead} className="text-[10px] text-gold hover:underline">
                                    {locale === 'fa' ? 'خواندن همه' : 'Mark read'}
                                  </button>
                                )}
                              </div>
                              <div className="max-h-40 overflow-y-auto">
                                {notifications.slice(0, 4).map(n => (
                                  <div key={n.id} className={`flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-white/[0.04] transition-colors ${!n.is_read ? 'bg-gold/[0.03]' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-gold' : 'bg-gray-700'}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-gray-300 font-medium truncate">{locale === 'fa' ? n.title_fa : n.title_en}</p>
                                      <p className="text-gray-600 truncate mt-0.5">{locale === 'fa' ? n.message_fa : n.message_en}</p>
                                      <p className="text-gray-700 text-[10px] mt-0.5">{relativeTime(n.created_at)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quick stats */}
                          <div className="flex items-center border-b border-white/[0.06]">
                            <Link href="/panel/wishlist" onClick={() => setUserMenuOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-gray-400 hover:text-red-400 hover:bg-white/[0.04] transition-colors">
                              <HiOutlineHeart className="w-4 h-4" />
                              <span className="text-xs font-medium">{wishlistCount}</span>
                            </Link>
                            <div className="w-px h-6 bg-white/[0.06]" />
                            <Link href="/panel/orders" onClick={() => setUserMenuOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-gray-400 hover:text-blue-400 hover:bg-white/[0.04] transition-colors">
                              <HiOutlineClipboardList className="w-4 h-4" />
                              <span className="text-xs font-medium">{locale === 'fa' ? 'سفارشات' : 'Orders'}</span>
                            </Link>
                            <div className="w-px h-6 bg-white/[0.06]" />
                            <Link href="/panel/loyalty" onClick={() => setUserMenuOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-gold hover:bg-white/[0.04] transition-colors">
                              <HiOutlineStar className="w-4 h-4" />
                              <span className="text-xs font-medium">{locale === 'fa' ? 'امتیاز' : 'Points'}</span>
                            </Link>
                          </div>

                          {/* Menu links */}
                          <div className="py-1">
                            <Link href="/panel" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                              <HiOutlineCog className="w-4 h-4 text-gray-500" />
                              {dict.common.panel}
                            </Link>
                            {isAdmin && (
                              <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold hover:bg-white/[0.06] transition-colors">
                                <HiOutlineCog className="w-4 h-4" />
                                {dict.common.admin}
                              </Link>
                            )}
                          </div>

                          {/* Settings row: theme + language */}
                          <div className="flex items-center border-t border-white/[0.06] px-2 py-1.5">
                            <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                              {theme === 'light' ? <HiOutlineMoon className="w-4 h-4" /> : <HiOutlineSun className="w-4 h-4 text-gold" />}
                              {theme === 'light' ? (locale === 'fa' ? 'حالت تاریک' : 'Dark') : (locale === 'fa' ? 'حالت روشن' : 'Light')}
                            </button>
                            <div className="w-px h-5 bg-white/[0.06]" />
                            <button onClick={toggleLocale} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                              <HiOutlineGlobeAlt className="w-4 h-4" />
                              {dict.common.language}
                            </button>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-white/[0.06] py-1">
                            <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors w-full">
                              <HiOutlineLogout className="w-4 h-4" />
                              {dict.common.logout}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="ms-1 bg-gradient-to-r from-gold to-gold-light hover:from-gold-dark hover:to-gold text-white text-xs md:text-sm font-semibold py-2 px-4 md:px-5 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 active:scale-95 transition-all duration-200 inline-flex items-center gap-1.5">
                  <HiOutlineUser className="w-4 h-4" />
                  {dict.common.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu — Slide Panel */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden mobile-menu-overlay" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 start-0 bottom-0 w-[85%] max-w-[320px] z-50 lg:hidden mobile-menu-panel">
            {/* Panel background */}
            <div className="absolute inset-0 bg-[#0e0e12] border-e border-white/[0.06]">
              <div className="absolute top-0 start-0 end-0 h-40 bg-gradient-to-b from-gold/[0.06] to-transparent" />
              <div className="absolute bottom-0 start-0 end-0 h-32 bg-gradient-to-t from-gold/[0.03] to-transparent" />
            </div>

            {/* Panel content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2" dir="ltr">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20">
                    <span className="text-white font-black text-sm">Z7</span>
                  </div>
                  <span className="text-lg font-black text-gradient">shop</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform">
                  <HiOutlineX className="w-4.5 h-4.5 text-gray-400" />
                </button>
              </div>

              {/* Scrollable area */}
              <div className="flex-1 overflow-y-auto py-4 px-4 space-y-5">
                {/* User */}
                {session ? (
                  <div className="mobile-menu-item p-3.5 rounded-xl bg-gradient-to-r from-gold/[0.07] to-transparent border border-gold/[0.1]" style={{ '--delay': '0' } as React.CSSProperties}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/25 to-gold/10 border border-gold/20 flex items-center justify-center">
                        <span className="text-gold font-bold">{(session.user?.name || 'U').charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{session.user?.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-3">
                      <Link href="/panel" onClick={() => setMobileOpen(false)} className="flex-1 py-1.5 rounded-lg bg-white/[0.06] text-center text-[11px] font-medium text-gray-300 active:scale-95 transition-transform">
                        {dict.common.panel}
                      </Link>
                      <Link href="/panel/orders" onClick={() => setMobileOpen(false)} className="flex-1 py-1.5 rounded-lg bg-white/[0.06] text-center text-[11px] font-medium text-gray-300 active:scale-95 transition-transform">
                        {locale === 'fa' ? 'سفارشات' : 'Orders'}
                      </Link>
                      <Link href="/panel/wishlist" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded-lg bg-white/[0.06] text-center text-gray-300 active:scale-95 transition-transform">
                        <HiOutlineHeart className="w-3.5 h-3.5 mx-auto" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mobile-menu-item" style={{ '--delay': '0' } as React.CSSProperties}>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-gold w-full py-3 text-sm rounded-xl">
                      <HiOutlineUser className="w-4 h-4" />
                      {dict.common.login}
                    </Link>
                  </div>
                )}

                {/* Search */}
                <div className="mobile-menu-item" style={{ '--delay': '1' } as React.CSSProperties}>
                  <button onClick={() => { setSearchOpen(true); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-500 text-sm active:scale-[0.98] transition-transform">
                    <HiOutlineSearch className="w-4 h-4 text-gold/50" />
                    {dict.common.search}
                  </button>
                </div>

                {/* Nav */}
                <nav className="mobile-menu-item space-y-0.5" style={{ '--delay': '2' } as React.CSSProperties}>
                  {[
                    { href: '/', label: dict.common.home, icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
                    { href: '/products', label: dict.common.products, icon: <HiOutlineShoppingBag className="w-[18px] h-[18px]" /> },
                    { href: '/blog', label: locale === 'fa' ? 'مجله' : 'Magazine', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
                    { href: '/about', label: locale === 'fa' ? 'درباره ما' : 'About', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                    { href: '/contact', label: locale === 'fa' ? 'تماس' : 'Contact', icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-3 px-3 rounded-xl text-gray-300 active:text-white active:bg-white/[0.06] transition-all text-sm font-medium"
                    >
                      <span className="text-gray-500">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Categories */}
                <div className="mobile-menu-item" style={{ '--delay': '3' } as React.CSSProperties}>
                  <p className="text-[10px] text-gold/50 uppercase tracking-[0.15em] font-semibold mb-2.5 px-1">{dict.categories.title}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { href: '/products?category=cat-tshirt', icon: '👕', label: dict.categories.tshirts },
                      { href: '/products?category=cat-pants', icon: '👖', label: dict.categories.pants },
                      { href: '/products?category=cat-hats', icon: '🧢', label: dict.categories.hats },
                      { href: '/products?category=cat-sport', icon: '🏃', label: dict.categories.sportswear },
                    { href: '/products?category=cat-shoes', icon: '👟', label: dict.categories.shoes },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.05] active:scale-95 active:bg-white/[0.08] transition-all"
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs text-gray-300 font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed bottom */}
              <div className="border-t border-white/[0.06] px-4 py-3 space-y-2.5 bg-[#0e0e12]">
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 active:scale-95 transition-transform">
                    {theme === 'light' ? <HiOutlineMoon className="w-4 h-4" /> : <HiOutlineSun className="w-4 h-4 text-gold" />}
                    {theme === 'light' ? (locale === 'fa' ? 'تاریک' : 'Dark') : (locale === 'fa' ? 'روشن' : 'Light')}
                  </button>
                  <button onClick={toggleLocale} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 active:scale-95 transition-transform">
                    <HiOutlineGlobeAlt className="w-4 h-4" />
                    {dict.common.language}
                  </button>
                  {session && (
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="py-2.5 px-3 rounded-lg bg-red-500/[0.08] border border-red-500/[0.1] text-red-400 active:scale-95 transition-transform">
                      <HiOutlineLogout className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-center text-[10px] text-gray-700">
                  {locale === 'fa' ? '© ۱۴۰۵ Z7shop' : '© 2026 Z7shop'}
                </p>
              </div>
            </div>
          </div>

          <style jsx>{`
            .mobile-menu-overlay {
              animation: menuOverlayIn 0.3s ease-out;
            }
            @keyframes menuOverlayIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .mobile-menu-panel {
              animation: menuPanelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes menuPanelIn {
              from { transform: translateX(${locale === 'fa' ? '100%' : '-100%'}); }
              to { transform: translateX(0); }
            }
            .mobile-menu-item {
              animation: menuItemIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
              animation-delay: calc(var(--delay, 0) * 0.06s + 0.15s);
            }
            @keyframes menuItemIn {
              from { opacity: 0; transform: translateX(${locale === 'fa' ? '20px' : '-20px'}); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>
        </>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
