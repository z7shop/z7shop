'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { useLocale } from '@/hooks/useLocale';
import type { Product, Category } from '@/types';

interface BundleWithProducts {
  id: string;
  name_fa: string;
  name_en: string;
  description_fa: string;
  description_en: string;
  discount_percent: number;
  image: string;
  products: Product[];
}
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineSupport, HiOutlineMail, HiOutlineTag, HiOutlineCube, HiOutlineUserGroup, HiOutlineStar, HiOutlineGlobe } from 'react-icons/hi';
import ScrollReveal from '@/components/ui/ScrollReveal';
import HeroSlider from '@/components/ui/HeroSlider';
import BrandMarquee from '@/components/ui/BrandMarquee';
import TestimonialsSlider from '@/components/ui/TestimonialsSlider';
import BundleCard from '@/components/product/BundleCard';
import { useParallax } from '@/hooks/useParallax';

function SectionHeader({ title, subtitle, center = false }: { title: string; subtitle: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <div className={`flex items-center gap-3 mb-2 ${center ? 'justify-center' : ''}`}>
        <div className="h-px w-6 md:w-10 bg-gradient-to-r from-transparent to-gold" />
        <h2 className="text-xl md:text-3xl font-bold">{title}</h2>
        <div className="h-px w-6 md:w-10 bg-gradient-to-l from-transparent to-gold" />
      </div>
      <p className={`text-xs md:text-sm text-gray-500 ${center ? '' : 'ms-9 md:ms-[52px]'}`}>{subtitle}</p>
    </div>
  );
}

function CouponChecker({ locale }: { locale: string }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ valid: boolean; discount_percent?: number; max_discount?: number; min_order?: number } | null>(null);
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
      <div className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder={locale === 'fa' ? 'مثلاً WELCOME10' : 'e.g. WELCOME10'}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 border border-gold/20 text-gray-900 dark:text-white placeholder-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-sm text-center tracking-widest font-mono"
          dir="ltr"
        />
        <button onClick={check} disabled={checking} className="btn-gold px-5 py-3 text-sm whitespace-nowrap">
          {checking ? '...' : locale === 'fa' ? 'بررسی' : 'Check'}
        </button>
      </div>
      {result && (
        <div className={`mt-3 p-3 rounded-xl text-sm animate-fade-in max-w-md mx-auto ${result.valid ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {result.valid ? (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="font-bold">{result.discount_percent}%</span>
              <span>{locale === 'fa' ? 'تخفیف' : 'OFF'}</span>
              <span className="text-gray-500">|</span>
              <span>{locale === 'fa' ? `حداکثر ${result.max_discount?.toLocaleString()} تومان` : `Max ${result.max_discount?.toLocaleString()}T`}</span>
              {result.min_order && result.min_order > 0 && (
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

interface HomeClientProps {
  initialFeatured: Product[];
  initialNewArrivals: Product[];
  initialCategories: Category[];
  initialBundles: BundleWithProducts[];
}

export default function HomeClient({ initialFeatured, initialNewArrivals, initialCategories, initialBundles }: HomeClientProps) {
  const { locale, dict, dir } = useLocale();
  const [email, setEmail] = useState('');

  useParallax();

  const featured = initialFeatured;
  const newArrivals = initialNewArrivals;
  const categories = initialCategories;
  const bundles = initialBundles;

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

  const stats = [
    { icon: HiOutlineCube, value: '۵۰۰+', label: locale === 'fa' ? 'محصول متنوع' : 'Products' },
    { icon: HiOutlineUserGroup, value: '۱۰K+', label: locale === 'fa' ? 'مشتری راضی' : 'Happy Customers' },
    { icon: HiOutlineStar, value: '۴.۸', label: locale === 'fa' ? 'امتیاز کاربران' : 'User Rating' },
    { icon: HiOutlineGlobe, value: '۳۱', label: locale === 'fa' ? 'شهر تحت پوشش' : 'Cities Covered' },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Slider */}
        <HeroSlider />

        {/* Features Strip */}
        <section className="relative border-b border-gray-200 dark:border-gray-800/30 bg-gray-50 dark:bg-[#0d0d10]">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-20">
          <ScrollReveal direction="up">
            <SectionHeader
              title={dict.categories.title}
              subtitle={locale === 'fa' ? 'از دسته‌بندی مورد نظر خود محصول انتخاب کنید' : 'Browse products by category'}
              center
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-8 md:mt-12">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5]"
                >
                  <Image
                    src={cat.image}
                    alt={locale === 'fa' ? cat.name_fa : cat.name_en}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 group-hover:from-black/90 transition-all duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 start-0 end-0 p-4 md:p-6">
                    <span className="font-bold text-base md:text-xl text-white group-hover:text-gold transition-colors duration-300 block">
                      {locale === 'fa' ? cat.name_fa : cat.name_en}
                    </span>
                    <span className="text-[11px] md:text-xs text-gray-400 mt-1 flex items-center gap-1.5 group-hover:text-gray-300 transition-colors">
                      {locale === 'fa' ? 'مشاهده محصولات' : 'View Products'}
                      <ArrowIcon className="w-3 h-3 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/40 rounded-2xl transition-all duration-500" />
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
          <ScrollReveal direction="up" delay={100}>
            <div className="flex items-end justify-between mb-6 md:mb-10">
              <SectionHeader
                title={dict.featured.title}
                subtitle={locale === 'fa' ? 'منتخب محصولات ما' : 'Our hand-picked selection'}
              />
              <Link href="/products?featured=true" className="btn-ghost group text-xs md:text-sm flex-shrink-0">
                {dict.featured.viewAll}
                <ArrowIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </ScrollReveal>
        </section>

        {/* Bundle Deals */}
        {bundles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
            <ScrollReveal direction="up">
              <div className="mb-6 md:mb-10">
                <SectionHeader
                  title={dict.bundles.title}
                  subtitle={locale === 'fa' ? 'با خرید پکیجی بیشتر صرفه‌جویی کنید' : 'Save more with bundle deals'}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {bundles.map((b) => <BundleCard key={b.id} bundle={b} />)}
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* Coupon Banner */}
        <section className="parallax-section relative overflow-hidden py-12 md:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-[#0d0d10] dark:via-[#111115] dark:to-[#0d0d10]" />
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gold/3 blur-[100px]" />
          </div>
          <div className="parallax-layer absolute inset-0" data-speed="0.3" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(201, 168, 76, 0.08), transparent 50%)'
          }} />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <ScrollReveal direction="up">
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-5">
                <HiOutlineTag className="w-4 h-4 text-gold" />
                <span className="text-xs text-gold font-medium">{locale === 'fa' ? 'کد تخفیف' : 'Discount Code'}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-gradient mb-3 md:mb-4">
                {locale === 'fa' ? 'کد تخفیف دارید؟' : 'Got a Coupon Code?'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 md:mb-8 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                {locale === 'fa' ? 'کد تخفیف خود را وارد کنید و از جزئیات آن مطلع شوید' : 'Enter your coupon code to see the discount details'}
              </p>
              <CouponChecker locale={locale} />
            </ScrollReveal>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-20">
          <ScrollReveal direction="up">
            <div className="flex items-end justify-between mb-6 md:mb-10">
              <SectionHeader
                title={dict.newArrivals.title}
                subtitle={locale === 'fa' ? 'تازه‌ترین محصولات فروشگاه' : 'Latest additions to our store'}
              />
              <Link href="/products?new=true" className="btn-ghost group text-xs md:text-sm flex-shrink-0">
                {dict.featured.viewAll}
                <ArrowIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </ScrollReveal>
        </section>

        {/* Why Z7shop */}
        <section className="relative overflow-hidden py-12 md:py-20">
          <div className="absolute inset-0 bg-gray-50 dark:bg-[#0b0b0e]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-gold/5 blur-[150px]" />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <ScrollReveal direction="up">
              <SectionHeader
                title={locale === 'fa' ? 'چرا Z7shop؟' : 'Why Z7shop?'}
                subtitle={locale === 'fa' ? 'اعتماد هزاران مشتری، دلیل بهتری برای انتخاب ما نیست؟' : 'Trusted by thousands — isn\'t that reason enough?'}
                center
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-10 md:mt-14">
                {stats.map((s, i) => (
                  <div key={i} className="text-center group">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gold/10 border border-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 group-hover:border-gold/25 group-hover:scale-110 transition-all duration-300">
                      <s.icon className="w-6 h-6 md:w-7 md:h-7 text-gold" />
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1">{s.value}</p>
                    <p className="text-xs md:text-sm text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Brand Marquee */}
        <BrandMarquee />

        {/* Testimonials */}
        <TestimonialsSlider />

        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* Newsletter */}
        <section className="parallax-section relative overflow-hidden py-12 md:py-24">
          <div className="absolute inset-0 bg-gray-50 dark:bg-[#0b0b0e]" />
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-gold/5 blur-[120px]" />
          </div>
          <div className="parallax-layer absolute inset-0" data-speed="0.2" style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(201, 168, 76, 0.06), transparent 60%)'
          }} />
          <div className="max-w-lg mx-auto px-4 sm:px-6 text-center relative z-10">
            <ScrollReveal direction="up">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/15 flex items-center justify-center mx-auto mb-5">
                <HiOutlineMail className="w-7 h-7 text-gold" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3">{dict.newsletter.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">{dict.newsletter.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.newsletter.placeholder}
                  className="flex-1 px-5 py-3.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 transition-all text-sm"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleNewsletter()}
                />
                <button onClick={handleNewsletter} className="btn-gold whitespace-nowrap px-6 py-3.5 text-sm">
                  {dict.newsletter.button}
                </button>
              </div>
              <p className="text-[11px] text-gray-600 mt-4">
                {locale === 'fa' ? 'با عضویت، از تخفیف‌ها و محصولات جدید باخبر می‌شوید.' : 'Subscribe to get notified about discounts and new arrivals.'}
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
