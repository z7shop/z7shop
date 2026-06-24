'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import AnimatedCounter from './AnimatedCounter';
import { HiOutlineShoppingBag, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineStar, HiOutlineUsers, HiOutlineCube, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

interface Slide {
  badge_fa: string;
  badge_en: string;
  title_fa: React.ReactNode;
  title_en: React.ReactNode;
  subtitle_fa: string;
  subtitle_en: string;
  cta_fa: string;
  cta_en: string;
  ctaLink: string;
  gradient: string;
  accentColor: string;
}

function parseGradientText(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <span key={i} className="text-gradient">{part}</span> : part
  );
}

export default function HeroSlider() {
  const { locale, dict } = useLocale();
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/banners').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setSlides(data.map((b: any) => ({
          badge_fa: b.badge_fa,
          badge_en: b.badge_en,
          title_fa: parseGradientText(b.title_fa),
          title_en: parseGradientText(b.title_en),
          subtitle_fa: b.subtitle_fa,
          subtitle_en: b.subtitle_en,
          cta_fa: b.cta_fa,
          cta_en: b.cta_en,
          ctaLink: b.cta_link,
          gradient: b.gradient,
          accentColor: b.accent_color,
        })));
      }
    });
  }, []);

  const goTo = useCallback((idx: number) => {
    if (isAnimating || slides.length === 0) return;
    setIsAnimating(true);
    setActive(idx);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, slides.length]);

  const next = useCallback(() => { if (slides.length > 0) goTo((active + 1) % slides.length); }, [active, goTo, slides.length]);
  const prev = useCallback(() => { if (slides.length > 0) goTo((active - 1 + slides.length) % slides.length); }, [active, goTo, slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next, slides.length]);

  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden min-h-0 md:min-h-[85vh] flex items-center bg-gray-100 dark:bg-[#0a0a0d]">
        <div className="max-w-7xl mx-auto px-4 w-full py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-16 w-96 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-6 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[active];
  return (
    <section className="relative overflow-hidden min-h-0 md:min-h-[85vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-[#0a0a0d]">
        <div
          key={active}
          className="absolute inset-0 hero-slide-bg"
          style={{ backgroundImage: `${slide.gradient}, radial-gradient(ellipse 50% 60% at 20% 80%, rgba(201, 168, 76, 0.06), transparent)` }}
        />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating decorative */}
      <div className="hidden md:block absolute top-20 end-[15%] w-72 h-72 hero-glow bg-gold animate-float" />
      <div className="hidden md:block absolute bottom-32 start-[10%] w-48 h-48 hero-glow bg-gold-light animate-float-reverse" />

      {/* Geometric */}
      <div className="absolute top-1/4 end-[20%] hidden lg:block animate-spin-slow">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="10" y="10" width="60" height="60" rx="4" stroke="#C9A84C" strokeWidth="1" strokeOpacity="0.15" transform="rotate(15 40 40)" />
          <rect x="20" y="20" width="40" height="40" rx="4" stroke="#C9A84C" strokeWidth="1" strokeOpacity="0.1" transform="rotate(30 40 40)" />
        </svg>
      </div>
      <div className="absolute bottom-1/3 end-[30%] hidden lg:block animate-float">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="15" stroke="#C9A84C" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Content */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 md:py-0 relative z-10 w-full"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) {
            if (diff > 0) next();
            else prev();
          }
          setTouchStart(null);
        }}>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Text */}
          <div className="text-center md:text-start">
            <div key={`badge-${active}`} className="hero-slide-content inline-flex items-center gap-2 bg-gradient-to-r from-gold/15 to-gold/5 text-gold text-xs md:text-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full mb-4 md:mb-8 border border-gold/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-gold" />
              </span>
              {locale === 'fa' ? slide.badge_fa : slide.badge_en}
            </div>

            <h1 key={`title-${active}`} className="hero-slide-content-delay-1 text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-5 md:mb-6 leading-[1.15] text-gray-900 dark:text-white tracking-tight">
              {locale === 'fa' ? slide.title_fa : slide.title_en}
            </h1>

            <p key={`sub-${active}`} className="hero-slide-content-delay-2 text-sm md:text-lg text-gray-600 dark:text-gray-400 mb-8 md:mb-10 leading-relaxed max-w-md mx-auto md:mx-0">
              {locale === 'fa' ? slide.subtitle_fa : slide.subtitle_en}
            </p>

            <div key={`cta-${active}`} className="hero-slide-content-delay-3 flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-10 md:mb-12">
              <Link href={slide.ctaLink} className="group relative btn-gold text-sm md:text-lg px-6 py-3 md:px-8 md:py-4 overflow-hidden w-full sm:w-auto">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <HiOutlineShoppingBag className="w-5 h-5" />
                {locale === 'fa' ? slide.cta_fa : slide.cta_en}
              </Link>
              <Link href="/products?new=true" className="btn-outline text-sm md:text-lg px-6 py-3 md:px-8 md:py-4 w-full sm:w-auto">
                {dict.newArrivals.title}
              </Link>
            </div>

            {/* Animated Stats */}
            <div className="hero-slide-content-delay-4 flex items-center justify-center md:justify-start gap-3 md:gap-10">
              {[
                { value: 500, suffix: '+', label: locale === 'fa' ? 'محصول' : 'Products', icon: HiOutlineCube },
                { value: 10, suffix: 'K+', label: locale === 'fa' ? 'مشتری' : 'Customers', icon: HiOutlineUsers },
                { value: 4.8, suffix: '', label: locale === 'fa' ? 'امتیاز' : 'Rating', icon: HiOutlineStar, decimals: 1 },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gold/10 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm md:text-xl">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} duration={2500} />
                    </p>
                    <p className="text-gray-500 text-[10px] md:text-xs">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual side */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 rounded-full border border-gold/10 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-dashed border-gold/15" />
              <div className="absolute inset-12 bg-gradient-to-br from-gold/10 to-transparent rounded-3xl rotate-45 border border-gold/20 backdrop-blur-sm" />
              <div className="absolute inset-20 bg-gradient-to-br from-gold/15 to-gold/5 rounded-2xl rotate-45 border border-gold/25" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-5xl font-black text-gradient tracking-tighter">Z7</span>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-2" />
                  <span className="text-sm text-gold/60 tracking-[0.3em] mt-1 block">SHOP</span>
                </div>
              </div>

              <div className="floating-badge absolute top-8 -start-4 backdrop-blur rounded-xl px-4 py-3 animate-float">
                <div className="flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-gold" />
                  <span className="text-sm">{locale === 'fa' ? 'ضمانت اصالت' : 'Authentic'}</span>
                </div>
              </div>
              <div className="floating-badge absolute bottom-12 -end-4 backdrop-blur rounded-xl px-4 py-3 animate-float-reverse">
                <div className="flex items-center gap-2">
                  <HiOutlineTruck className="w-5 h-5 text-gold" />
                  <span className="text-sm">{locale === 'fa' ? 'ارسال سریع' : 'Fast Delivery'}</span>
                </div>
              </div>
              <div className="floating-badge absolute top-1/2 -end-8 backdrop-blur rounded-xl px-4 py-3 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <HiOutlineRefresh className="w-5 h-5 text-gold" />
                  <span className="text-sm">{locale === 'fa' ? 'بازگشت آسان' : 'Easy Return'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide navigation - desktop only */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-4">
        <button onClick={prev} className="w-10 h-10 rounded-full border border-white/10 hover:border-gold/40 flex items-center justify-center text-gray-500 hover:text-gold transition-all duration-300 backdrop-blur-sm bg-black/20">
          <HiOutlineChevronRight className="w-4 h-4 rtl:hidden" />
          <HiOutlineChevronLeft className="w-4 h-4 hidden rtl:block" />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500 bg-white/10"
              style={{ width: i === active ? 32 : 12 }}
            >
              {i === active && (
                <div className="absolute inset-0 bg-gold rounded-full hero-progress" />
              )}
            </button>
          ))}
        </div>
        <button onClick={next} className="w-10 h-10 rounded-full border border-white/10 hover:border-gold/40 flex items-center justify-center text-gray-500 hover:text-gold transition-all duration-300 backdrop-blur-sm bg-black/20">
          <HiOutlineChevronLeft className="w-4 h-4 rtl:hidden" />
          <HiOutlineChevronRight className="w-4 h-4 hidden rtl:block" />
        </button>
      </div>

      {/* Mobile dots - simple, no progress */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex md:hidden items-center gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-6 bg-gold' : 'w-1.5 bg-white/20'}`}
          />
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 start-0 end-0 h-16 md:h-32 bg-gradient-to-t from-[#0a0a0d] to-transparent" />

      <style jsx>{`
        @keyframes heroSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroBgIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .hero-slide-bg {
          animation: heroBgIn 0.8s ease-out;
        }
        .hero-slide-content {
          animation: heroSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .hero-slide-content-delay-1 {
          animation: heroSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .hero-slide-content-delay-2 {
          animation: heroSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        .hero-slide-content-delay-3 {
          animation: heroSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
        .hero-slide-content-delay-4 {
          animation: heroSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }
        .hero-progress {
          animation: heroProgress 6s linear;
        }
      `}</style>
    </section>
  );
}
