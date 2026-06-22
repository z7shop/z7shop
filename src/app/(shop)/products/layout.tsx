import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'محصولات پوشاک مردانه - تی‌شرت، شلوار، کفش و لباس ورزشی',
  description: 'مشاهده و خرید انواع پوشاک مردانه شامل تی‌شرت، شلوار، کفش، کلاه و لباس ورزشی. فیلتر بر اساس قیمت، رنگ و سایز. ارسال سریع با ضمانت اصالت.',
  keywords: ['خرید تی‌شرت مردانه', 'شلوار مردانه', 'کفش مردانه', 'لباس ورزشی مردانه', 'پوشاک مردانه آنلاین'],
  alternates: {
    canonical: 'https://z7shop.ir/products',
  },
  openGraph: {
    title: 'محصولات پوشاک مردانه | Z7shop',
    description: 'خرید انواع لباس مردانه با بهترین قیمت و ضمانت اصالت',
    url: 'https://z7shop.ir/products',
    type: 'website',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
