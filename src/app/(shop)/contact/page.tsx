'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock, HiOutlinePaperAirplane } from 'react-icons/hi';
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

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-[#0a0a0d]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.1), transparent)' }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 animate-slide-up">
              {fa ? 'تماس با ' : 'Contact '}
              <span className="text-gradient">{ fa ? 'ما' : 'Us'}</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-lg animate-slide-up-delay-1">
              {fa ? 'سوالی دارید؟ خوشحال می‌شویم که کمکتان کنیم.' : 'Have a question? We\'d love to help.'}
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-lg md:text-2xl font-bold mb-6">{fa ? 'ارسال پیام' : 'Send a Message'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{fa ? 'نام' : 'Name'}</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{fa ? 'ایمیل' : 'Email'}</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" dir="ltr" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{fa ? 'موضوع' : 'Subject'}</label>
                  <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{fa ? 'پیام' : 'Message'}</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} className="input-field resize-none" required />
                </div>
                <button type="submit" disabled={sending} className="btn-gold w-full py-3 disabled:opacity-50">
                  <HiOutlinePaperAirplane className="w-5 h-5 rtl:-scale-x-100" />
                  {sending ? (fa ? 'در حال ارسال...' : 'Sending...') : (fa ? 'ارسال پیام' : 'Send Message')}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-lg md:text-2xl font-bold mb-6">{fa ? 'اطلاعات تماس' : 'Contact Info'}</h2>
              <div className="space-y-4">
                {contactInfo.map((item, i) => (
                  <div key={i} className="card p-4 md:p-5 flex items-center gap-4 hover:border-gold/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{item.title}</p>
                      {item.href ? (
                        <a href={item.href} className="font-medium text-sm hover:text-gold transition-colors" dir={item.dir}>{item.value}</a>
                      ) : (
                        <p className="font-medium text-sm" dir={item.dir}>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social */}
              <div className="card p-5">
                <p className="text-sm font-bold mb-3">{fa ? 'ما را دنبال کنید' : 'Follow Us'}</p>
                <div className="flex gap-3">
                  <a href="#" className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-800/60 hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400 hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white">
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-800/60 hover:bg-[#0088cc] hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white">
                    <FaTelegram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-800/60 hover:bg-[#1DA1F2] hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white">
                    <FaTwitter className="w-5 h-5" />
                  </a>
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
