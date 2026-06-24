'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ImageGallery from '@/components/product/ImageGallery';
import StarRating from '@/components/product/StarRating';
import ReviewCard from '@/components/product/ReviewCard';
import ReviewForm from '@/components/product/ReviewForm';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SizeGuide from '@/components/ui/SizeGuide';
import SocialShare from '@/components/ui/SocialShare';
import CountdownTimer from '@/components/ui/CountdownTimer';
import StickyMobileBar from '@/components/ui/StickyMobileBar';
import StockAlertForm from '@/components/product/StockAlertForm';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { useLocale } from '@/hooks/useLocale';
import { useStore } from '@/store/useStore';
import { formatPrice, formatPercent, toPersianNumber, formatNumber } from '@/i18n';
import type { Product, Bundle, Review } from '@/types';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { HiOutlineShoppingCart, HiOutlineHeart, HiHeart, HiMinus, HiPlus, HiCheck, HiOutlineShare, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh } from 'react-icons/hi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const { locale, dict } = useLocale();
  const setCartCount = useStore(s => s.setCartCount);
  const addRecentlyViewed = useStore(s => s.addRecentlyViewed);
  const { addCompare, compareIds } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [alsoBought, setAlsoBought] = useState<Product[]>([]);
  const [productBundles, setProductBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'shipping'>('desc');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        if (!data.product) { setLoading(false); return; }
        setProduct(data.product);
        setRelated(data.related || []);
        setAlsoBought(data.alsoBought || []);
        setAvgRating(data.averageRating || 0);
        setReviewCount(data.reviewCount || 0);
        setLoading(false);
        addRecentlyViewed(data.product.id);

        const sizes = (() => { try { return JSON.parse(data.product.sizes || '[]'); } catch { return []; } })();
        const colors = (() => { try { return JSON.parse(data.product.colors || '[]'); } catch { return []; } })();
        if (sizes.length > 0) setSelectedSize(sizes[0]);
        if (colors.length > 0) setSelectedColor(colors[0]);

      })
      .catch(() => { setLoading(false); });

    fetch(`/api/reviews?product_id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(() => {});

    fetch(`/api/bundles?product_id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProductBundles(data);
      })
      .catch(() => {});
  }, [id]);

  const refreshReviews = () => {
    fetch(`/api/reviews?product_id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
        if (data.average !== undefined) setAvgRating(data.average);
        if (data.count !== undefined) setReviewCount(data.count);
      });
  };

  const addToCart = async () => {
    if (!session) {
      toast.error(locale === 'fa' ? 'لطفاً ابتدا وارد شوید' : 'Please login first');
      return;
    }
    if (!selectedSize) {
      toast.error(dict.product.selectSize);
      return;
    }
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, quantity, size: selectedSize, color: selectedColor }),
    });
    if (res.ok) {
      const data = await res.json();
      setCartCount(data.cartCount);
      toast.success(dict.product.addedToCart);
    }
  };

  const toggleWishlist = async () => {
    if (!session) {
      toast.error(locale === 'fa' ? 'لطفاً ابتدا وارد شوید' : 'Please login first');
      return;
    }
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.action === 'added');
      toast.success(data.action === 'added' ? dict.product.addToWishlist : dict.product.removeFromWishlist);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <ProductDetailSkeleton />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-6xl font-black text-gradient mb-4">{locale === 'fa' ? '۴۰۴' : '404'}</h1>
          <p className="text-gray-400 mb-8">{locale === 'fa' ? 'محصول مورد نظر یافت نشد' : 'Product not found'}</p>
          <a href="/products" className="btn-gold">{locale === 'fa' ? 'مشاهده محصولات' : 'View Products'}</a>
        </main>
        <Footer />
      </>
    );
  }

  const name = locale === 'fa' ? product.name_fa : product.name_en;
  const description = locale === 'fa' ? product.description_fa : product.description_en;
  const sizes: string[] = JSON.parse(product.sizes || '[]');
  const colors: string[] = JSON.parse(product.colors || '[]');
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discount_price!) / product.price) * 100) : 0;
  const finalPrice = hasDiscount ? product.discount_price! : product.price;

  const saleEnd = new Date();
  saleEnd.setDate(saleEnd.getDate() + 3);

  const tabs = [
    { key: 'desc' as const, label: locale === 'fa' ? 'توضیحات' : 'Description' },
    { key: 'reviews' as const, label: `${locale === 'fa' ? 'نظرات' : 'Reviews'} (${locale === 'fa' ? toPersianNumber(reviewCount) : reviewCount})` },
    { key: 'shipping' as const, label: locale === 'fa' ? 'ارسال و بازگشت' : 'Shipping & Returns' },
  ];

  const jsonLd = (() => {
    const imgs: string[] = (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })();
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image: imgs[0] || '',
      brand: { '@type': 'Brand', name: 'Z7shop' },
      offers: {
        '@type': 'Offer',
        price: finalPrice,
        priceCurrency: 'IRR',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
      ...(avgRating > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount } } : {}),
    };
  })();

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: dict.common.home, href: '/' },
          { label: dict.common.products, href: '/products' },
          { label: name },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-6">
          {/* Image Gallery */}
          <div className="relative">
            {hasDiscount && (
              <div className="absolute top-4 start-4 z-20 flex flex-col gap-2">
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                  {formatPercent(discountPercent, locale)}
                </span>
              </div>
            )}
            {product.is_new && (
              <span className="absolute top-4 end-4 z-20 bg-gradient-to-r from-gold to-gold-light text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                {locale === 'fa' ? 'جدید' : 'NEW'}
              </span>
            )}
            <ImageGallery images={(() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })()} name={name} />
          </div>

          {/* Product Info */}
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={avgRating} size="sm" />
              <button onClick={() => setActiveTab('reviews')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gold transition-colors">
                {locale === 'fa' ? `${toPersianNumber(reviewCount)} نظر` : `${reviewCount} reviews`}
              </button>
              <span className="text-gray-700">|</span>
              <button onClick={() => setShowShare(!showShare)} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gold transition-colors flex items-center gap-1">
                <HiOutlineShare className="w-4 h-4" />
                {locale === 'fa' ? 'اشتراک‌گذاری' : 'Share'}
              </button>
            </div>

            {showShare && (
              <div className="mb-4 animate-fade-in">
                <SocialShare url={typeof window !== 'undefined' ? window.location.href : ''} title={name} />
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              {hasDiscount ? (
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-3xl font-black text-gold">
                    {formatPrice(product.discount_price!, locale)} {dict.common.currency}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.price, locale)}
                  </span>
                  <span className="bg-red-500/10 text-red-400 text-sm font-bold px-3 py-1 rounded-full">
                    {locale === 'fa' ? `${formatPercent(discountPercent, locale)} تخفیف` : `${discountPercent}% OFF`}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-black">
                  {formatPrice(product.price, locale)} {dict.common.currency}
                </span>
              )}
            </div>

            {/* Countdown for discounted items */}
            {hasDiscount && <CountdownTimer endDate={saleEnd.toISOString()} />}

            {/* Stock */}
            <div className="mb-5">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <HiCheck className="w-4 h-4" /> {dict.product.inStock}
                  </span>
                  {product.stock <= 10 && (
                    <span className="text-orange-400 text-xs">
                      ({locale === 'fa' ? `فقط ${toPersianNumber(product.stock)} عدد` : `Only ${product.stock} left`})
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <span className="text-red-400 text-sm">{dict.product.outOfStock}</span>
                  <StockAlertForm productId={product.id} userEmail={session?.user?.email || undefined} />
                </>
              )}
            </div>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm">{dict.product.size}: <span className="text-gold">{selectedSize}</span></h3>
                  <button onClick={() => setShowSizeGuide(true)} className="text-xs text-gold hover:underline">
                    {locale === 'fa' ? 'راهنمای سایز' : 'Size Guide'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] h-11 px-4 rounded-xl border-2 text-sm font-medium transition-all ${selectedSize === s ? 'border-gold bg-gold/10 text-gold scale-105' : 'border-gray-700 hover:border-gold/50'}`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-sm mb-3">{dict.product.color}</h3>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === c ? 'border-gold scale-110 ring-2 ring-gold/30' : 'border-gray-600'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-bold text-sm mb-3">{dict.product.quantity}</h3>
              <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-gray-800 rounded-s-xl transition-colors">
                  <HiMinus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold">{locale === 'fa' ? toPersianNumber(quantity) : quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-gray-800 rounded-e-xl transition-colors">
                  <HiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button onClick={addToCart} disabled={product.stock === 0} className="btn-gold flex-1 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                <HiOutlineShoppingCart className="w-5 h-5" />
                {dict.product.addToCart}
              </button>
              <button onClick={toggleWishlist} className="btn-outline p-4">
                {liked ? <HiHeart className="w-6 h-6 text-red-500" /> : <HiOutlineHeart className="w-6 h-6" />}
              </button>
              <button onClick={() => { addCompare(String(id)); toast.success(locale === 'fa' ? 'به لیست مقایسه اضافه شد' : 'Added to compare'); }} className="btn-outline p-4" title={locale === 'fa' ? 'مقایسه' : 'Compare'}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="trust-badge grid grid-cols-3 gap-3 p-4 rounded-xl">
              <div className="flex flex-col items-center text-center gap-1.5">
                <HiOutlineTruck className="w-5 h-5 text-gold" />
                <span className="text-[11px]">{locale === 'fa' ? 'ارسال سریع' : 'Fast Delivery'}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <HiOutlineShieldCheck className="w-5 h-5 text-gold" />
                <span className="text-[11px]">{locale === 'fa' ? 'ضمانت اصالت' : 'Authentic'}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <HiOutlineRefresh className="w-5 h-5 text-gold" />
                <span className="text-[11px]">{locale === 'fa' ? 'بازگشت ۷ روزه' : '7-Day Return'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16 border-t border-gray-200 dark:border-gray-800/50 pt-8">
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800/50 mb-8 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.key ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >{tab.label}</button>
            ))}
          </div>

          {/* Description Tab */}
          {activeTab === 'desc' && (
            <div className="animate-fade-in max-w-3xl">
              <p className="text-gray-600 dark:text-gray-400 leading-8 text-sm">{description}</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="surface-card p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{locale === 'fa' ? 'جنس' : 'Material'}</p>
                  <p className="text-sm font-medium">{locale === 'fa' ? 'پنبه و پلی‌استر' : 'Cotton & Polyester'}</p>
                </div>
                <div className="surface-card p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{locale === 'fa' ? 'فصل' : 'Season'}</p>
                  <p className="text-sm font-medium">{locale === 'fa' ? 'چهار فصل' : 'All Seasons'}</p>
                </div>
                <div className="surface-card p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{locale === 'fa' ? 'شست‌وشو' : 'Wash'}</p>
                  <p className="text-sm font-medium">{locale === 'fa' ? 'قابل شست‌وشو با ماشین' : 'Machine Washable'}</p>
                </div>
                <div className="surface-card p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{locale === 'fa' ? 'ساخت' : 'Origin'}</p>
                  <p className="text-sm font-medium">{locale === 'fa' ? 'ترکیه' : 'Turkey'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <div className="card p-6 text-center">
                  <p className="text-5xl font-black text-gold mb-2">{avgRating.toFixed(1)}</p>
                  <StarRating rating={avgRating} size="md" />
                  <p className="text-sm text-gray-500 mt-2">
                    {locale === 'fa' ? `از ${toPersianNumber(reviewCount)} نظر` : `Based on ${reviewCount} reviews`}
                  </p>
                  <div className="mt-4 border-t border-gray-700/30 pt-4">
                    <ReviewForm productId={String(id)} onSubmit={refreshReviews} />
                  </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      {locale === 'fa' ? 'هنوز نظری ثبت نشده. اولین نفر باشید!' : 'No reviews yet. Be the first!'}
                    </div>
                  ) : (
                    reviews.map((review: any) => (
                      <ReviewCard key={review.id} userName={review.user_name || review.userName || ''} rating={review.rating} title={review.title} comment={review.comment} date={review.created_at || review.date || ''} />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="animate-fade-in max-w-2xl space-y-6">
              <div className="flex gap-4 items-start">
                <HiOutlineTruck className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">{locale === 'fa' ? 'روش‌های ارسال' : 'Shipping Methods'}</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
                    <li>{locale === 'fa' ? '• ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان (۵ تا ۷ روز)' : '• Free shipping on orders over 500K (5-7 days)'}</li>
                    <li>{locale === 'fa' ? '• ارسال عادی: ۲۵,۰۰۰ تومان (۳ تا ۵ روز)' : '• Standard: 25,000T (3-5 days)'}</li>
                    <li>{locale === 'fa' ? '• ارسال سریع: ۴۵,۰۰۰ تومان (۱ تا ۲ روز)' : '• Express: 45,000T (1-2 days)'}</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <HiOutlineRefresh className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">{locale === 'fa' ? 'سیاست بازگشت' : 'Return Policy'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{locale === 'fa' ? 'بازگشت کالا تا ۷ روز پس از دریافت، به شرط عدم استفاده و داشتن برچسب. هزینه ارسال بازگشت بر عهده مشتری است.' : 'Returns accepted within 7 days of receipt, provided the item is unused with tags attached. Return shipping costs are the customer\'s responsibility.'}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <HiOutlineShieldCheck className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">{locale === 'fa' ? 'ضمانت اصالت' : 'Authenticity Guarantee'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{locale === 'fa' ? 'تمامی محصولات Z7shop دارای ضمانت اصالت و کیفیت هستند.' : 'All Z7shop products come with authenticity and quality guarantee.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-gray-200 dark:border-gray-800/50 pt-8">
            <h2 className="text-2xl font-bold mb-8">{dict.product.related}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Also Bought */}
        {alsoBought.length > 0 && (
          <section className="mt-16 border-t border-gray-200 dark:border-gray-800/50 pt-8">
            <h2 className="text-2xl font-bold mb-8">{locale === 'fa' ? 'مشتریان این محصول، این‌ها رو هم خریدن' : 'Customers Also Bought'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {alsoBought.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Product Bundles */}
        {productBundles.length > 0 && (
          <section className="mt-16 border-t border-gray-200 dark:border-gray-800/50 pt-8">
            <h2 className="text-2xl font-bold mb-4">{locale === 'fa' ? 'این محصول در پکیج زیر موجوده' : 'This product is part of a bundle'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {productBundles.map((b: any) => {
                const bName = locale === 'fa' ? b.name_fa : b.name_en;
                const bProducts = b.products || [];
                const total = bProducts.reduce((s: number, p: any) => s + (p.discount_price || p.price), 0);
                const discounted = Math.round(total * (1 - b.discount_percent / 100));
                return (
                  <div key={b.id} className="card p-4 border border-gold/20 rounded-xl">
                    <h3 className="font-bold text-gold mb-2">{bName}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {bProducts.slice(0, 4).map((p: any) => {
                        const imgs: string[] = (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })();
                        return (
                          <Image key={p.id} src={imgs[0] || '/images/placeholder.svg'} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-gold">{formatPrice(discounted, locale)} {dict.common.currency}</span>
                      <span className="text-gray-500 line-through text-xs">{formatPrice(total, locale)}</span>
                      <span className="text-red-400 text-xs font-bold">{b.discount_percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />

      {/* Modals */}
      {showSizeGuide && <SizeGuide open={showSizeGuide} onClose={() => setShowSizeGuide(false)} />}

      {/* Sticky Mobile Bar */}
      <StickyMobileBar price={product.price} discountPrice={product.discount_price ?? undefined} onAddToCart={addToCart} disabled={product.stock === 0} />
    </>
  );
}
