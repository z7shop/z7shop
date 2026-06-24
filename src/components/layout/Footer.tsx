'use client';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineRefresh, HiOutlineHeart } from 'react-icons/hi';
import { FaInstagram, FaTelegram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  const { dict, locale } = useLocale();
  const fa = locale === 'fa';

  const guarantees = [
    { icon: HiOutlineShieldCheck, title: fa ? 'اصالت کالا' : 'Authentic', desc: fa ? 'تضمین اورجینال بودن' : 'Guaranteed original' },
    { icon: HiOutlineTruck, title: fa ? 'ارسال سریع' : 'Fast Delivery', desc: fa ? 'سراسر کشور' : 'Nationwide' },
    { icon: HiOutlineRefresh, title: fa ? 'بازگشت آسان' : 'Easy Return', desc: fa ? 'هفت روز ضمانت' : '7-Day guarantee' },
  ];

  const linkSections = [
    {
      title: dict.footer.quickLinks,
      links: [
        { href: '/', label: dict.common.home },
        { href: '/products', label: dict.common.products },
        { href: '/products?category=cat-tshirt', label: dict.categories.tshirts },
        { href: '/products?category=cat-pants', label: dict.categories.pants },
        { href: '/products?category=cat-sport', label: dict.categories.sportswear },
        { href: '/products?category=cat-shoes', label: dict.categories.shoes },
        { href: '/blog', label: fa ? 'مجله' : 'Magazine' },
      ],
    },
    {
      title: fa ? 'حساب کاربری' : 'Account',
      links: [
        { href: '/login', label: dict.common.login },
        { href: '/register', label: dict.common.register },
        { href: '/panel/orders', label: dict.panel.orders },
        { href: '/panel/wishlist', label: dict.panel.wishlist },
        { href: '/panel/tickets', label: fa ? 'پشتیبانی' : 'Support' },
      ],
    },
    {
      title: fa ? 'اطلاعات' : 'Information',
      links: [
        { href: '/about', label: fa ? 'درباره ما' : 'About Us' },
        { href: '/contact', label: fa ? 'تماس با ما' : 'Contact Us' },
        { href: '/terms', label: fa ? 'قوانین' : 'Terms' },
        { href: '/privacy', label: fa ? 'حریم خصوصی' : 'Privacy' },
        { href: '/faq', label: fa ? 'سوالات متداول' : 'FAQ' },
      ],
    },
  ];

  const socials = [
    { icon: FaInstagram, hover: 'hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400' },
    { icon: FaTelegram, hover: 'hover:bg-[#0088cc]' },
    { icon: FaTwitter, hover: 'hover:bg-[#1DA1F2]' },
  ];

  return (
    <footer className="relative mt-10 md:mt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gray-100 dark:bg-[#08080a]" />

      {/* Trust badges */}
      <div className="relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {guarantees.map((g, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 md:gap-3 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/10 flex items-center justify-center group-hover:border-gold/30 group-hover:from-gold/15 transition-all duration-300">
                  <g.icon className="w-5 h-5 md:w-6 md:h-6 text-gold" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white/90">{g.title}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 hidden sm:block">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-800/50 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6">

          {/* Brand + Contact */}
          <div className="md:col-span-4 text-center md:text-start">
            <Link href="/" className="inline-block mb-5">
              <span className="text-3xl font-black text-gradient tracking-tight">Z7</span>
              <span className="text-sm font-light text-gold/50 tracking-[0.3em] ms-1">SHOP</span>
            </Link>
            <p className="text-xs leading-6 text-gray-500 mb-6 max-w-[280px] mx-auto md:mx-0">{dict.footer.aboutText}</p>

            {/* Contact info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:Z7shop.ir@gmail.com" className="flex items-center gap-3 group justify-center md:justify-start">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/5 group-hover:border-gold/20 group-hover:bg-gold/10 transition-all duration-300">
                  <HiOutlineMail className="w-3.5 h-3.5 text-gold/70 group-hover:text-gold transition-colors" />
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{dict.footer.email}</span>
              </a>
              <a href="tel:02112345678" className="flex items-center gap-3 group justify-center md:justify-start">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/5 group-hover:border-gold/20 group-hover:bg-gold/10 transition-all duration-300">
                  <HiOutlinePhone className="w-3.5 h-3.5 text-gold/70 group-hover:text-gold transition-colors" />
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" dir="ltr">{dict.footer.phone}</span>
              </a>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/5 flex-shrink-0">
                  <HiOutlineLocationMarker className="w-3.5 h-3.5 text-gold/70" />
                </div>
                <span className="text-xs text-gray-500 leading-5">{dict.footer.address}</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex justify-center md:justify-start gap-2">
              {socials.map((s, i) => (
                <a key={i} href="#" className={`w-9 h-9 flex items-center justify-center rounded-xl bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/5 ${s.hover} hover:border-transparent hover:scale-110 transition-all duration-300 text-gray-500 hover:text-white`}>
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-3 gap-6 md:gap-8">
              {linkSections.map((section, si) => (
                <div key={si}>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white/80 mb-4 pb-2 border-b border-gold/20">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((l, li) => (
                      <li key={li}>
                        <Link
                          href={l.href}
                          className="text-[11px] md:text-xs text-gray-500 hover:text-gold hover:ps-1.5 transition-all duration-200 block"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-800/50 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-gray-600 flex items-center gap-1">
              {dict.footer.rights}
            </p>
            <p className="text-[11px] text-gray-700 flex items-center gap-1">
              {fa ? 'ساخته شده با' : 'Made with'}
              <HiOutlineHeart className="w-3 h-3 text-red-500/60" />
              {fa ? 'در ایران' : 'in Iran'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
