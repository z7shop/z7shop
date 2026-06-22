'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/hooks/useLocale';
import { useStore } from '@/store/useStore';
import { HiOutlineChartBar, HiOutlineCube, HiOutlineClipboardList, HiOutlineUsers, HiOutlineArrowLeft, HiOutlineMoon, HiOutlineSun, HiOutlineChatAlt2, HiOutlineDocumentText, HiOutlineTag, HiOutlinePhotograph, HiOutlineCollection } from 'react-icons/hi';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { dict, locale, toggleLocale } = useLocale();
  const { theme, toggleTheme } = useStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{dict.common.loading}</p>
        </div>
      </div>
    );
  }
  if (!session || (session.user as any)?.role !== 'admin') return null;

  const links = [
    { href: '/admin', label: dict.adminPanel.dashboard, icon: HiOutlineChartBar },
    { href: '/admin/products', label: dict.adminPanel.products, icon: HiOutlineCube },
    { href: '/admin/orders', label: dict.adminPanel.orders, icon: HiOutlineClipboardList },
    { href: '/admin/users', label: dict.adminPanel.users, icon: HiOutlineUsers },
    { href: '/admin/chat', label: locale === 'fa' ? 'چت آنلاین' : 'Live Chat', icon: HiOutlineChatAlt2 },
    { href: '/admin/tickets', label: locale === 'fa' ? 'تیکت‌ها' : 'Tickets', icon: HiOutlineChatAlt2 },
    { href: '/admin/coupons', label: locale === 'fa' ? 'کد تخفیف' : 'Coupons', icon: HiOutlineTag },
    { href: '/admin/blog', label: locale === 'fa' ? 'بلاگ' : 'Blog', icon: HiOutlineDocumentText },
    { href: '/admin/bundles', label: locale === 'fa' ? 'پکیج‌ها' : 'Bundles', icon: HiOutlineCollection },
    { href: '/admin/banners', label: locale === 'fa' ? 'بنرها' : 'Banners', icon: HiOutlinePhotograph },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:block">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-gold">{dict.common.brand}</Link>
          <p className="text-xs text-gray-400 mt-1">{dict.adminPanel.title}</p>
        </div>
        <nav className="px-3 space-y-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${pathname === l.href ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <l.icon className="w-5 h-5" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-800 absolute bottom-0 w-64">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              <HiOutlineArrowLeft className="w-4 h-4" />
              {dict.common.home}
            </Link>
            <div className="flex gap-2">
              <button onClick={toggleLocale} className="text-xs text-gray-400 hover:text-white">{dict.common.language}</button>
              <button onClick={toggleTheme} className="text-gray-400 hover:text-white">
                {theme === 'light' ? <HiOutlineMoon className="w-4 h-4" /> : <HiOutlineSun className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-gray-900 text-white p-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gold">{dict.common.brand}</Link>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`text-xs whitespace-nowrap px-2 py-1 rounded ${pathname === l.href ? 'text-gold' : 'text-gray-400'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-8 md:pt-8 pt-16 overflow-auto">
        {children}
      </main>
    </div>
  );
}
