'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
            <div className="max-h-[60vh] overflow-y-auto">
              {results.map((p) => {
                const name = locale === 'fa' ? p.name_fa : p.name_en;
                const price = p.discount_price || p.price;
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg opacity-40">👔</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{name}</p>
                      <p className="text-gold text-sm font-bold mt-0.5">{formatPrice(price, locale)} {dict.common.currency}</p>
                    </div>
                    {p.discount_price && p.discount_price < p.price && (
                      <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                        {formatPercent(Math.round(((p.price - p.discount_price) / p.price) * 100), locale)}
                      </span>
                    )}
                  </Link>
                );
              })}
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
