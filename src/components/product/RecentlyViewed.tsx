'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useLocale } from '@/hooks/useLocale';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

export default function RecentlyViewed() {
  const { locale } = useLocale();
  const recentlyViewed = useStore((s) => s.recentlyViewed);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (recentlyViewed.length === 0) return;

    Promise.all(
      recentlyViewed.slice(0, 4).map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => r.json())
          .then((d) => d.product)
          .catch(() => null)
      )
    ).then((results) => {
      setProducts(results.filter(Boolean));
    });
  }, [recentlyViewed]);

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-xl font-bold mb-6">
        {locale === 'fa' ? 'بازدید اخیر شما' : 'Recently Viewed'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
