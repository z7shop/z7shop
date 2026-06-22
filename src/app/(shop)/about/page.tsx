'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineShieldCheck, HiOutlineHeart, HiOutlineSparkles, HiOutlineCube, HiOutlineUsers, HiOutlineStar, HiOutlineTruck, HiOutlineLightningBolt, HiOutlineGlobe, HiOutlineCheckCircle } from 'react-icons/hi';

export default function AboutPage() {
  const { locale } = useLocale();
  const fa = locale === 'fa';

  const values = [
    {
      icon: HiOutlineShieldCheck,
      title: fa ? 'کیفیت بی‌نظیر' : 'Unmatched Quality',
      desc: fa ? 'تمامی محصولات ما از مرغوب‌ترین متریال‌ها و با بالاترین استانداردهای تولید ساخته می‌شوند.' : 'All our products are made from the finest materials with the highest production standards.',
      color: 'from-gold/20 to-gold/5',
    },
    {
      icon: HiOutlineHeart,
      title: fa ? 'اعتماد مشتریان' : 'Customer Trust',
      desc: fa ? 'رضایت مشتری اولویت اول ماست. با ضمانت بازگشت ۷ روزه و پشتیبانی ۲۴ ساعته در کنار شما هستیم.' : 'Customer satisfaction is our top priority. With 7-day returns and 24/7 support.',
      color: 'from-rose-500/15 to-rose-500/5',
    },
    {
      icon: HiOutlineSparkles,
      title: fa ? 'استایل مدرن' : 'Modern Style',
      desc: fa ? 'جدیدترین ترندهای مد مردانه را با طراحی اختصاصی و قیمت مناسب به شما ارائه می‌دهیم.' : 'We offer the latest men\'s fashion trends with exclusive designs at affordable prices.',
      color: 'from-blue-500/15 to-blue-500/5',
    },
    {
      icon: HiOutlineLightningBolt,
      title: fa ? 'ارسال سریع' : 'Fast Delivery',
      desc: fa ? 'ارسال سریع به سراسر ایران با بسته‌بندی ویژه و ایمن. سفارش‌های بالای ۵۰۰ هزار تومان ارسال رایگان.' : 'Fast shipping across Iran with special packaging. Free shipping on orders over 500K.',
      color: 'from-emerald-500/15 to-emerald-500/5',
    },
  ];

  const stats = [
    { icon: HiOutlineCube, value: '500+', label: fa ? 'محصول' : 'Products' },
    { icon: HiOutlineUsers, value: '10K+', label: fa ? 'مشتری راضی' : 'Happy Customers' },
    { icon: HiOutlineStar, value: '4.8', label: fa ? 'امتیاز کاربران' : 'User Rating' },
    { icon: HiOutlineTruck, value: '31', label: fa ? 'استان تحت پوشش' : 'Provinces' },
  ];

  const timeline = [
    {
      year: fa ? '۱۴۰۴' : '2025',
      title: fa ? 'تولد Z7shop' : 'Z7shop is Born',
      desc: fa ? 'شروع فعالیت با هدف ارائه پوشاک مردانه با کیفیت و قیمت مناسب' : 'Started with the goal of offering quality men\'s clothing at fair prices',
    },
    {
      year: fa ? '۱۴۰۴' : '2025',
      title: fa ? 'رشد سریع' : 'Rapid Growth',
      desc: fa ? 'توسعه به بیش از ۵۰۰ محصول و ارسال به سراسر ایران' : 'Expanded to 500+ products with nationwide shipping',
    },
    {
      year: fa ? '۱۴۰۵' : '2026',
      title: fa ? 'فروشگاه آنلاین' : 'Online Store',
      desc: fa ? 'راه‌اندازی وبسایت حرفه‌ای با امکانات کامل خرید آنلاین' : 'Launched professional website with full online shopping features',
    },
    {
      year: fa ? '۱۴۰۵' : '2026',
      title: fa ? 'آینده درخشان' : 'Bright Future',
      desc: fa ? 'توسعه محصولات جدید، همکاری با برندهای بین‌المللی' : 'New product lines, international brand partnerships',
    },
  ];

  const team = [
    { name: fa ? 'علی محمدی' : 'Ali Mohammadi', role: fa ? 'بنیان‌گذار و مدیرعامل' : 'Founder & CEO', initials: 'AM' },
    { name: fa ? 'سارا رضایی' : 'Sara Rezaei', role: fa ? 'مدیر طراحی' : 'Design Director', initials: 'SR' },
    { name: fa ? 'محمد حسینی' : 'Mohammad Hosseini', role: fa ? 'مدیر فنی' : 'CTO', initials: 'MH' },
  ];

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'درباره Z7shop',
    description: 'فروشگاه آنلاین پوشاک مردانه با تعهد به کیفیت، ارسال سریع و پشتیبانی ۲۴ ساعته',
    url: 'https://z7shop.ir/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'Z7shop',
      url: 'https://z7shop.ir',
      foundingDate: '2025',
      numberOfEmployees: { '@type': 'QuantitativeValue', value: 10 },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 bg-[#0a0a0d]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.1), transparent)' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs px-4 py-2 rounded-full mb-6 border border-gold/20">
              <HiOutlineGlobe className="w-4 h-4" />
              {fa ? 'از سال ۱۴۰۴' : 'Since 2025'}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {fa ? 'درباره ' : 'About '}
              <span className="text-gradient">Z7shop</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              {fa
                ? 'Z7shop با هدف ارائه بهترین پوشاک مردانه با کیفیت عالی و قیمت مناسب تاسیس شده است. ما معتقدیم هر مردی لایق بهترین استایل است.'
                : 'Z7shop was founded to offer the best men\'s clothing with excellent quality at fair prices. We believe every man deserves the best style.'}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="relative -mt-10 z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 md:p-6 text-center hover:border-gold/20 transition-all duration-300 group">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <s.icon className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-gradient">{s.value}</p>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black mb-3">
              {fa ? 'ارزش‌های ما' : 'Our Values'}
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {fa ? 'اصولی که ما را در مسیر موفقیت هدایت می‌کنند' : 'Principles that guide us on the path to success'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <div key={i} className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8 hover:border-gold/20 transition-all duration-300 overflow-hidden">
                <div className={`absolute top-0 end-0 w-32 h-32 bg-gradient-to-br ${v.color} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <v.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.03] to-transparent" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-4xl font-black mb-3">
                {fa ? 'مسیر ما' : 'Our Journey'}
              </h2>
              <p className="text-gray-500 text-sm">
                {fa ? 'از ایده تا واقعیت' : 'From idea to reality'}
              </p>
            </div>
            <div className="relative">
              <div className="absolute start-6 md:start-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent md:-translate-x-px" />
              <div className="space-y-10 md:space-y-14">
                {timeline.map((t, i) => (
                  <div key={i} className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="absolute start-6 md:start-1/2 w-3 h-3 rounded-full bg-gold border-4 border-[#0c0c0f] -translate-x-1.5 md:-translate-x-1.5 mt-1.5 z-10" />
                    <div className={`flex-1 ps-12 md:ps-0 ${i % 2 === 0 ? 'md:pe-16 md:text-end' : 'md:ps-16 md:text-start'}`}>
                      <span className="inline-block text-xs font-bold text-gold bg-gold/10 px-3 py-1 rounded-full mb-2">{t.year}</span>
                      <h3 className="font-bold text-base md:text-lg mb-1">{t.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                    </div>
                    <div className="hidden md:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black mb-3">
              {fa ? 'تیم ما' : 'Our Team'}
            </h2>
            <p className="text-gray-500 text-sm">
              {fa ? 'افرادی که Z7shop را می‌سازند' : 'The people behind Z7shop'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {team.map((m, i) => (
              <div key={i} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center hover:border-gold/20 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mx-auto mb-4 border-2 border-gold/20 group-hover:border-gold/40 transition-colors">
                  <span className="text-xl font-bold text-gold">{m.initials}</span>
                </div>
                <h3 className="font-bold text-base mb-1">{m.name}</h3>
                <p className="text-xs text-gold/70">{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 md:p-12">
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
              <HiOutlineCheckCircle className="w-6 h-6 text-gold" />
              {fa ? 'داستان ما' : 'Our Story'}
            </h2>
            <div className="space-y-4 text-sm md:text-base text-gray-400 leading-relaxed">
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
