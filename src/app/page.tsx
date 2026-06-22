'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useLocale } from '@/hooks/useLocale';
import type { Product, Category } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineSupport } from 'react-icons/hi';
import ScrollReveal from '@/components/ui/ScrollReveal';
import HeroSlider from '@/components/ui/HeroSlider';
import BrandMarquee from '@/components/ui/BrandMarquee';
import TestimonialsSlider from '@/components/ui/TestimonialsSlider';
import BundleCard from '@/components/product/BundleCard';
import { useParallax } from '@/hooks/useParallax';

function CouponChecker({ locale }: { locale: string }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setResult(null);
    const res = await fetch('/api/coupons/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    const data = await res.json();
    setResult(data);
    setChecking(false);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder={locale === 'fa' ? 'مثلاً WELCOME10' : 'e.g. WELCOME10'}
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-gold/20 text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-sm text-center tracking-widest font-mono"
          dir="ltr"
        />
        <button onClick={check} disabled={checking} className="btn-gold px-5 py-3 text-sm whitespace-nowrap">
          {checking ? '...' : locale === 'fa' ? 'بررسی' : 'Check'}
        </button>
      </div>
      {result && (
        <div className={`mt-3 p-3 rounded-xl text-sm animate-fade-in ${result.valid ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {result.valid ? (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="font-bold">{result.discount_percent}%</span>
              <span>{locale === 'fa' ? 'تخفیف' : 'OFF'}</span>
              <span className="text-gray-500">|</span>
              <span>{locale === 'fa' ? `حداکثر ${result.max_discount?.toLocaleString()} تومان` : `Max ${result.max_discount?.toLocaleString()}T`}</span>
              {result.min_order > 0 && (
                <>
                  <span className="text-gray-500">|</span>
                  <span>{locale === 'fa' ? `حداقل سفارش ${result.min_order?.toLocaleString()} تومان` : `Min order ${result.min_order?.toLocaleString()}T`}</span>
                </>
              )}
            </div>
          ) : (
            <span>{locale === 'fa' ? 'کد تخفیف نامعتبر یا منقضی شده' : 'Invalid or expired coupon code'}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { locale, dict, dir } = useLocale();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useParallax();

  useEffect(() => {
    Promise.all([
      fetch('/api/products?featured=true&limit=8').then(r => r.json()),
      fetch('/api/products?new=true&limit=8').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/bundles').then(r => r.json()),
    ]).then(([featuredData, newData, cats, bundlesData]) => {
      setFeatured(featuredData.products);
      setNewArrivals(newData.products);
      setCategories(cats);
      if (Array.isArray(bundlesData)) setBundles(bundlesData);
      setLoading(false);
    });
  }, []);

  const handleNewsletter = async () => {
    if (!email) return;
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      toast.success(dict.newsletter.success);
      setEmail('');
    } else {
      toast.error(locale === 'fa' ? 'قبلاً عضو شده‌اید' : 'Already subscribed');
    }
  };

  const ArrowIcon = dir === 'rtl' ? HiOutlineArrowLeft : HiOutlineArrowRight;


  const features = [
    { icon: HiOutlineTruck, title: locale === 'fa' ? 'ارسال رایگان' : 'Free Shipping', desc: locale === 'fa' ? 'سفارش‌های بالای ۵۰۰ هزار' : 'Orders over 500K' },
    { icon: HiOutlineShieldCheck, title: locale === 'fa' ? 'ضمانت اصالت' : 'Authentic', desc: locale === 'fa' ? 'تضمین کیفیت کالا' : 'Quality guaranteed' },
    { icon: HiOutlineRefresh, title: locale === 'fa' ? 'بازگشت آسان' : 'Easy Returns', desc: locale === 'fa' ? 'تا ۷ روز مهلت' : 'Within 7 days' },
    { icon: HiOutlineSupport, title: locale === 'fa' ? 'پشتیبانی ۲۴/۷' : '24/7 Support', desc: locale === 'fa' ? 'پاسخگویی سریع' : 'Quick response' },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Slider */}
        <HeroSlider />

        {/* Features Strip — Glassmorphism */}
        <section className="relative border-b border-gray-800/30 dark:border-gray-800/30 border-gray-100 bg-[#0d0d10] dark:bg-[#0d0d10] bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto scrollbar-hide md:grid md:grid-cols-4 gap-2 md:gap-4 -mx-4 px-4 md:mx-0 md:px-0 py-4 md:py-6">
              {features.map((f, i) => (
                <div key={i} className="group glass-card rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 py-4 md:py-5 px-4 md:px-5 hover:border-gold/20 transition-all duration-300 min-w-[180px] md:min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300">
                    <f.icon className="w-5 h-5 md:w-6 md:h-6 text-gold" />
                  </div>
                  <div className="min-w-0 relative z-10">
                    <p className="font-bold text-xs md:text-sm whitespace-nowrap">{f.title}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 whitespace-nowrap">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
          <ScrollReveal direction="up">
            <h2 className="text-xl md:text-3xl font-bold text-center mb-2 md:mb-3">
              {dict.categories.title}
            </h2>
            <p className="text-center text-gray-500 mb-6 md:mb-10 text-xs md:text-sm">
              {locale === 'fa' ? 'از دسته‌بندی مورد نظر خود محصول انتخاب کنید' : 'Browse products by category'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="group relative overflow-hidden rounded-xl md:rounded-2xl aspect-square"
                >
                  <img
                    src={cat.image}
                    alt={locale === 'fa' ? cat.name_fa : cat.name_en}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 start-0 end-0 p-3 md:p-5">
                    <span className="font-bold text-sm md:text-lg text-white group-hover:text-gold transition-colors duration-300 block">
                      {locale === 'fa' ? cat.name_fa : cat.name_en}
                    </span>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 rounded-xl md:rounded-2xl transition-all duration-500" />
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
          <ScrollReveal direction="up" delay={100}>
            <div className="flex items-center justify-between mb-5 md:mb-8">
              <div>
                <h2 className="text-lg md:text-3xl font-bold">{dict.featured.title}</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">{locale === 'fa' ? 'منتخب محصولات ما' : 'Our hand-picked selection'}</p>
              </div>
              <Link href="/products?featured=true" className="btn-ghost group text-xs md:text-sm">
                {dict.featured.viewAll}
                <ArrowIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-6">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : featured.map((p) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </ScrollReveal>
        </section>

        {/* Bundle Deals */}
        {bundles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
            <ScrollReveal direction="up">
              <div className="mb-5 md:mb-8">
                <h2 className="text-lg md:text-3xl font-bold">{locale === 'fa' ? dict.bundles.title : dict.bundles.title}</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">{locale === 'fa' ? 'با خرید پکیجی بیشتر صرفه‌جویی کنید' : 'Save more with bundle deals'}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {bundles.map((b: any) => <BundleCard key={b.id} bundle={b} />)}
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* Coupon Banner — with Parallax */}
        <section className="parallax-section relative overflow-hidden py-8 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5" />
          <div className="parallax-layer absolute inset-0" data-speed="0.3" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(201, 168, 76, 0.15), transparent 50%)'
          }} />
          <div className="max-w-xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <ScrollReveal direction="up">
              <h2 className="text-xl md:text-3xl font-black text-gradient mb-2 md:mb-3">
                {locale === 'fa' ? 'کد تخفیف دارید؟' : 'Got a Coupon Code?'}
              </h2>
              <p className="text-gray-400 mb-5 md:mb-6 text-xs md:text-sm">
                {locale === 'fa' ? 'کد تخفیف خود را وارد کنید تا جزئیات آن را ببینید' : 'Enter your coupon code to see the discount details'}
              </p>
              <CouponChecker locale={locale} />
            </ScrollReveal>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-between mb-5 md:mb-8">
              <div>
                <h2 className="text-lg md:text-3xl font-bold">{dict.newArrivals.title}</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">{locale === 'fa' ? 'تازه‌ترین محصولات فروشگاه' : 'Latest additions to our store'}</p>
              </div>
              <Link href="/products?new=true" className="btn-ghost group text-xs md:text-sm">
                {dict.featured.viewAll}
                <ArrowIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : newArrivals.map((p) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </ScrollReveal>
        </section>

        {/* Brand Marquee */}
        <BrandMarquee />

        {/* Testimonials */}
        <TestimonialsSlider />

        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* Newsletter — with Parallax */}
        <section className="parallax-section relative overflow-hidden py-8 md:py-20">
          <div className="absolute inset-0 bg-gray-900 dark:bg-gray-900 bg-gray-100" />
          <div className="parallax-layer absolute inset-0" data-speed="0.2" style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(201, 168, 76, 0.1), transparent 60%)'
          }} />
          <div className="max-w-xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <ScrollReveal direction="up">
              <h2 className="text-lg md:text-3xl font-bold mb-2 md:mb-3 text-white dark:text-white text-gray-900">{dict.newsletter.title}</h2>
              <p className="text-gray-400 mb-5 md:mb-8 text-sm md:text-base">{dict.newsletter.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.newsletter.placeholder}
                  className="flex-1 px-4 py-3 md:px-5 md:py-3.5 rounded-xl bg-gray-800/80 border border-gray-700/50 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-white placeholder-gray-500 transition-all text-sm md:text-base"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleNewsletter()}
                />
                <button onClick={handleNewsletter} className="btn-gold whitespace-nowrap px-6 py-3 md:py-auto text-sm md:text-base">
                  {dict.newsletter.button}
                </button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
