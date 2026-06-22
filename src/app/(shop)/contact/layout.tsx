import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تماس با ما - پشتیبانی Z7shop',
  description: 'با تیم پشتیبانی Z7shop در تماس باشید. شماره تلفن، ایمیل، آدرس و فرم تماس. پاسخگویی سریع و پشتیبانی ۲۴ ساعته.',
  alternates: {
    canonical: 'https://z7shop.ir/contact',
  },
  openGraph: {
    title: 'تماس با ما | Z7shop',
    description: 'راه‌های ارتباط با فروشگاه Z7shop - تلفن، ایمیل و فرم تماس',
    url: 'https://z7shop.ir/contact',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
