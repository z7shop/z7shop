'use client';
import { useLocale } from '@/hooks/useLocale';
import ScrollReveal from './ScrollReveal';

const brands = [
  { name: 'Nike', logo: '/brands/nike.svg' },
  { name: 'Adidas', logo: '/brands/adidas.svg' },
  { name: 'Puma', logo: '/brands/puma.svg' },
  { name: 'Zara', logo: '/brands/zara.svg' },
  { name: 'H&M', logo: '/brands/hm.svg' },
  { name: 'Gucci', logo: '/brands/gucci.svg' },
  { name: 'Versace', logo: '/brands/versace.svg' },
  { name: 'Calvin Klein', logo: '/brands/ck.svg' },
];

export default function BrandMarquee() {
  const { locale } = useLocale();

  return (
    <section className="relative py-8 md:py-14 overflow-hidden border-y border-gray-200 dark:border-gray-800/20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
      <ScrollReveal direction="up">
        <p className="text-center text-xs md:text-sm text-gray-500 mb-6 md:mb-8 tracking-widest uppercase font-medium">
          {locale === 'fa' ? 'برندهای معتبر' : 'Trusted Brands'}
        </p>
      </ScrollReveal>
      <div className="marquee-container">
        <div className="marquee-track">
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-6 md:mx-10 flex items-center justify-center group"
            >
              <div className="w-20 h-12 md:w-28 md:h-16 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] px-4 py-2 group-hover:border-gold/20 group-hover:bg-gold/[0.05] transition-all duration-300">
                <span className="text-gray-600 group-hover:text-gold font-bold text-xs md:text-sm tracking-wider transition-colors duration-300 whitespace-nowrap">
                  {brand.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-container {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .marquee-track {
          display: flex;
          animation: marquee 30s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
