'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, formatPercent } from '@/i18n';
import type { Product } from '@/types';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const { locale, dict } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`);
      const data = await res.json();
      setResults(data.products || []);
      setLoading(false);
    }, 300);
  }, [query]);

  if (!open) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="fixed top-0 inset-x-0 z-50 p-4 md:p-8">
        <div role="dialog" aria-modal="true" aria-label={locale === 'fa' ? 'جستجوی محصولات' : 'Search products'} className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <HiOutlineSearch className="w-5 h-5 text-gold flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.common.search}
              aria-label={locale === 'fa' ? 'جستجوی محصولات' : 'Search products'}
              className="flex-1 bg-transparent outline-none text-lg"
              onKeyDown={(e) => e.key === 'Escape' && onClose()}
            />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label={locale === 'fa' ? 'بستن' : 'Close'}>
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {loading && (
            <div className="px-5 py-4">
              <div className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/50">
              {results.map((p) => {
                const name = locale === 'fa' ? p.name_fa : p.name_en;
                const price = p.discount_price || p.price;
                const imgs: string[] = (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })();
                const thumb = imgs[0] || '';
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {thumb ? (
                        <Image src={thumb} alt={name} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          {locale === 'fa' ? 'بدون عکس' : 'No img'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gold text-sm font-bold">{formatPrice(price, locale)} {dict.common.currency}</span>
                        {p.discount_price && p.discount_price < p.price && (
                          <span className="text-xs text-gray-500 line-through">{formatPrice(p.price, locale)}</span>
                        )}
                      </div>
                    </div>
                    {p.discount_price && p.discount_price < p.price && (
                      <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full font-bold">
                        {formatPercent(Math.round(((p.price - p.discount_price) / p.price) * 100), locale)}
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span className="text-[10px] bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-full">
                        {locale === 'fa' ? 'ناموجود' : 'Out'}
                      </span>
                    )}
                  </Link>
                );
              })}
              {results.length >= 6 && (
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="block text-center py-3.5 text-sm text-gold hover:bg-gold/5 transition-colors font-medium"
                >
                  {locale === 'fa' ? 'مشاهده همه نتایج' : 'View all results'}
                </Link>
              )}
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">{dict.common.noResults}</div>
          )}

          {!query.trim() && (
            <div className="px-5 py-6 text-center text-gray-500 text-sm">
              {locale === 'fa' ? 'نام محصول را جستجو کنید...' : 'Search for products...'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
