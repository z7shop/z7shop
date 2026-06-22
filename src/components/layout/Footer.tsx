'use client';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineRefresh } from 'react-icons/hi';
import { FaInstagram, FaTelegram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  const { dict, locale } = useLocale();

  const guarantees = [
    { icon: HiOutlineShieldCheck, label: locale === 'fa' ? 'ضمانت اصالت کالا' : 'Authenticity Guarantee' },
    { icon: HiOutlineTruck, label: locale === 'fa' ? 'ارسال سریع سراسری' : 'Nationwide Fast Shipping' },
    { icon: HiOutlineRefresh, label: locale === 'fa' ? 'هفت روز ضمانت بازگشت' : '7-Day Return Policy' },
  ];

  return (
    <footer className="relative mt-10 md:mt-20 overflow-hidden">
      <div className="absolute inset-0 bg-[#08080a] dark:bg-[#08080a] bg-gray-100" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Trust badges */}
      <div className="relative border-b border-gray-800/30 dark:border-gray-800/30 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-12">
            {guarantees.map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                <g.icon className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                <span className="text-xs md:text-sm">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Brand + About */}
          <div className="col-span-2 md:col-span-1 text-center md:text-start">
            <Link href="/" className="text-2xl font-black text-gradient inline-block mb-4">{dict.common.brand}</Link>
            <p className="text-xs md:text-sm leading-6 md:leading-7 text-gray-500 mb-4 md:mb-5">{dict.footer.aboutText}</p>
            <div className="flex justify-center md:justify-start gap-2.5">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800/60 dark:bg-gray-800/60 bg-gray-200 hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400 hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800/60 dark:bg-gray-800/60 bg-gray-200 hover:bg-[#0088cc] hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white">
                <FaTelegram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800/60 dark:bg-gray-800/60 bg-gray-200 hover:bg-[#1DA1F2] hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white">
                <FaTwitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-5">{dict.footer.quickLinks}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-gray-500 hover:text-gold transition-colors">{dict.common.home}</Link></li>
              <li><Link href="/products" className="text-gray-500 hover:text-gold transition-colors">{dict.common.products}</Link></li>
              <li><Link href="/products?category=cat-tshirt" className="text-gray-500 hover:text-gold transition-colors">{dict.categories.tshirts}</Link></li>
              <li><Link href="/products?category=cat-pants" className="text-gray-500 hover:text-gold transition-colors">{dict.categories.pants}</Link></li>
              <li><Link href="/products?category=cat-sport" className="text-gray-500 hover:text-gold transition-colors">{dict.categories.sportswear}</Link></li>
              <li><Link href="/products?category=cat-shoes" className="text-gray-500 hover:text-gold transition-colors">{dict.categories.shoes}</Link></li>
              <li><Link href="/blog" className="text-gray-500 hover:text-gold transition-colors">{locale === 'fa' ? 'مجله' : 'Magazine'}</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-5">{locale === 'fa' ? 'حساب کاربری' : 'Account'}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="text-gray-500 hover:text-gold transition-colors">{dict.common.login}</Link></li>
              <li><Link href="/register" className="text-gray-500 hover:text-gold transition-colors">{dict.common.register}</Link></li>
              <li><Link href="/panel/orders" className="text-gray-500 hover:text-gold transition-colors">{dict.panel.orders}</Link></li>
              <li><Link href="/panel/wishlist" className="text-gray-500 hover:text-gold transition-colors">{dict.panel.wishlist}</Link></li>
              <li><Link href="/panel/tickets" className="text-gray-500 hover:text-gold transition-colors">{locale === 'fa' ? 'تیکت پشتیبانی' : 'Support Tickets'}</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-5">{locale === 'fa' ? 'اطلاعات' : 'Information'}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-gray-500 hover:text-gold transition-colors">{locale === 'fa' ? 'درباره ما' : 'About Us'}</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-gold transition-colors">{locale === 'fa' ? 'تماس با ما' : 'Contact Us'}</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-gold transition-colors">{locale === 'fa' ? 'قوانین و مقررات' : 'Terms & Conditions'}</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-gold transition-colors">{locale === 'fa' ? 'حریم خصوصی' : 'Privacy Policy'}</Link></li>
              <li><Link href="/faq" className="text-gray-500 hover:text-gold transition-colors">{locale === 'fa' ? 'سوالات متداول' : 'FAQ'}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-5">{dict.footer.contact}</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="mailto:Z7shop.ir@gmail.com" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
                    <HiOutlineMail className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-gray-500 group-hover:text-gold transition-colors">{dict.footer.email}</span>
                </a>
              </li>
              <li>
                <a href="tel:02112345678" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
                    <HiOutlinePhone className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-gray-500 group-hover:text-gold transition-colors" dir="ltr">{dict.footer.phone}</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gold/10 flex-shrink-0">
                    <HiOutlineLocationMarker className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-gray-500">{dict.footer.address}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800/30 dark:border-gray-800/30 border-gray-200 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <span>{dict.footer.rights}</span>
            <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-1">
              <Link href="/about" className="hover:text-gold transition-colors">{locale === 'fa' ? 'درباره ما' : 'About'}</Link>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <Link href="/contact" className="hover:text-gold transition-colors">{locale === 'fa' ? 'تماس' : 'Contact'}</Link>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <Link href="/terms" className="hover:text-gold transition-colors">{locale === 'fa' ? 'قوانین' : 'Terms'}</Link>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <Link href="/privacy" className="hover:text-gold transition-colors">{locale === 'fa' ? 'حریم خصوصی' : 'Privacy'}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
