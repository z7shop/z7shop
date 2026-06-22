'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineShieldCheck, HiOutlineHeart, HiOutlineSparkles, HiOutlineCube, HiOutlineUsers, HiOutlineStar, HiOutlineTruck } from 'react-icons/hi';

export default function AboutPage() {
  const { locale } = useLocale();
  const fa = locale === 'fa';

  const values = [
    {
      icon: HiOutlineShieldCheck,
      title: fa ? 'کیفیت بی‌نظیر' : 'Unmatched Quality',
      desc: fa ? 'تمامی محصولات ما از مرغوب‌ترین متریال‌ها و با بالاترین استانداردهای تولید ساخته می‌شوند.' : 'All our products are made from the finest materials with the highest production standards.',
    },
    {
      icon: HiOutlineHeart,
      title: fa ? 'اعتماد مشتریان' : 'Customer Trust',
      desc: fa ? 'رضایت مشتری اولویت اول ماست. با ضمانت بازگشت ۷ روزه و پشتیبانی ۲۴ ساعته در کنار شما هستیم.' : 'Customer satisfaction is our top priority. With 7-day returns and 24/7 support, we are always here for you.',
    },
    {
      icon: HiOutlineSparkles,
      title: fa ? 'استایل مدرن' : 'Modern Style',
      desc: fa ? 'جدیدترین ترندهای مد مردانه را با طراحی اختصاصی و قیمت مناسب به شما ارائه می‌دهیم.' : 'We offer the latest men\'s fashion trends with exclusive designs at affordable prices.',
    },
  ];

  const stats = [
    { icon: HiOutlineCube, value: fa ? '۵۰۰+' : '500+', label: fa ? 'محصول' : 'Products' },
    { icon: HiOutlineUsers, value: fa ? '۱۰,۰۰۰+' : '10,000+', label: fa ? 'مشتری راضی' : 'Happy Customers' },
    { icon: HiOutlineStar, value: fa ? '۴.۸' : '4.8', label: fa ? 'امتیاز کاربران' : 'User Rating' },
    { icon: HiOutlineTruck, value: fa ? '۳۱' : '31', label: fa ? 'استان تحت پوشش' : 'Provinces Covered' },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-[#0a0a0d]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.1), transparent)' }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 animate-slide-up">
              {fa ? 'درباره ' : 'About '}
              <span className="text-gradient">Z7shop</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto animate-slide-up-delay-1">
              {fa
                ? 'Z7shop با هدف ارائه بهترین پوشاک مردانه با کیفیت عالی و قیمت مناسب تاسیس شده است. ما معتقدیم هر مردی لایق بهترین استایل است.'
                : 'Z7shop was founded to offer the best men\'s clothing with excellent quality at fair prices. We believe every man deserves the best style.'}
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-3">
            {fa ? 'ارزش‌های ما' : 'Our Values'}
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            {fa ? 'آنچه ما را متمایز می‌کند' : 'What sets us apart'}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="card p-6 md:p-8 text-center hover:border-gold/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-bold text-lg mb-3">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <s.icon className="w-6 h-6 text-gold" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-gradient">{s.value}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-8">
            {fa ? 'داستان ما' : 'Our Story'}
          </h2>
          <div className="card p-6 md:p-10 space-y-4 text-sm md:text-base text-gray-400 leading-relaxed">
            <p>
              {fa
                ? 'Z7shop در سال ۱۴۰۴ با هدف ایجاد تحولی در صنعت پوشاک مردانه ایران تاسیس شد. ما از همان ابتدا می‌دانستیم که مردان ایرانی به انتخاب‌های بیشتر و بهتری در لباس نیاز دارند.'
                : 'Z7shop was founded in 2025 with the goal of revolutionizing Iran\'s men\'s clothing industry. From the very beginning, we knew that Iranian men needed more and better clothing choices.'}
            </p>
            <p>
              {fa
                ? 'تیم ما متشکل از طراحان حرفه‌ای و متخصصان مد است که هر روز تلاش می‌کنند بهترین محصولات را با بهترین قیمت به دست شما برسانند. ما به کیفیت، صداقت و خدمات عالی متعهد هستیم.'
                : 'Our team consists of professional designers and fashion experts who work every day to deliver the best products at the best prices. We are committed to quality, honesty, and excellent service.'}
            </p>
            <p>
              {fa
                ? 'ارسال سریع به سراسر ایران، ضمانت اصالت کالا و ۷ روز مهلت بازگشت از جمله خدماتی است که ما به مشتریان خود ارائه می‌دهیم.'
                : 'Fast shipping across Iran, product authenticity guarantee, and 7-day return policy are among the services we offer to our customers.'}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
