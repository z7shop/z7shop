'use client';
import { useState, useEffect, useCallback } from 'react';
import { useLocale } from '@/hooks/useLocale';
import ScrollReveal from './ScrollReveal';
import { HiStar, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

interface Testimonial {
  name_fa: string;
  name_en: string;
  role_fa: string;
  role_en: string;
  text_fa: string;
  text_en: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name_fa: 'علی رضایی',
    name_en: 'Ali Rezaei',
    role_fa: 'مشتری وفادار',
    role_en: 'Loyal Customer',
    text_fa: 'کیفیت لباس‌ها عالیه، قبلاً از چند فروشگاه دیگه خرید کردم ولی هیچکدوم به اندازه Z7shop کیفیت نداشتن. ارسالشون هم خیلی سریعه.',
    text_en: 'The clothing quality is excellent. I\'ve shopped from other stores before but none matched Z7shop\'s quality. Their shipping is also very fast.',
    rating: 5,
    avatar: '👨‍💼',
  },
  {
    name_fa: 'محمد احمدی',
    name_en: 'Mohammad Ahmadi',
    role_fa: 'طراح مد',
    role_en: 'Fashion Designer',
    text_fa: 'به عنوان یه طراح مد، خیلی روی کیفیت پارچه و دوخت حساسم. محصولات Z7shop واقعاً استانداردهای بالایی دارن.',
    text_en: 'As a fashion designer, I\'m very particular about fabric quality and stitching. Z7shop products truly meet high standards.',
    rating: 5,
    avatar: '👨‍🎨',
  },
  {
    name_fa: 'سعید محمدی',
    name_en: 'Saeed Mohammadi',
    role_fa: 'ورزشکار حرفه‌ای',
    role_en: 'Professional Athlete',
    text_fa: 'لباس‌های ورزشی‌شون فوق‌العاده‌ان. هم از نظر راحتی و هم از نظر دوام. حتماً پیشنهاد میکنم.',
    text_en: 'Their sportswear is outstanding. Both in terms of comfort and durability. Highly recommended.',
    rating: 5,
    avatar: '🏃‍♂️',
  },
  {
    name_fa: 'امیر حسینی',
    name_en: 'Amir Hosseini',
    role_fa: 'بلاگر استایل',
    role_en: 'Style Blogger',
    text_fa: 'تنوع محصولات و بروز بودنشون با ترندهای روز دنیا خیلی خوبه. پشتیبانی‌شون هم عالیه.',
    text_en: 'The variety of products and keeping up with global trends is impressive. Their support is also excellent.',
    rating: 4,
    avatar: '📸',
  },
];

export default function TestimonialsSlider() {
  const { locale } = useLocale();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  const t = testimonials[active];

  return (
    <section className="relative py-10 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.03] to-transparent" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <ScrollReveal direction="up">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-2 md:mb-3">
            {locale === 'fa' ? 'نظرات مشتریان' : 'Customer Reviews'}
          </h2>
          <p className="text-center text-gray-500 mb-8 md:mb-12 text-xs md:text-sm">
            {locale === 'fa' ? 'مشتریان ما چه می‌گویند' : 'What our customers say'}
          </p>
        </ScrollReveal>

        <div className="relative">
          {/* Card */}
          <div
            key={active}
            className="testimonial-card relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl md:rounded-3xl p-6 md:p-10 text-center"
          >
            {/* Quote mark */}
            <div className="absolute top-4 start-6 md:top-6 md:start-10 text-gold/10 text-6xl md:text-8xl font-serif leading-none select-none">&ldquo;</div>

            {/* Avatar */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/20 flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl">
              {t.avatar}
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-0.5 mb-4 md:mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <HiStar
                  key={i}
                  className={`w-4 h-4 md:w-5 md:h-5 ${i < t.rating ? 'text-gold' : 'text-gray-700'}`}
                />
              ))}
            </div>

            {/* Text */}
            <p className="text-sm md:text-lg text-gray-300 leading-relaxed md:leading-8 mb-5 md:mb-8 max-w-2xl mx-auto">
              {locale === 'fa' ? t.text_fa : t.text_en}
            </p>

            {/* Name */}
            <p className="font-bold text-sm md:text-base text-white">
              {locale === 'fa' ? t.name_fa : t.name_en}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {locale === 'fa' ? t.role_fa : t.role_en}
            </p>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute top-1/2 -translate-y-1/2 -start-3 md:-start-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.05] border border-white/[0.08] backdrop-blur flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-300"
          >
            <HiOutlineChevronRight className="w-5 h-5 rtl:hidden" />
            <HiOutlineChevronLeft className="w-5 h-5 hidden rtl:block" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 -end-3 md:-end-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.05] border border-white/[0.08] backdrop-blur flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-300"
          >
            <HiOutlineChevronLeft className="w-5 h-5 rtl:hidden" />
            <HiOutlineChevronRight className="w-5 h-5 hidden rtl:block" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
              className={`rounded-full transition-all duration-300 ${i === active ? 'w-8 h-2 bg-gold' : 'w-2 h-2 bg-gray-700 hover:bg-gray-600'}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonial-card {
          animation: testimonialIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes testimonialIn {
          from {
            opacity: 0;
            transform: translateX(${direction >= 0 ? '30px' : '-30px'}) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
