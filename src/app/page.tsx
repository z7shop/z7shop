import HomeClient from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://z7shop.ir/#organization',
      name: 'Z7shop',
      url: 'https://z7shop.ir',
      logo: 'https://z7shop.ir/icons/icon.svg',
      description: 'فروشگاه آنلاین پوشاک مردانه - خرید لباس مردانه با ضمانت اصالت',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+982112345678',
        contactType: 'customer service',
        availableLanguage: ['Persian', 'English'],
      },
      sameAs: [
        'https://instagram.com/z7shop',
        'https://t.me/z7shop',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://z7shop.ir/#website',
      url: 'https://z7shop.ir',
      name: 'Z7shop',
      publisher: { '@id': 'https://z7shop.ir/#organization' },
      inLanguage: ['fa-IR', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://z7shop.ir/products?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://z7shop.ir/#webpage',
      url: 'https://z7shop.ir',
      name: 'Z7shop | فروشگاه آنلاین پوشاک مردانه',
      isPartOf: { '@id': 'https://z7shop.ir/#website' },
      about: { '@id': 'https://z7shop.ir/#organization' },
      description: 'خرید آنلاین لباس مردانه با ضمانت اصالت، ارسال سریع و بازگشت ۷ روزه',
      inLanguage: 'fa-IR',
    },
  ],
};

async function fetchJSON(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const [featuredData, newData, cats, bundlesData] = await Promise.all([
    fetchJSON(`${base}/api/products?featured=true&limit=8`),
    fetchJSON(`${base}/api/products?new=true&limit=8`),
    fetchJSON(`${base}/api/categories`),
    fetchJSON(`${base}/api/bundles`),
  ]);

  const featured = featuredData?.products || [];
  const newArrivals = newData?.products || [];
  const categories = cats || [];
  const bundles = Array.isArray(bundlesData) ? bundlesData : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient
        initialFeatured={featured}
        initialNewArrivals={newArrivals}
        initialCategories={categories}
        initialBundles={bundles}
      />
    </>
  );
}
