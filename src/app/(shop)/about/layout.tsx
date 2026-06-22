import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'درباره ما - داستان Z7shop',
  description: 'با Z7shop آشنا شوید. فروشگاه آنلاین پوشاک مردانه با تعهد به کیفیت بی‌نظیر، ارسال سریع سراسری و پشتیبانی ۲۴ ساعته. بیش از ۵۰۰ محصول و ۱۰ هزار مشتری راضی.',
  alternates: {
    canonical: 'https://z7shop.ir/about',
  },
  openGraph: {
    title: 'درباره ما | Z7shop',
    description: 'داستان Z7shop - فروشگاه پوشاک مردانه با کیفیت و قیمت مناسب',
    url: 'https://z7shop.ir/about',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
