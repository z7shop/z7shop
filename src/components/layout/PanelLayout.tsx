'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineClipboardList, HiOutlineUser, HiOutlineLocationMarker, HiOutlineHeart, HiOutlineChatAlt2, HiOutlineStar, HiOutlineUserAdd } from 'react-icons/hi';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { dict, locale } = useLocale();

  const links = [
    { href: '/panel/orders', label: dict.panel.orders, icon: HiOutlineClipboardList },
    { href: '/panel/profile', label: dict.panel.profile, icon: HiOutlineUser },
    { href: '/panel/addresses', label: dict.panel.addresses, icon: HiOutlineLocationMarker },
    { href: '/panel/wishlist', label: dict.panel.wishlist, icon: HiOutlineHeart },
    { href: '/panel/tickets', label: locale === 'fa' ? 'تیکت‌ها' : 'Tickets', icon: HiOutlineChatAlt2 },
    { href: '/panel/loyalty', label: locale === 'fa' ? 'باشگاه مشتریان' : 'Loyalty Club', icon: HiOutlineStar },
    { href: '/panel/referral', label: locale === 'fa' ? 'دعوت دوستان' : 'Invite Friends', icon: HiOutlineUserAdd },
  ];

  if (!session) return null;

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{dict.panel.title}</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-56 flex-shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto scrollbar-hide">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${pathname === l.href ? 'bg-gold/10 text-gold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <l.icon className="w-5 h-5" />
                  {l.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
