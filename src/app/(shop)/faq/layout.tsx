import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سوالات متداول - راهنمای خرید از Z7shop',
  description: 'پاسخ سوالات رایج درباره خرید، ارسال، بازگشت کالا، روش‌های پرداخت و حساب کاربری در فروشگاه Z7shop. راهنمای کامل خرید آنلاین.',
  alternates: {
    canonical: 'https://z7shop.ir/faq',
  },
  openGraph: {
    title: 'سوالات متداول | Z7shop',
    description: 'پاسخ به سوالات رایج درباره خرید از فروشگاه Z7shop',
    url: 'https://z7shop.ir/faq',
    type: 'website',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
