'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';
import { HiOutlineSearch, HiOutlineShoppingCart, HiOutlineTruck, HiOutlineRefresh, HiOutlineCreditCard, HiOutlineUser, HiOutlineChevronDown, HiOutlineChatAlt2, HiOutlineTicket } from 'react-icons/hi';

interface FaqItem {
  q_fa: string;
  q_en: string;
  a_fa: string;
  a_en: string;
}

interface FaqCategory {
  id: string;
  title_fa: string;
  title_en: string;
  icon: React.ElementType;
  items: FaqItem[];
}

const faqData: FaqCategory[] = [
  {
    id: 'orders',
    title_fa: 'سفارش و خرید',
    title_en: 'Orders & Shopping',
    icon: HiOutlineShoppingCart,
    items: [
      { q_fa: 'چطور سفارش ثبت کنم؟', q_en: 'How do I place an order?', a_fa: 'محصول مورد نظر خود را انتخاب کنید، سایز و رنگ را مشخص کنید و دکمه «افزودن به سبد» را بزنید. سپس به سبد خرید بروید و مراحل تکمیل خرید شامل انتخاب آدرس، روش ارسال و پرداخت را طی کنید.', a_en: 'Select your product, choose size and color, then click "Add to Cart". Go to your cart and complete checkout by selecting your address, shipping method, and payment.' },
      { q_fa: 'آیا امکان سفارش تلفنی وجود دارد؟', q_en: 'Can I order by phone?', a_fa: 'بله، می‌توانید با شماره ۰۲۱-۱۲۳۴۵۶۷۸ تماس بگیرید و سفارش خود را ثبت کنید. همچنین از طریق چت آنلاین سایت نیز می‌توانید راهنمایی بگیرید.', a_en: 'Yes, you can call 021-12345678 to place an order. You can also use the live chat on the website for assistance.' },
      { q_fa: 'آیا می‌توانم سفارش خود را لغو کنم؟', q_en: 'Can I cancel my order?', a_fa: 'تا قبل از ارسال سفارش، امکان لغو وجود دارد. برای لغو از بخش «سفارش‌ها» در پنل کاربری اقدام کنید یا با پشتیبانی تماس بگیرید.', a_en: 'You can cancel before shipping. Go to "Orders" in your dashboard or contact support.' },
      { q_fa: 'چطور وضعیت سفارشم را پیگیری کنم؟', q_en: 'How do I track my order?', a_fa: 'از بخش «پنل کاربری > سفارش‌ها» می‌توانید وضعیت سفارش خود را به صورت لحظه‌ای مشاهده کنید. بعد از ارسال، کد رهگیری نیز برای شما ارسال خواهد شد.', a_en: 'Go to "Dashboard > Orders" to track your order in real-time. A tracking code will be sent after shipping.' },
    ],
  },
  {
    id: 'shipping',
    title_fa: 'ارسال و تحویل',
    title_en: 'Shipping & Delivery',
    icon: HiOutlineTruck,
    items: [
      { q_fa: 'هزینه ارسال چقدر است؟', q_en: 'What are the shipping costs?', a_fa: 'ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان. ارسال عادی ۲۵,۰۰۰ تومان (۳ تا ۵ روز کاری) و ارسال سریع ۴۵,۰۰۰ تومان (۱ تا ۲ روز کاری).', a_en: 'Free shipping on orders over 500K. Standard shipping: 25,000T (3-5 business days). Express: 45,000T (1-2 business days).' },
      { q_fa: 'ارسال به کدام شهرها انجام می‌شود؟', q_en: 'Which cities do you ship to?', a_fa: 'ارسال به تمام نقاط ایران انجام می‌شود. برای شهرهای بزرگ ارسال سریع و برای سایر شهرها ارسال عادی در دسترس است.', a_en: 'We ship nationwide across Iran. Express delivery is available in major cities; standard shipping covers all areas.' },
      { q_fa: 'مدت زمان تحویل سفارش چقدر است؟', q_en: 'How long does delivery take?', a_fa: 'ارسال عادی ۳ تا ۵ روز کاری، ارسال سریع ۱ تا ۲ روز کاری و ارسال رایگان ۵ تا ۷ روز کاری زمان می‌برد.', a_en: 'Standard: 3-5 business days. Express: 1-2 business days. Free shipping: 5-7 business days.' },
      { q_fa: 'آیا امکان تحویل حضوری وجود دارد؟', q_en: 'Is in-person pickup available?', a_fa: 'در حال حاضر فقط ارسال پستی و پیک موتوری (برای تهران) در دسترس است. امکان تحویل حضوری فعلاً وجود ندارد.', a_en: 'Currently only postal and motorcycle courier (Tehran) delivery are available. In-person pickup is not available.' },
    ],
  },
  {
    id: 'returns',
    title_fa: 'بازگشت و مرجوعی',
    title_en: 'Returns & Refunds',
    icon: HiOutlineRefresh,
    items: [
      { q_fa: 'شرایط بازگشت کالا چیست؟', q_en: 'What is the return policy?', a_fa: 'تا ۷ روز پس از دریافت کالا، به شرط عدم استفاده و داشتن برچسب و بسته‌بندی اصلی، امکان بازگشت وجود دارد. هزینه ارسال مرجوعی بر عهده مشتری است.', a_en: 'Returns accepted within 7 days of receipt, provided the item is unused with original tags and packaging. Return shipping costs are the customer\'s responsibility.' },
      { q_fa: 'چطور درخواست مرجوعی ثبت کنم؟', q_en: 'How do I request a return?', a_fa: 'از بخش «تیکت‌ها» در پنل کاربری یک تیکت با موضوع «مرجوعی» ثبت کنید. تیم پشتیبانی در کمتر از ۲ ساعت پاسخ خواهد داد.', a_en: 'Submit a ticket with subject "Return" in your dashboard. The support team will respond within 2 hours.' },
      { q_fa: 'مبلغ مرجوعی چطور بازگردانده می‌شود؟', q_en: 'How are refunds processed?', a_fa: 'مبلغ مرجوعی ظرف ۳ تا ۵ روز کاری به همان روش پرداخت اولیه بازگردانده می‌شود. در صورت پرداخت آنلاین، مبلغ به حساب بانکی شما واریز خواهد شد.', a_en: 'Refunds are processed within 3-5 business days using the original payment method.' },
    ],
  },
  {
    id: 'payment',
    title_fa: 'پرداخت',
    title_en: 'Payment',
    icon: HiOutlineCreditCard,
    items: [
      { q_fa: 'چه روش‌های پرداختی موجود است؟', q_en: 'What payment methods are available?', a_fa: 'پرداخت آنلاین از طریق درگاه بانکی با تمام کارت‌های عضو شبکه شتاب امکان‌پذیر است.', a_en: 'Online payment via bank gateway with all Shetab network member cards.' },
      { q_fa: 'آیا پرداخت امن است؟', q_en: 'Is payment secure?', a_fa: 'بله، تمام تراکنش‌ها از طریق درگاه‌های بانکی معتبر و با رمزنگاری SSL انجام می‌شود. اطلاعات کارت شما ذخیره نمی‌شود.', a_en: 'Yes, all transactions are processed through verified bank gateways with SSL encryption. Your card details are never stored.' },
      { q_fa: 'اگر پرداخت ناموفق باشد چه اتفاقی می‌افتد؟', q_en: 'What happens if payment fails?', a_fa: 'در صورت کسر مبلغ از حساب و عدم ثبت سفارش، مبلغ ظرف ۷۲ ساعت به حساب شما بازگردانده می‌شود. در غیر اینصورت با پشتیبانی تماس بگیرید.', a_en: 'If charged but order not placed, the amount will be refunded within 72 hours. Otherwise, contact support.' },
    ],
  },
  {
    id: 'account',
    title_fa: 'حساب کاربری',
    title_en: 'Account',
    icon: HiOutlineUser,
    items: [
      { q_fa: 'چطور حساب کاربری بسازم؟', q_en: 'How do I create an account?', a_fa: 'روی دکمه «ثبت نام» کلیک کنید، نام، ایمیل و رمز عبور خود را وارد کنید. یک کد تأیید به ایمیل شما ارسال می‌شود. بعد از وارد کردن کد، حساب شما فعال خواهد شد.', a_en: 'Click "Register", enter your name, email, and password. A verification code will be sent to your email. Enter the code to activate your account.' },
      { q_fa: 'رمز عبورم را فراموش کرده‌ام. چه کار کنم؟', q_en: 'I forgot my password. What do I do?', a_fa: 'در صفحه ورود، روی «رمز عبور را فراموش کرده‌اید؟» کلیک کنید. ایمیل خود را وارد کنید تا کد بازیابی برایتان ارسال شود. سپس رمز عبور جدید تنظیم کنید.', a_en: 'On the login page, click "Forgot Password?". Enter your email to receive a reset code. Then set a new password.' },
      { q_fa: 'چطور اطلاعات حساب خود را ویرایش کنم؟', q_en: 'How do I edit my account info?', a_fa: 'از بخش «پنل کاربری > پروفایل» می‌توانید نام، شماره تلفن و رمز عبور خود را تغییر دهید.', a_en: 'Go to "Dashboard > Profile" to change your name, phone number, and password.' },
    ],
  },
];

export default function FaqPage() {
  const { locale } = useLocale();
  const fa = locale === 'fa';
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const filteredData = faqData
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item => {
        if (!search) return true;
        const s = search.toLowerCase();
        return item.q_fa.includes(s) || item.q_en.toLowerCase().includes(s) || item.a_fa.includes(s) || item.a_en.toLowerCase().includes(s);
      }),
    }))
    .filter(cat => {
      if (activeCategory && cat.id !== activeCategory) return false;
      return cat.items.length > 0;
    });

  const totalResults = filteredData.reduce((s, c) => s + c.items.length, 0);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-[#0a0a0d]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(201, 168, 76, 0.1), transparent)' }} />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
              {fa ? 'سوالات متداول' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-gray-400 text-sm md:text-lg mb-8">
              {fa ? 'پاسخ سوالات رایج درباره خرید، ارسال، بازگشت و حساب کاربری' : 'Answers to common questions about shopping, shipping, returns, and your account'}
            </p>
            <div className="relative max-w-lg mx-auto">
              <HiOutlineSearch className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={fa ? 'جستجو در سوالات...' : 'Search questions...'}
                className="w-full ps-12 pe-4 py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/10 transition-all text-sm"
              />
            </div>
          </div>
        </section>

        {/* Category tabs */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${!activeCategory ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] border border-white/[0.06]'}`}
            >
              {fa ? 'همه' : 'All'}
            </button>
            {faqData.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] border border-white/[0.06]'}`}
              >
                <cat.icon className="w-4 h-4" />
                {fa ? cat.title_fa : cat.title_en}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          {search && (
            <p className="text-sm text-gray-500 mb-6">
              {fa ? `${totalResults} نتیجه یافت شد` : `${totalResults} results found`}
            </p>
          )}

          {filteredData.length === 0 ? (
            <div className="text-center py-16">
              <HiOutlineSearch className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">{fa ? 'نتیجه‌ای یافت نشد' : 'No results found'}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredData.map(cat => (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                      <cat.icon className="w-5 h-5 text-gold" />
                    </div>
                    <h2 className="text-lg font-bold">{fa ? cat.title_fa : cat.title_en}</h2>
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((item, idx) => {
                      const key = `${cat.id}-${idx}`;
                      const isOpen = openItems.has(key);
                      return (
                        <div key={key} className="card overflow-hidden">
                          <button
                            onClick={() => toggleItem(key)}
                            className="w-full flex items-center justify-between px-5 py-4 text-start hover:bg-white/[0.02] transition-colors"
                          >
                            <span className="text-sm font-medium pe-4">{fa ? item.q_fa : item.q_en}</span>
                            <HiOutlineChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold' : ''}`} />
                          </button>
                          <div
                            className="overflow-hidden transition-all duration-300"
                            style={{ maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}
                          >
                            <div className="px-5 pb-4 pt-0">
                              <div className="h-px bg-gray-800/30 mb-3" />
                              <p className="text-sm text-gray-400 leading-7">{fa ? item.a_fa : item.a_en}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Still have questions */}
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5" />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              {fa ? 'هنوز سوالی دارید؟' : 'Still have questions?'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {fa ? 'تیم پشتیبانی ما آماده پاسخگویی به سوالات شماست' : 'Our support team is ready to help'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/panel/tickets" className="btn-gold text-sm px-6 py-3">
                <HiOutlineTicket className="w-5 h-5" />
                {fa ? 'ارسال تیکت پشتیبانی' : 'Submit Support Ticket'}
              </Link>
              <Link href="/contact" className="btn-outline text-sm px-6 py-3">
                <HiOutlineChatAlt2 className="w-5 h-5" />
                {fa ? 'تماس با ما' : 'Contact Us'}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
