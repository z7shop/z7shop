'use client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import PriceRangeSlider from '@/components/ui/PriceRangeSlider';
import ColorFilter from '@/components/ui/ColorFilter';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, toPersianNumber } from '@/i18n';
import type { Product, Category } from '@/types';
import { HiOutlineSearch, HiOutlineX, HiOutlineAdjustments } from 'react-icons/hi';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const { locale, dict } = useLocale();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const sizes = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', 'Free'];

  const activeFilterCount = [
    search,
    category,
    sort !== 'newest' ? sort : '',
    priceRange[0] > 0 || priceRange[1] < 1500000 ? 'price' : '',
    selectedSize,
    selectedColors.length > 0 ? 'colors' : '',
    inStockOnly ? 'stock' : '',
  ].filter(Boolean).length;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 1500000) params.set('maxPrice', String(priceRange[1]));
    if (selectedSize) params.set('size', selectedSize);
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (inStockOnly) params.set('inStock', 'true');
    params.set('page', String(page));
    params.set('limit', '12');

    if (searchParams.get('featured')) params.set('featured', 'true');
    if (searchParams.get('new')) params.set('new', 'true');

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, [search, category, sort, priceRange, selectedSize, selectedColors, inStockOnly, page, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories);
  }, []);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('newest');
    setPriceRange([0, 1500000]);
    setSelectedSize('');
    setSelectedColors([]);
    setInStockOnly(false);
    setPage(1);
  };

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (search) activeFilters.push({ label: `"${search}"`, onRemove: () => { setSearch(''); setPage(1); } });
  if (category) {
    const cat = categories.find(c => c.id === category);
    activeFilters.push({
      label: cat ? (locale === 'fa' ? cat.name_fa : cat.name_en) : category,
      onRemove: () => { setCategory(''); setPage(1); },
    });
  }
  if (selectedSize) activeFilters.push({ label: `${dict.product.size}: ${selectedSize}`, onRemove: () => { setSelectedSize(''); setPage(1); } });
  if (priceRange[0] > 0 || priceRange[1] < 1500000) {
    activeFilters.push({
      label: `${formatPrice(priceRange[0], locale)} - ${formatPrice(priceRange[1], locale)}`,
      onRemove: () => { setPriceRange([0, 1500000]); setPage(1); },
    });
  }
  if (selectedColors.length > 0) {
    activeFilters.push({
      label: `${locale === 'fa' ? 'رنگ' : 'Color'} (${selectedColors.length})`,
      onRemove: () => { setSelectedColors([]); setPage(1); },
    });
  }
  if (inStockOnly) activeFilters.push({ label: locale === 'fa' ? 'فقط موجود' : 'In Stock', onRemove: () => { setInStockOnly(false); setPage(1); } });

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{dict.common.products}</h1>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden btn-ghost relative">
            <HiOutlineAdjustments className="w-5 h-5" />
            {dict.product.filters}
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -end-1 bg-gold text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold px-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-y-auto' : 'hidden'} md:block md:static md:w-64 md:flex-shrink-0`}>
            <div className="flex items-center justify-between mb-6 md:hidden">
              <h2 className="text-xl font-bold">{dict.product.filters}</h2>
              <button onClick={() => setShowFilters(false)}><HiOutlineX className="w-6 h-6" /></button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <HiOutlineSearch className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={dict.common.search}
                  className="input-field ps-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">{dict.categories.title}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setCategory(''); setPage(1); }}
                  className={`block w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-gold/10 text-gold font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {dict.common.all}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setPage(1); }}
                    className={`block w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.id ? 'bg-gold/10 text-gold font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    {locale === 'fa' ? cat.name_fa : cat.name_en}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">{dict.product.priceRange}</h3>
              <PriceRangeSlider
                min={0}
                max={1500000}
                value={priceRange}
                onChange={(v) => { setPriceRange(v); setPage(1); }}
                locale={locale}
              />
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">{dict.product.size}</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSize(selectedSize === s ? '' : s); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedSize === s ? 'border-gold bg-gold/10 text-gold' : 'border-gray-200 dark:border-gray-700 hover:border-gold'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">{dict.product.color}</h3>
              <ColorFilter
                selected={selectedColors}
                onChange={(colors) => { setSelectedColors(colors); setPage(1); }}
              />
            </div>

            {/* In Stock Only */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-10 h-5 rounded-full relative transition-colors ${inStockOnly ? 'bg-gold' : 'bg-gray-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${inStockOnly ? 'end-0.5' : 'start-0.5'}`} />
                </div>
                <span className="text-sm group-hover:text-gold transition-colors">
                  {locale === 'fa' ? 'فقط کالاهای موجود' : 'In stock only'}
                </span>
              </label>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">{dict.product.sort}</h3>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="input-field text-sm"
              >
                <option value="newest">{dict.product.sortOptions.newest}</option>
                <option value="cheapest">{dict.product.sortOptions.cheapest}</option>
                <option value="expensive">{dict.product.sortOptions.expensive}</option>
                <option value="popular">{dict.product.sortOptions.popular}</option>
              </select>
            </div>

            <button onClick={clearFilters} className="btn-outline w-full text-sm">
              {dict.product.clearFilters}
            </button>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                {locale === 'fa' ? `${toPersianNumber(total)} محصول` : `${total} products`}
              </div>
            </div>

            {/* Active Filter Pills */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-gold/10 text-gold text-xs font-medium px-3 py-1.5 rounded-full border border-gold/20">
                    {f.label}
                    <button onClick={f.onRemove} className="hover:bg-gold/20 rounded-full p-0.5 transition-colors">
                      <HiOutlineX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2">
                  {dict.product.clearFilters}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.length > 0
                  ? products.map(p => <ProductCard key={p.id} product={p} />)
                  : <div className="col-span-full text-center py-20 text-gray-600 dark:text-gray-400">{dict.common.noResults}</div>
              }
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gold/20'}`}
                  >
                    {locale === 'fa' ? toPersianNumber(i + 1) : i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
