'use client';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { useState } from 'react';

const menuData = [
  {
    slug: 'cat-tshirt',
    fa: 'تی‌شرت',
    en: 'T-Shirts',
    icon: '👕',
    subs: [
      { fa: 'تی‌شرت کلاسیک', en: 'Classic T-Shirts', q: 'classic' },
      { fa: 'تی‌شرت اسلیم فیت', en: 'Slim Fit', q: 'slim' },
      { fa: 'تی‌شرت آستین بلند', en: 'Long Sleeve', q: 'long' },
      { fa: 'تی‌شرت پولو', en: 'Polo', q: 'polo' },
    ],
  },
  {
    slug: 'cat-pants',
    fa: 'شلوار',
    en: 'Pants',
    icon: '👖',
    subs: [
      { fa: 'شلوار جین', en: 'Jeans', q: 'jeans' },
      { fa: 'شلوار کتان', en: 'Chinos', q: 'chino' },
      { fa: 'شلوار کارگو', en: 'Cargo', q: 'cargo' },
      { fa: 'شلوار اسلش', en: 'Joggers', q: 'jogger' },
    ],
  },
  {
    slug: 'cat-hats',
    fa: 'کلاه',
    en: 'Hats',
    icon: '🧢',
    subs: [
      { fa: 'کلاه بیسبالی', en: 'Baseball Caps', q: 'baseball' },
      { fa: 'کلاه بافتنی', en: 'Beanies', q: 'beanie' },
      { fa: 'کلاه فدورا', en: 'Fedora', q: 'fedora' },
    ],
  },
  {
    slug: 'cat-sport',
    fa: 'ورزشی',
    en: 'Sportswear',
    icon: '🏃',
    subs: [
      { fa: 'ست ورزشی', en: 'Sports Sets', q: 'set' },
      { fa: 'هودی', en: 'Hoodies', q: 'hoodie' },
      { fa: 'شلوارک ورزشی', en: 'Shorts', q: 'shorts' },
      { fa: 'تی‌شرت درای‌فیت', en: 'Dry-Fit', q: 'dry' },
    ],
  },
  {
    slug: 'cat-shoes',
    fa: 'کفش',
    en: 'Shoes',
    icon: '👟',
    subs: [
      { fa: 'کتونی کلاسیک', en: 'Classic Sneakers', q: 'classic' },
      { fa: 'کتونی اسپرت', en: 'Sport Sneakers', q: 'sport' },
      { fa: 'کفش کژوال', en: 'Casual Shoes', q: 'casual' },
    ],
  },
];

export default function MegaMenu() {
  const { locale } = useLocale();
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="hidden lg:flex items-center gap-1">
      {menuData.map((cat) => (
        <div
          key={cat.slug}
          className="relative group"
          onMouseEnter={() => setActive(cat.slug)}
          onMouseLeave={() => setActive(null)}
        >
          <Link
            href={`/products?category=${cat.slug}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-gold transition-colors"
          >
            <span className="text-base">{cat.icon}</span>
            {locale === 'fa' ? cat.fa : cat.en}
          </Link>

          {active === cat.slug && (
            <div className="absolute top-full start-0 pt-2 z-50 animate-fade-in">
              <div className="bg-white dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl p-4 min-w-[220px] border border-gray-200 dark:border-gray-700/30">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700/30">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-bold text-gold">{locale === 'fa' ? cat.fa : cat.en}</span>
                </div>
                <div className="space-y-1">
                  {cat.subs.map((sub) => (
                    <Link
                      key={sub.q}
                      href={`/products?category=${cat.slug}&search=${sub.q}`}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                      onClick={() => setActive(null)}
                    >
                      {locale === 'fa' ? sub.fa : sub.en}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="block text-center text-xs text-gold mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/30 hover:underline"
                  onClick={() => setActive(null)}
                >
                  {locale === 'fa' ? 'مشاهده همه' : 'View All'}
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
