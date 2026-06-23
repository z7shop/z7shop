'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock, HiOutlinePaperAirplane, HiOutlineChat } from 'react-icons/hi';
import { FaInstagram, FaTelegram, FaTwitter } from 'react-icons/fa';

export default function ContactPage() {
  const { locale } = useLocale();
  const fa = locale === 'fa';
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error(fa ? 'لطفاً تمام فیلدها را پر کنید' : 'Please fill in all fields');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(fa ? 'پیام شما با موفقیت ارسال شد!' : 'Your message has been sent successfully!');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const contactInfo = [
    { icon: HiOutlinePhone, title: fa ? 'تلفن' : 'Phone', value: '۰۲۱-۱۲۳۴۵۶۷۸', href: 'tel:02112345678', dir: 'ltr' as const },
    { icon: HiOutlineMail, title: fa ? 'ایمیل' : 'Email', value: 'Z7shop.ir@gmail.com', href: 'mailto:Z7shop.ir@gmail.com', dir: 'ltr' as const },
    { icon: HiOutlineLocationMarker, title: fa ? 'آدرس' : 'Address', value: fa ? 'تهران، خیابان ولیعصر' : 'Tehran, Valiasr Street', href: undefined, dir: undefined },
    { icon: HiOutlineClock, title: fa ? 'ساعت کاری' : 'Working Hours', value: fa ? 'شنبه تا پنج‌شنبه ۹ صبح تا ۹ شب' : 'Sat-Thu 9AM - 9PM', href: undefined, dir: undefined },
  ];

  const socials = [
    { icon: FaInstagram, label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400' },
    { icon: FaTelegram, label: 'Telegram', color: 'hover:bg-[#0088cc]' },
    { icon: FaTwitter, label: 'Twitter', color: 'hover:bg-[#1DA1F2]' },
  ];

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Z7shop',
    description: 'فروشگاه آنلاین پوشاک مردانه',
    url: 'https://z7shop.ir',
    telephone: '+982112345678',
    email: 'Z7shop.ir@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'خیابان ولیعصر',
      addressLocality: 'تهران',
      addressCountry: 'IR',
    },
    openingHours: 'Sa-Th 09:00-21:00',
    priceRange: '$$',
    image: 'https://z7shop.ir/icons/icon-512x512.png',
    sameAs: [
      'https://instagram.com/z7shop',
      'https://t.me/z7shop',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gray-100 dark:bg-[#0a0a0d]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.1), transparent)' }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs px-4 py-2 rounded-full mb-6 border border-gold/20">
              <HiOutlineChat className="w-4 h-4" />
              {fa ? 'پاسخگوی شما هستیم' : "We're here to help"}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-5">
              {fa ? 'تماس با ' : 'Contact '}
              <span className="text-gradient">{fa ? 'ما' : 'Us'}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-lg max-w-lg mx-auto">
              {fa ? 'سوالی دارید؟ خوشحال می‌شویم که کمکتان کنیم. از هر طریقی که راحت‌ترید با ما در ارتباط باشید.' : 'Have a question? We\'d love to help. Reach out through any channel you prefer.'}
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {contactInfo.map((item, i) => (
              <div key={i} className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 md:p-5 text-center hover:border-gold/20 transition-all duration-300 group">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 text-gold" />
                </div>
                <p className="text-[11px] text-gray-500 mb-1">{item.title}</p>
                {item.href ? (
                  <a href={item.href} className="text-xs md:text-sm font-medium hover:text-gold transition-colors" dir={item.dir}>{item.value}</a>
                ) : (
                  <p className="text-xs md:text-sm font-medium" dir={item.dir}>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Form + Sidebar */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact Form */}
            <div className="md:col-span-3">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
                  <HiOutlinePaperAirplane className="w-5 h-5 text-gold rtl:-scale-x-100" />
                  {fa ? 'ارسال پیام' : 'Send a Message'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">{fa ? 'نام' : 'Name'}</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">{fa ? 'ایمیل' : 'Email'}</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" dir="ltr" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">{fa ? 'موضوع' : 'Subject'}</label>
                    <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">{fa ? 'پیام' : 'Message'}</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} className="input-field resize-none" required />
                  </div>
                  <button type="submit" disabled={sending} className="btn-gold w-full py-3 disabled:opacity-50">
                    <HiOutlinePaperAirplane className="w-5 h-5 rtl:-scale-x-100" />
                    {sending ? (fa ? 'در حال ارسال...' : 'Sending...') : (fa ? 'ارسال پیام' : 'Send Message')}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-2 space-y-5">
              {/* Social */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-4">{fa ? 'ما را دنبال کنید' : 'Follow Us'}</h3>
                <div className="flex gap-3">
                  {socials.map((s, i) => (
                    <a key={i} href="#" className={`w-11 h-11 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.06] ${s.color} hover:border-transparent hover:scale-110 transition-all duration-300 text-gray-600 dark:text-gray-400 hover:text-white`}>
                      <s.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick answers */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-3">{fa ? 'پاسخ سریع' : 'Quick Answers'}</h3>
                <p className="text-xs text-gray-500 mb-4 leading-5">
                  {fa ? 'قبل از ارسال پیام، شاید جواب سوالتان را در سوالات متداول پیدا کنید.' : 'Before sending a message, you might find your answer in our FAQ.'}
                </p>
                <a href="/faq" className="btn-outline text-xs px-4 py-2.5 w-full">
                  {fa ? 'مشاهده سوالات متداول' : 'View FAQ'}
                </a>
              </div>

              {/* Response time */}
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/15 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                    <HiOutlineClock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1">{fa ? 'زمان پاسخ‌دهی' : 'Response Time'}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-5">
                      {fa ? 'تیم پشتیبانی ما معمولاً در کمتر از ۲ ساعت پاسخ می‌دهد.' : 'Our support team usually responds within 2 hours.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
