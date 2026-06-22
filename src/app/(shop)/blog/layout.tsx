import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مجله مد و استایل مردانه - وبلاگ Z7shop',
  description: 'آخرین مطالب درباره مد مردانه، راهنمای ست کردن لباس، ترندهای فصلی و نکات استایل. مجله آنلاین Z7shop برای مردان خوش‌پوش.',
  alternates: {
    canonical: 'https://z7shop.ir/blog',
  },
  openGraph: {
    title: 'مجله مد مردانه | Z7shop',
    description: 'مطالب و مقالات مد مردانه، استایل و ترندهای روز',
    url: 'https://z7shop.ir/blog',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
